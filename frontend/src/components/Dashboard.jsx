import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

import {
    BrowserRouter as Router,
    useNavigate,
    Link,
} from "react-router-dom"

function Dashboard() {
    const navigate =  useNavigate();
    const [games, setGames] = useState([]);
    const [open, setOpen] = useState(false);
    const [gameName, setGameName] = useState('');
    const [thumbnail, setThumbnail] = useState('');

    const [questions, setQuestions] = useState([
        { duration: '', correctAnswers: '', options: [] }
    ]);

    /*------Managing field in modal------*/
    const addOptionField = (questionIndex) => {
        const updated = [...questions];
        updated[questionIndex].options.push('');
        setQuestions(updated);
    };
      
    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updated = [...questions];
        updated[questionIndex].options[optionIndex] = value;
        setQuestions(updated);
    };
      
    const handleFieldChange = (questionIndex, field, value) => {
        const updated = [...questions];
        updated[questionIndex][field] = value;
        setQuestions(updated);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const updated = [...questions];
        updated[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updated);
    };
      
    const removeQuestion = (questionIndex) => {
        const updated = [...questions];
        updated.splice(questionIndex, 1);
        setQuestions(updated);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result); // base64 string
            };
            reader.readAsDataURL(file);
        }
    };
    /* ------Managing field in modal------*/

    const owner = localStorage.getItem('owner');
    const token = localStorage.getItem('token');
    console.log(token);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async() => {
        try {
            const res = await axios.get('http://localhost:5005/admin/games', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setGames(res.data.games);
        } catch (err) {
            alert(err)
        }
    }

    // Helper function to transform questions to match the API shape
    const transformQuestions = (questions)  => {
        return questions.map(q => ({
            duration: Number(q.duration),
            correctAnswers: q.correctAnswers.split(',').map(a => a.trim())
        }));
    }

    // Function to update game via PUT API
    const handleCreateGame = async () => {
        try {
            const res = await axios.get('http://localhost:5005/admin/games', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const existingGames = res.data.games;

            const newGame = {
                gameName: gameName,
                gameId: Math.floor(Math.random() * 100000000),
                owner: owner,
                active: null,
                questions: transformQuestions(questions),
                thumbnail: thumbnail
            }

            const updatedGames = [...existingGames, newGame];

            await axios.put('http://localhost:5005/admin/games',
                { games: updatedGames },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log(res);
            alert("Game created successfully!");
            () => setOpen(false);
            fetchGames(); // refresh imediately
        } catch (err) {
            console.log(err);
            alert("Failed to create game.");
        }
    }

    return(
        <>
            <div className="">
                <h2 className='text-2xl font-semibold mb-4 text-center border-b m-5 pb-5'>
                    <button className='btn relative bottom-0 right-30 border rounded-xl p-5 cursor-pointer' 
                        onClick={() => setOpen(true)}>Add Game</button>
                        Dashboard</h2> 

                    <Modal open={open} onClose={() => setOpen(false)}>
                        <div className="text-center w-56">
                            <div className="text-center w-56">
                                <h3 className="text-lg font-black text-gray-800">Create New Game</h3>
                                <label htmlFor="gameName">Game Name</label>
                                <input type="text" id="gameName" className='mb-2 border rounded-sm'
                                onChange={(e) =>setGameName(e.target.value)} value={gameName}/>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Add Your Thumbnail <span className="text-gray-400">(Optional)</span>
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-gray-700
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border file:mb-3
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-200
                                                file:cursor-pointer"
                                    />

                                    {thumbnail && (
                                        <div className="mt-4">
                                        <p className="text-sm text-gray-500 text-center">Thumbnail Preview</p>
                                        <img
                                            src={thumbnail}
                                            alt="Thumbnail Preview"
                                            className="mt-2 h-40 w-auto object-contain mx-auto border border-gray-200 rounded shadow"
                                        />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="mb-4 border p-4 rounded">
                                    <label className="block font-bold">Question {qIndex + 1}</label>
                                    <label className="block mt-2">Duration (seconds)</label>
                                    <input
                                        type="number"
                                        className="border w-full p-1 rounded"
                                        value={q.duration}
                                        onChange={(e) => handleFieldChange(qIndex, 'duration', e.target.value)}
                                    />

                                    <label className="block mt-2">Correct Answers (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="border w-full p-1 rounded"
                                        value={q.correctAnswers}
                                        onChange={(e) => handleFieldChange(qIndex, 'correctAnswers', e.target.value)}
                                    />

                                    <label className="block mt-2">Optional</label>
                                    {q.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2 mb-1">
                                            <input
                                                type="text"
                                                className="border w-full p-1 rounded"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeOption(qIndex, i)}
                                                className="text-blue-500 hover:text-red-700"
                                                type="button"
                                            >
                                                ❌Delete
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                      className="bg-blue-500 text-white px-3 py-1 rounded mt-2 hover:bg-blue-800"
                                      onClick={() => addOptionField(qIndex)}
                                      type="button"
                                    >
                                        ➕ Add Optional
                                    </button>
                                    
                                    <button
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        type="button"
                                    >
                                        ❌ Delete Question
                                    </button>
                                </div>
                            ))}
                            
                            <button
                                onClick={() => setQuestions([
                                    ...questions,
                                    { duration: '', correctAnswers: '', options: [] }
                                ])
                            }
                            className='bg-green-500 text-white px-3 py-1 rounded hover:bg-green-800'
                            type='button'
                            >
                                ➕ Add Another Question
                            </button>

                            <div>
                                <button className="btn w-full border rounded-md mt-3 cursor-pointer hover:bg-zinc-400"
                                onClick={handleCreateGame}>
                                    Create</button>
                                <button
                                    className="btn btn-light w-full border rounded-md mt-3 cursor-pointer hover:bg-zinc-400"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
                        {games.map(game => (
                            <div 
                                key={game.id}
                                className="border rounded p-4 shadow cursor-pointer hover:shadow-lg h-70"
                                onClick={() => navigate(`/game/${game.gameId}`)}
                            >
                                {game.thumbnail && (
                                    <img
                                        src={game.thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-40 object-cover rounded mb-2"
                                    />
                                )}
                                <h3 className="text-lg font-semibold">Game ID: {game.gameName}</h3>
                                <p>Questions: {game.questions.length}</p>
                                <p>Total Duration: {
                                    game.questions.reduce((sum, q) => sum + q.duration, 0)
                                } seconds</p>
                            </div>
                        ))}
                    </div>

            </div>

        </>
    )

}

export default Dashboard