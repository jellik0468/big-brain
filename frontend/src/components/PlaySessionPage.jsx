import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import videoBg from '../assets/videoBg.mp4'
import { useGames } from './context/useGames';

// Helper function to get youtube link and play with iframe
function YouTubeEmbed({ url }) {
  if (!url) return null;

  // extrac Youtube video ID
  const id = url.split('v=')[1]?.split('&')[0] ?? '';
  const embedUrl = `https://www.youtube.com/embed/${id}`;

  return (
    <div className="mb-4 aspect-video w-full rounded overflow-hidden">
      <iframe
        title="YouTube preview"
        aria-label={'Embedded YouTube video'}
        src={embedUrl}
        allow="autoplay;"
        aria-hidden="true"
        className="w-full h-full"
      />
    </div>
  );
}

// Helper funcction to place  media
// If video doesn't exist check image else no media shown
function QuestionMedia({ media }) {
  if (!media) return null;

  // if the question has a video
  if (media.videoUrl) {
    return (
      <YouTubeEmbed url={media.videoUrl} />
    );
  }

  // Else if a image exist
  if (media.imageUrl) {
    return (
      <img
        src={media.imageUrl}
        alt="Question media"
        className="mb-4 max-w-full object-contain rounded"
      />
    );
  }
  
  return null;
}

  
function PlaySessionPage() {
  const { sessionId } = useParams();
  const { games } = useGames();
  const playerId = localStorage.getItem(`player_${sessionId}`);

  // 1. Status polling
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // 2. Question polling
  const [question, setQuestion] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  // 3. Track history of asked questions
  const [askedQuestions, setAskedQuestions] = useState([]);

  //4. Selection state: null until a question arrives, then [] or a number
  const [selected, setSelected] = useState(null);

  // 5. Timer + correct‐answer state
  const [remainingTime, setRemainingTime] = useState(0);
  const [correctAnswersArr, setCorrectAnswersArr] = useState(null);

  // 6. Immediate correctness & points for each question
  const [isCorrect, setIsCorrect] = useState(null);  // null until checked, then true/false
  const [earnedPoints, setEarnedPoints] = useState(0);

  // 7. Final results once sessionEnded, fetch this from the server:
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // fetch current game to get if advance scoring system is on for current game
  const game = Object.values(games).find(g => String(g.prevSessionId) === sessionId);
  const useAdvancedScoring = !!game.useAdvancedScoring;

  // Poll /status
  useEffect(() => {
    // Don’t poll status once session has ended
    if (!playerId || sessionEnded) return;

    let cancelled = false;
        
    const checkStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5005/play/${playerId}/status`
        );

        if (!cancelled) setHasStarted(res.data.started);
      } catch (err) {
        const msg = err.response.data.error;

        if (msg === "Session ID is not an active session") {
          if (!cancelled) setSessionEnded(true);
          return;
        }
      } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    };

    checkStatus();
    const iv = setInterval(checkStatus, 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [playerId, sessionEnded]);

  // Poll /question once started
  useEffect(() => {
    if (!hasStarted || !playerId || sessionEnded) return;
    let cancelled = false;

    const fetchQuestion = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5005/play/${playerId}/question`
        );

        const q = res.data.question;

        if (!cancelled) {
          setQuestion(prev => {
            if (!prev || prev.isoTimeLastQuestionStarted !== q.isoTimeLastQuestionStarted) {
              setAskedQuestions(prevList => {
                // Check if it's already in the list
                const exists = prevList.some(
                  existing => existing.isoTimeLastQuestionStarted === 
                    q.isoTimeLastQuestionStarted
                );

                return exists ? prevList : [...prevList, q]; // add to pass list
              }); 
              return q; // update the current question

            }

            return prev; // no change
          });
        }
      } catch (err) {
        const msg = err.response.data.error;

        if (msg === "Session ID is not an active session") {
          if (!cancelled) setSessionEnded(true);
          return;
        }

        console.log('Question fetch failed', err);
      }
    };

    fetchQuestion();
    const iv = setInterval(fetchQuestion, 1000);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [hasStarted, playerId, sessionEnded]);

  // When the session ends, load the full results
  useEffect(() => {
    if (!sessionEnded) return;

    let cancelled = false;
    setLoadingResults(true);
        
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5005/play/${playerId}/results`);

        if (!cancelled) setResults(res.data);

      } catch (err) {
        console.log("Failed to fetch results", err);
      } finally {
        if (!cancelled) setLoadingResults(false);
      }
    };

    fetchResults();
    
    return () => {
      cancelled = true;
    };
  }, [sessionEnded, playerId]);
  

  // Reset selection, timer, correct answers, correctness on new question
  useEffect(() => {
    if (!question) return;

    setSelected(question.type === 'multiple' ? [] : null);
    setCorrectAnswersArr(null);
    setIsCorrect(null);
    setEarnedPoints(0);

    // compute initial remainingTime
    const startMs = new Date(question.isoTimeLastQuestionStarted).getTime();
    const endMs   = startMs + question.duration * 1000;
    setRemainingTime(Math.max(0, Math.ceil((endMs - Date.now()) / 1000)));
  }, [question]);

  // Countdown + fetch correct answers & compute correctness
  useEffect(() => {
    if (!question || sessionEnded) return;
    let cancelled = false;

    const startMs = new Date(question.isoTimeLastQuestionStarted).getTime();
    const endMs = startMs + question.duration * 1000;

    const tick = async () => {
      const timeLeft = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
      if (cancelled) return;
      setRemainingTime(timeLeft);

      if (timeLeft === 0 && correctAnswersArr === null) {
        try {
          const res = await axios.get(
            `http://localhost:5005/play/${playerId}/answer`
          );

          const correctArr = res.data.answers || [];
          setCorrectAnswersArr(correctArr);

          // compute user's answers
          const userArr = question.type === 'multiple'
            ? (Array.isArray(selected) ? selected : []).map(i => question.answers[i])
            : selected !== null
              ? [question.answers[selected]]
              : [];

          // determine correctness
          const correctSet = new Set(correctArr);
          const correct =
            userArr.length === correctSet.size &&
            userArr.every(ans => correctSet.has(ans));

          // Setting state
          setIsCorrect(correct);
          setEarnedPoints(correct ? question.points : 0);
        } catch (err) {
          console.log('Failed to fetch correct answer', err);
        }
      }
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [question, selected, correctAnswersArr, playerId, sessionEnded]);

  // Handle user selecting an option by index
  const handleSelect = index => {
    if (remainingTime <= 0 || correctAnswersArr !== null || sessionEnded) {
      // no changes allowed after time's up, correct answer is shown 
      // and prevent it is called when  sessionEnded
      return;
    }

    let next = question.type === 'multiple'
      ? (Array.isArray(selected) ? selected : []).includes(index)
        ? selected.filter(i => i !== index)
        : [...selected, index]
      : index;

    setSelected(next);

    // Build payload as array of strings
    const answersPayload =
      question.type === 'multiple'
        ? (Array.isArray(next) ? next : []).map(i => question.answers[i])
        : [question.answers[next]];

    axios.put(`http://localhost:5005/play/${playerId}/answer`, {
      answers: answersPayload
    })
  };
    
  // Render logic
  if (sessionEnded && !question) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow-lg text-center">
          <span className="block text-lg font-semibold">
            The session has been ended by the host
          </span>
        </div>
      </div>
    )
  }


  if (loadingStatus) {
    return <p className="text-center mt-10">Checking game status…</p>;
  }

  // Background video when player is in lobby waiting
  if (!hasStarted) {
    return (
      <div className="relative w-full h-screen bg-black">
        {/* Text Header area */}
        <div className="w-full h-[100px] flex items-center z-10 px-10 relative">
          <p className="font-medium text-white text-2xl sm:text-4xl md:text-4xl lg:text-6xl">
            Please wait for the host to start the game…
          </p>
        </div>
    
        <video
          src={videoBg}
          autoPlay
          loop
          className="absolute w-full h-[calc(100vh-100px)] object-contain bg-black"
        />
      </div>
    );
  }

    if (!question && !sessionEnded) {
        return <p className="text-center mt-10">Loading question…</p>;
    }

    // Final performance screen

    if (sessionEnded) {
        if (loadingResults || !results) {
            return <p className="text-center mt-10">Loading final results…</p>;
        }
        return (
            <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center px-4">
                <div className="max-w-5xl w-full bg-gray-800 text-white rounded-lg shadow-lg p-6 overflow-auto">
                    <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Your Results</h2>
                        <div className="overflow-x-auto">
                            <p className='text-center pb-4'>
                                🧮 <b>Advanced Scoring is applied:</b> Your score is based on how quickly you answer.<br />
                                If correct, your points are calculated as:<br />
                                Points = (1 - TimeTaken ÷ Duration) * Question Points
                            </p>
                            <table className="w-full text-left border-collapse" aria-labelledby="results-heading">
                                <thead>
                                    <tr className="bg-gray-700 text-sm uppercase tracking-wider">
                                        <th className="py-3 px-4 rounded-tl-lg">#</th>
                                        <th className="py-3 px-4">Question</th>
                                        <th className="py-3 px-4">Your Answer</th>
                                        <th className="py-3 px-4">Correct</th>
                                        <th className="py-3 px-4">Points</th>
                                        <th className="py-3 px-4 rounded-tr-lg">Time (s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {askedQuestions.map((q, i) => {
                                        const r = results.find(r => r.questionStartedAt === q.isoTimeLastQuestionStarted);

                                        const timeTaken = r?.answeredAt
                                            ? Math.ceil((new Date(r.answeredAt).getTime() - new Date(r.questionStartedAt).getTime()) / 1000)
                                            : 0;

                                        let pts = 0;
                                        if (r?.correct) {
                                            if (useAdvancedScoring) {
                                                const speedFactor = Math.max(0, (q.duration - timeTaken) / q.duration);
                                                pts = Math.round(q.points * speedFactor);
                                            } else {
                                                pts = q.points;
                                            }
                                        }
                                    
                                        return (
                                            <tr
                                                key={i}
                                                className={`border-t border-gray-700 ${
                                                    i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'
                                                } hover:bg-gray-700 transition duration-200`}
                                            >
                                                <td className="py-3 px-4">{i + 1}</td>
                                                <td className="py-3 px-4 break-words">{q.text}</td>
                                                <td className="py-3 px-4 break-words">{r ? r.answers.join(', ') : '—'}</td>
                                                <td className="py-3 px-4">{r ? (r.correct ? '✔️' : '❌') : '❌'}</td>
                                                <td className="py-3 px-4">{pts}</td>
                                                <td className="py-3 px-4">{r ? timeTaken : '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                </div>
            </div>
        );
    }

    // Question UI
    return (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-xl w-full p-6 mt-10 bg-gray-800 rounded-lg shadow-lg text-white">
                {/* Inserting media */}
                <QuestionMedia media={question.media} />

                {/* Question text */}
                <h2 className="text-2xl font-bold mb-3">{question.text}</h2>
    
                {/* Timer */}
                <p className="mb-4 font-mono text-blue-400 text-sm">
                    Time Remaining: <span className="font-semibold">{remainingTime}s</span>
                </p>
    
                {/* Answer options */}
                <form className="space-y-3" aria-labelledby="question-label">
                    {question?.answers?.map((ans, index) => {
                        const id = `opt-${index}`;
                        const isChecked = question.type === 'multiple'
                            ? Array.isArray(selected) && selected.includes(index)
                            : selected === index;
    
                        return (
                            <div
                                key={id}
                                className={`flex items-start gap-3 p-3 rounded border 
                                ${
                                    isChecked
                                        ? 'bg-gray-700 border-green-500'
                                        : 'bg-gray-700 border-gray-600'
                                }
                                hover:border-blue-400 transition`}
                            >
                                <input
                                    id={id}
                                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                    name="answer"
                                    checked={isChecked}
                                    onChange={() => handleSelect(index)}
                                    disabled={remainingTime <= 0 || correctAnswersArr !== null}
                                    className='mt-1'
                                />
                                <label htmlFor={id} className="cursor-pointer">
                                    {ans}
                                </label>
                            </div>
                        );
                    })}
                </form>
    
                {/* Selected */}
                <p className="mt-5 text-sm text-gray-300 italic">
                    <strong>Selected:</strong>{' '}
                    {question.type === 'multiple'
                        // construct a literal string to match database
                        ? (Array.isArray(selected) ? selected : [])
                            .map(i => `"${question.answers[i]}"`)
                            .join(', ')
                        : selected !== null
                        ? `"${question.answers[selected]}"`
                        : 'none'}
                </p>
    
                {/* Result/ Feedback */}
                {correctAnswersArr && (
                    <div className="mt-6 p-5 bg-gray-700 rounded-lg border border-gray-600">
                        <p className="font-semibold mb-2">Correct Answer(s):</p>
                        <ul className="list-disc list-inside mb-4">
                            {correctAnswersArr.map((corAns, i) => (
                                <li key={i}>{corAns}</li>
                            ))}
                        </ul>
    
                        {isCorrect !== null && (
                            <p
                                className={`font-bold text-lg ${
                                    isCorrect ? 'text-green-400' : 'text-red-400'
                                }`}
                            >
                                {isCorrect
                                    ? `🎉 You got it! +${earnedPoints} points`
                                    : 'Oopsss—that wasn’t quite right. +0 points'}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlaySessionPage;