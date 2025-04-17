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
    const [openAddGame, setOpenAddGame] = useState(false);
    const [openStartGame, setOpenStartGame] = useState(false);
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
            () => setOpenAddGame(false);
            fetchGames(); // refresh imediately
        } catch (err) {
            console.log(err);
            alert("Failed to create game.");
        }
    }

    return(
        <>
            <div className="">
                <div className='m-5 pb-5 border-b'>
                    <div className='flex gap-4'>
                        <button
                            className='btn border rounded-xl p-5 cursor-pointer hover:bg-gray-200'
                            onClick={() => setOpenAddGame(true)}
                        >
                            Add Game
                        </button>
                    </div>
                    <h2 className='text-2xl font-semibold text-center'>Dashboard</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
                    {games.map(game => (
                        <div 
                            key={game.id}
                            className="border rounded p-4 shadow cursor-pointer hover:shadow-lg"
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
                            <button
                                className='btn border rounded-xl p-5 cursor-pointer hover:bg-gray-300'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenStartGame(true);
                                }}
                            >
                                Start Game
                            </button>
                        </div>
                    ))}
                </div>

            </div>
            <Modal open={openAddGame} onClose={() => setOpenAddGame(false)}>
                <div className="text-center w-56">
                    <div className="text-center w-56">
                        <h3 className="text-lg font-black text-gray-800">Create New Game</h3>
                        <label htmlFor="gameName">Game Name</label>
                        <input type="text" id="gameName" className='mb-2 border rounded-sm'
                        onChange={(e) =>setGameName(e.target.value)} value={gameName}/>

                    </div>
                    <div>
                        <button className="btn w-full border rounded-md mt-3 cursor-pointer hover:bg-zinc-400"
                        onClick={handleCreateGame}>
                            Create</button>
                        <button
                            className="btn btn-light w-full border rounded-md mt-3 cursor-pointer hover:bg-zinc-400"
                            onClick={() => setOpenAddGame(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={openStartGame} onClose={() => setOpenStartGame(false)}>
                
            </Modal>

        </>
    )

}

export default Dashboard