import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';

function EditQuestion() {
    const params = useParams();
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

    // When we load or refresh the page call fetchGameAndQuestion reload the page
    useEffect(() => {
        fetchGameAndQuestion();
    }, []);
    
    // Updates question when question type changes, we clear every answers entered when update
    useEffect(() => {
        if (question === "single" || questionType === "multiple") {
            // Ensure at least two empty answers
            setAnswers(["", ""]);
            setCorrectAnswers([]);
        } else if (questionType === "judgement") {
            // For judgement True false
            setAnswers(["True", "False"]);
            setCorrectAnswers([]);
        }
    }, [questionType]);

    // API call to get the question.
    const fetchGameAndQuestion = async () => {
        try {
            const res = await axios.get('http://localhost:5005/admin/games', {
                headers: { 'Authorization': `Bearer ${token}`},
            });

            // Matching the gameId in website with result fetched
            const game = res.data.games.find(g => {
                return String(g.id) === String(params.gameId);
            });

            // Grabbing the question by index in the question array with the param passed in.
            const q = game?.questions[params.questionId];
            if (!q) return alert("Question not found!!!");
            setQuestion(q);
            setQuestionType(q.type || "single");
            setQuestionText(q.text || "");
            setDuration(q.duration || 30);
            setPoints(q.points || 0);
            setYoutubeUrl(q.youtube || "");
            setImageBase64(q.image || "");
            setAnswers(q.correctAnswers ? q.correctAnswers : ["", ""]);
            setCorrectAnswers(q.correctAnswers || []);
        } catch (err) {
            alert(err);
        }
    }

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

    const handleDeleteUrl = (e) => {
        setYoutubeUrl("");  // Clears the input
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
                            answers.length <= 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={answers.length <= 2}
                        >
                            Delete
                        </button>
                        )}
                    </div>
                ))}

                {answers.length < 6 && questionType !== "judgement" && (
                    <button
                        onClick={() => setAnswers([...answers, ""])}
                        className="mt-2 px-3 py-1 border rounded hover:bg-gray-200"
                    >
                        Add Answer
                    </button>
                )}
            </div>
        </div>
    )
}   

export default EditQuestion;