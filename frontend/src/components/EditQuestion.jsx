import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import Modal from './Modal';

function EditQuestion() {
    const params = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    //setting up all the state field to keep track of value
    const [question, setQuestion] = useState(null);
    const [questionType, setQuestionType] = useState("single") // default single for dropdown box purpose
    const [questionText, setQuestionText] = useState("");
    const [duration, setDuration] = useState(30); // default 30 like kahoot
    const [points, setPoints] = useState(0);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [imageBase64, setImageBase64] = useState("");
    const [answers, setAnswers] = useState(["", ""]);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [imageInputKey, setImageInputKey] = useState(Date.now());

    //modal
    const [openEmptyQuestionModal, setOpenEmptyQuestionModal] = useState(false);
    const [openLessThanTwoAnswerModal, setOpenLessThanTwoAnswerModal] = useState(false);
    const [openNoCorrectAnswerModal, setOpenNoCorrectAnswerModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    // Updates question when question type changes, we clear every answers entered when update
    useEffect(() => {
        if (questionType === "single" || questionType === "multiple") {
            // Ensure at least two empty answers
            setAnswers(["", ""]);
            setCorrectAnswers([]);
        } else if (questionType === "judgement") {
            // For judgement True false
            setAnswers(["True", "False"]);
            setCorrectAnswers([]);
        }
    }, [questionType]);

    // When we load or refresh the page call fetchGameAndQuestion reload the page
    useEffect(() => {
        const fetchGameAndQuestion = async () => {
            try {
                const res = await axios.get('http://localhost:5005/admin/games', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const game = res.data.games.find(g => String(g.id) === params.gameId);
                const q = game?.questions[params.questionId];
                if (!q) return alert("Question not found!!!");

                // Loading all the existing value if not exist use default
                setQuestion(q);
                setQuestionType(q.type || "single");
                setQuestionText(q.text || "");
                setDuration(q.duration || 30);
                setPoints(q.points || 0);
                
                // pull media out of the database else dEfalt it  to empty
                const media = q.media || {};
                setYoutubeUrl(media.videoUrl || "");
                setImageBase64(media.imageUrl || "");

                setAnswers(q.answers || ["", ""]);
                // stores correct answers by index of answers
                setCorrectAnswers(
                    Array.isArray(q.correctAnswers)
                    ? q.correctAnswers.map(ans => q.answers.indexOf(ans)).filter(i => i >= 0)
                    : []
                );
            } catch (err) {
                alert(err);
            }
        };
    
        fetchGameAndQuestion();
    }, [params.gameId, params.questionId, token]);

    // Converting image
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Removing uploaded Image
    const handleDeleteImg = (e) => {
        setImageBase64(null);
        setImageInputKey(Date.now());
    }

    // Removing typed in url
    const handleDeleteUrl = (e) => {
        setYoutubeUrl("");  // Clears the input
    };

    // Sending api to backend to save current edit
    const handleSaveQuestion = async () => {
        if (!questionText || questionText.trim() === '') {
            setModalMessage("You can't have an empty question!")
            setOpenEmptyQuestionModal(true);
            return;
        }
        
        // Ensure at least two valid answers.
        const nonEmptyAnswers = answers.filter(a => a.trim() !== "");
        if (nonEmptyAnswers.length < 2) {
            setModalMessage("You can't have less than two valid answers");
            setOpenLessThanTwoAnswerModal(true);
            return;
        }

        // storing the correct answers indices
        const cleanedCorrectIndexes = correctAnswers.filter(
            index => answers[index] && answers[index].trim() !== ""
        );

        // Ensure at least one answer is correct
        if (cleanedCorrectIndexes.length < 1) {
            setModalMessage("You need to have at least one correct answer");
            setOpenNoCorrectAnswerModal(true);
            return;
        }

        try {
            // Step 1: Fetch all games
            const res = await axios.get('http://localhost:5005/admin/games', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const games = res.data.games;
            const gameIndex = games.findIndex(g => String(g.gameId) === String(params.gameId));
            if (gameIndex === -1) {
                return alert("Game not found!");
            }
    
            // Steo 2 : Copy games and game
            const updatedGames = [...games];
            const updatedGame = { ...updatedGames[gameIndex] };

            // Step 3 : update the specific question
            const updatedQuestion = {
                type: questionType,
                text: questionText,
                duration: duration,
                points: points,
                media: {
                    imageUrl: imageBase64 || null,
                    videoUrl: youtubeUrl || null
                },
                answers: answers,
                correctAnswers: cleanedCorrectIndexes.map(i => answers[i]), // Convert index to literal answer string
            }

            // Step 4 : replace the old question we are editing with the new value 
            const updatedQuestions = [...updatedGame.questions];
            updatedQuestions[Number(params.questionId)] = updatedQuestion;
            updatedGame.questions = updatedQuestions;
    
            updatedGames[gameIndex] = updatedGame;
    
            // Step 5 : Send updated games back to backend
            await axios.put('http://localhost:5005/admin/games', {
                games: updatedGames,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Question updated successfully!");
            navigate(`/game/${params.gameId}`);

        } catch (err) {
            console.error(err);
            alert("Failed to update question.");
        }
    };

    const handleGoBack = () => {
        navigate(`/game/${params.gameId}`);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold">Edit Question {Number(params.questionId) + 1}</h2>

            <label className="block">
                Question Type:
            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full border p-1 rounded">
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="judgement">Judgement</option>
            </select>
            </label>

            <label className="block">
                Question:
                <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="w-full border p-1 rounded" />
            </label>

            <label className="block">
                Time Limit (seconds):
                <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border p-1 rounded" />
            </label>

            <label className="block">
                Points:
                <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full border p-1 rounded" />
            </label>

            <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 w-full">
                    YouTube URL (optional):
                    <input
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="flex-1 border p-1 rounded"
                    />
                </label>
                {/* Only show up when the URL has content in it */}
                {youtubeUrl && (
                <button
                    className="border p-2 rounded-xl whitespace-nowrap hover:bg-gray-300"
                    onClick={handleDeleteUrl}
                >
                    Delete URL
                </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <label className="block">
                    Upload Image (optional):
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                    key={imageInputKey}
                    className="block w-full text-sm text-gray-700
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border file:mb-3
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-200
                                file:cursor-pointer"
                    />
                </label>
                {/* Only show up when the image exist */}
                {imageBase64 && (
                <div className="flex items-center gap-4">
                    <img src={imageBase64} alt="Preview" className="h-32 object-contain" />
                    <button
                        className="border p-2 rounded-xl whitespace-nowrap hover:bg-gray-300"
                        onClick={handleDeleteImg}
                    >
                        Delete Image
                    </button>
                </div>
                )}

            </div>
            
            {/* Answers field */}
            <div>
                <h3 className="font-semibold mb-2">Answer(s)</h3>
                {answers.map((a, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                        <input
                            type="text"
                            value={a}
                            onChange={(e) => {
                                const newAnswers = [...answers];
                                newAnswers[i] = e.target.value;
                                setAnswers(newAnswers);
                            }}
                            className="flex-1 border p-1 rounded"

                            /* Typing not allowed for Judgement question*/
                            disabled={questionType === "judgement"}
                        />

                        <label className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                checked={correctAnswers.includes(i)}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    let newCorrectAnswers;
                                
                                    if (questionType === "single" || questionType === "judgement") {
                                        // Allow only one correct answer
                                        newCorrectAnswers = isChecked ? [i] : [];
                                    } else {
                                        // Allow multiple selections
                                        newCorrectAnswers = isChecked
                                        ? [...correctAnswers, i]
                                        : correctAnswers.filter(index => index !== i);
                                    }
                                
                                    setCorrectAnswers(newCorrectAnswers);
                                }}
                            />
                            Correct
                        </label>

                        {questionType !== "judgement" && (
                        <button
                            onClick={() => {
                                const newAnswers = answers.filter((_, index) => index !== i);

                                const newCorrectAnswers = correctAnswers
                                .filter(index => index !== i)
                                .map(index => (index > i ? index - 1 : index));

                                setAnswers(newAnswers);
                                setCorrectAnswers(newCorrectAnswers);
                            }}

                            className={`text-red-500 border border-red-300 px-2 py-1 rounded hover:bg-red-200 ${
                            // Disable delete when it is <= 2 to enforce two questions at least
                            answers.length <= 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={answers.length <= 2}
                        >
                            Delete
                        </button>
                        )}
                    </div>
                ))}
                {/* Enforcing 6 question most */}
                {answers.length < 6 && questionType !== "judgement" && (
                    <button
                        onClick={() => setAnswers([...answers, ""])}
                        className="mt-2 px-3 py-1 border rounded hover:bg-gray-200"
                    >
                        Add Answer
                    </button>
                )}
            </div>
            
            {/* Save button */}
            <div className="flex gap-4">
                <button
                    onClick={handleSaveQuestion}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Save Question
                </button>

                {/* Go back button */}
                <button
                    onClick={handleGoBack}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go back
                </button>

            </div>

            <Modal open={openEmptyQuestionModal} onClose={() => setOpenEmptyQuestionModal(false)}>
                <div className="text-center">
                    <p className="text-gray-600 mb-6 mt-6">{modalMessage}</p>
                    <button
                        onClick={() => setOpenEmptyQuestionModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </Modal>

            <Modal open={openLessThanTwoAnswerModal} onClose={() => setOpenLessThanTwoAnswerModal(false)}>
                <div className="text-center">
                    <p className="text-gray-600 mb-6 mt-6">{modalMessage}</p>
                    <button
                        onClick={() => setOpenLessThanTwoAnswerModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </Modal>

            <Modal open={openNoCorrectAnswerModal} onClose={() => setOpenNoCorrectAnswerModal(false)}>
                <div className="text-center">
                    <p className="text-gray-600 mb-6 mt-6">{modalMessage}</p>
                    <button
                        onClick={() => setOpenNoCorrectAnswerModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </Modal>
        </div>
    )
}   

export default EditQuestion;