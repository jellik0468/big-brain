import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PlaySessionPage() {
    const { sessionId } = useParams();
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
                        if (!prev || prev.text !== q.text) {
                            // record this question in history
                            setAskedQuestions(prevList => [...prevList, q]);
                            return q;
                        }
                            return prev;
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
            console.log(res)
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

        // reset correct answers display
        setCorrectAnswersArr(null);

        // compute initial remainingTime
        const startMs = new Date(question.isoTimeLastQuestionStarted).getTime();
        const endMs   = startMs + question.duration * 1000;
        setRemainingTime(Math.max(0, Math.ceil((endMs - Date.now()) / 1000)));
    }, [question?.text]);

    // Countdown + fetch correct answers & compute correctness
    useEffect(() => {
        if (!question || sessionEnded) return;
        let cancelled = false;

        const startMs = new Date(question.isoTimeLastQuestionStarted).getTime();
        const endMs   = startMs + question.duration * 1000;

        const tick = async () => {
            const timeLeft = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
            if (cancelled) return;
            setRemainingTime(timeLeft);

            if (timeLeft === 0 && correctAnswersArr === null) {
              try {
                    const res = await axios.get(
                        `http://localhost:5005/play/${playerId}/answer`
                    );
                    const correctArr = res.data.correctAnswers || [];
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
    if (loadingStatus) {
        return <p className="text-center mt-10">Checking game status…</p>;
    }

    if (!hasStarted) {
        return (
            <p className="text-center mt-10 font-medium text-lg">
              Please wait for the host to start the game…
            </p>
        );
    }

    if (!question && !sessionEnded) {
        return <p className="text-center mt-10">Loading question…</p>;
    }

    // Question UI
    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-gray-800 rounded">
            {/* Question text */}
            <h2 className="text-xl font-bold mb-2 text-white">{question.text}</h2>

            {/* Timer */}
            <p className="mb-4 font-mono text-green-300">
                Time Remaining: {remainingTime}s
            </p>

            {/* Answer options */}
            <form className="space-y-2">
                {question.answers.map((ans, index) => {
                    const id = `opt-${index}`;
                    // Safely check array only if selected is an array
                    const isChecked = question.type === 'multiple'
                        ? Array.isArray(selected) && selected.includes(index)
                        : selected === index;

                    return (
                        <div key={id} className="flex items-center">
                            <input
                                id={id}
                                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                name="answer"
                                checked={isChecked}
                                onChange={() => handleSelect(index)}
                                disabled={remainingTime <= 0 || correctAnswersArr !== null}
                                className="mr-2"
                            />
                            <label htmlFor={id} className="text-white">
                            {ans}
                            </label>
                        </div>
                    );
                })}
            </form>

            <p className="mt-4 text-sm text-gray-300">
                <strong>Selected:</strong>{' '}
                {question.type === 'multiple'
                    ? (Array.isArray(selected) ? selected : [])
                        .map(i => `"${question.answers[i]}"`)
                        .join(', ')
                    : selected !== null
                    ? `"${question.answers[selected]}"`
                    : 'none'}
            </p>
            {correctAnswersArr && (
                <div className="mt-4 p-4 bg-gray-700 rounded text-white">
                    {/* existing correct answer list */}
                    <p className="font-semibold">Correct Answer(s):</p>
                    <ul className="list-disc list-inside mb-4">
                        {correctAnswersArr.map((ca, i) => (
                            <li key={i}>{ca}</li>
                        ))}
                    </ul>
                
                    {/* NEW result line */}
                    {isCorrect !== null && (
                        <p className={
                            isCorrect ? 'text-green-400 font-bold' : 'text-red-400 font-bold'
                            }
                        >
                            {isCorrect
                                ? `You got it! +${earnedPoints} points`
                                : `Oops—that wasn’t quite right. +0 points`}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PlaySessionPage;