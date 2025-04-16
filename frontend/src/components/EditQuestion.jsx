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

        </div>
    )
}   

export default EditQuestion;