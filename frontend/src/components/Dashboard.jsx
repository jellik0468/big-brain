import { useEffect, useState } from 'react';
import { useGames } from './context/GameContext';
import axios from 'axios';
import Modal from './Modal';

import {
    BrowserRouter as Router,
    useNavigate,
    Link,
} from "react-router-dom"

function Dashboard() {
    const navigate =  useNavigate();
    const { games, setGames, loading } = useGames();
    const [openAddGame, setOpenAddGame] = useState(false);
    const [openStartGame, setOpenStartGame] = useState(false);
    const [openStopGame, setOpenStopGame] = useState(false);
    const [step, setStep] = useState('confirm');
    const [gameName, setGameName] = useState('');
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [copied, setCopied] = useState(false);

    const owner = localStorage.getItem('owner');
    const token = localStorage.getItem('token');

    // Function to handle show result by navigating to the result page of the session just ended
    const handleViewResult = () => {
        navigate(`/session/${sessionId}`);
    }

    // Function to update game via PUT API
    const handleCreateGame = async () => {
        try {
            const newGame = {
                gameName: gameName,
                gameId: Math.floor(Math.random() * 100000000),
                owner: owner,
                questions: [],
            }

            const updatedGames = [...existingGames, newGame];

            await axios.put('http://localhost:5005/admin/games',
                { games: updatedGames },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Game created successfully!");
            setOpenAddGame(false);
            setGames(updatedGames); // refresh imediately
        } catch (err) {
            console.log(err);
            alert("Failed to create game.");
        }
    }

    // Function to stop a game via API
    const handleStopGame = async () => {
        try {
            const res = await axios.post(`http://localhost:5005/admin/game/${selectedGameId}/mutate`,
                { mutationType: 'END' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const updatedGames = games.map(game => {
                if (game.gameId === selectedGameId) {
                    return { ...game, active: null };
                }
                return game;
            });

            const game = games.find(g => g.gameId === selectedGameId);

            setSessionId(game.prevSessionId);

            setStep('gameStopped');
            setSelectedGameId(null);
            setGames(updatedGames); // re render

        } catch (err) {
            console.log(err);
        }
    }

    // Start a game and generating session code
    const generateSessionCode = async () => {
        try {
            const res = await axios.post(`http://localhost:5005/admin/game/${selectedGameId}/mutate`,
                { mutationType: 'START' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const newSessionId = res.data.data.sessionId

            setSessionId(newSessionId);
            setStep('session');
            setSelectedGameId(null);

            // Add sessionId into the game object
            const updatedGames = games.map(game => {
                if (game.gameId === selectedGameId) {
                    return {...game, prevSessionId: newSessionId };
                }
                return game;
            })

            // Save it to backend
            await axios.put(
                'http://localhost:5005/admin/games',
                { games: updatedGames },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGames(updatedGames); // re render

        } catch (err) {
            console.log(err);

            if (err.response.status === 400) {
                setStep('alreadyActive') // session is on, change the modal for user
            }
        }
    };

    return (
        <>
            <div className="">
                <div className='m-5 pb-5 border-b'>
                    <div className='flex gap-4'>
                        <button
                            className='btn border rounded-xl p-5 cursor-pointer hover:bg-gray-200'
                            onClick={() => {
                                setStep('confirm');
                                setOpenAddGame(true)
                            }}
                        >
                            Add Game
                        </button>
                    </div>
                    <h2 className='text-4xl font-semibold text-center'>Dashboard</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
                    {Object.values(games).map(game => (
                        <div 
                            key={game.id}
                            className="border rounded-xl p-4 shadow cursor-pointer hover:shadow-2xl bg-zinc-700 text-white"
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
                            <div className='flex gap-4 mt-3'>
                                <button
                                    className='btn border rounded-xl p-5 cursor-pointer hover:bg-gray-200'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGameId(game.gameId);
                                        setStep('confirm');
                                        setOpenStartGame(true);
                                    }}
                                >
                                    Start Game
                                </button>
                                {game.active && (
                                    <button
                                        className='btn border rounded-xl p-5 cursor-pointer hover:bg-gray-200'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedGameId(game.gameId);
                                            setStep('confirm');
                                            setOpenStopGame(true);
                                        }}    
                                    >
                                        Stop Game
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            {/* Modal for add game button*/}
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
                            onClick={() => {setOpenAddGame(false)}}
                            >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Modal for start game button*/}
            <Modal open={openStartGame} onClose={() => setOpenStartGame(false)}>
                {step === 'confirm' ? (
                    <>
                        <p>Are you sure you want to start the game?</p>
                        <div className='flex gap-4 mt-3 justify-center'>
                            <button onClick={generateSessionCode} className='btn btn-light p-3 pr-5 pl-5 border rounded-md
                                mt-3 cursor-pointer hover:bg-zinc-400'>
                            Yes
                            </button>

                            <button onClick={() => setOpenStartGame(false)} className='btn p-3 pr-5 pl-5
                                border rounded-md mt-3 cursor-pointer hover:bg-zinc-400'>
                            No
                            </button>
                        </div>
                    </>
                    ) : step === 'session' && sessionId ? (
                        <div>
                            <div className='text-center'>
                                <p className='font-semibold text-lg'> Game Started!</p>
                                <p className='mt-2'>Session Code:</p>
                                <h2 className='text-2l font-bold tracking-wider mt-1'>{sessionId}</h2>

                                <button
                                    className="btn w-full border rounded-md mt-4 cursor-pointer hover:bg-zinc-400"
                                    onClick={() => {
                                        const link = `${window.location.origin}/play/${sessionId}`;
                                        navigator.clipboard.writeText(link);
                                        setCopied('true');
                                    }}
                                >
                                    Copy Join Link
                                </button>

                                {copied && (
                                    <p className="mt-2 text-sm text-red-600 mb-3 font-medium">Link copied to clipboard!</p>
                                )}
                                <p className="text-sm text-gray-700">
                                    Manage your past game sessions from the admin panel.
                                </p>
                                <button
                                    className="btn w-full border rounded-md mt-1 cursor-pointer hover:bg-zinc-400"
                                    onClick={() => {
                                        navigate(`/session/${sessionId}`);
                                    }}
                                >
                                    Go to Admin panel for this session
                                </button>

                                <button
                                    className='btn w-full border rounded -md mt-4 cursor-pointer hover:bg-zinc-400'
                                    onClick={() => {
                                        // CleanUp
                                        setOpenStartGame(false)
                                        setSessionId(null);
                                        setCopied(false);
                                        setStep('confirm')
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : step === 'alreadyActive' ? (
                        <div className="text-center">
                            <p className="font-bold text-xl text-yellow-600">Game Already Running!!!</p>
                            <p className="mt-2 text-sm text-gray-600">
                                This game already has an active session. You can't start another one until it's ended.
                            </p>
                            <button
                                className="btn w-full border rounded-md mt-4 cursor-pointer hover:bg-zinc-400"
                                onClick={() => {
                                    setOpenStartGame(false);
                                    setStep('confirm');
                                    setSessionId(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    ) : null
                }
            </Modal>

            {/* Modal for stop game button*/}
            <Modal open={openStopGame} onClose={() => setOpenStopGame(false)}>
                {step === 'confirm' ? (
                    <>
                        <p>Are you sure you want to stop the game?</p>
                        <div className='flex gap-4 mt-3 justify-center'>
                            <button onClick={handleStopGame} className='btn btn-light p-3 pr-5 pl-5 border rounded-md
                                mt-3 cursor-pointer hover:bg-zinc-400'>
                            Yes
                            </button>

                            <button onClick={() => setOpenStopGame(false)} className='btn p-3 pr-5 pl-5
                                border rounded-md mt-3 cursor-pointer hover:bg-zinc-400'>
                            No
                            </button>
                        </div>
                    </>
                    ) : step === 'gameStopped' ? (
                        <div>
                            <p>The game has ended, would you like to view the results?</p>
                            <div className='flex gap-4 mt-3 justify-center'>
                                <button onClick={handleViewResult} className='btn btn-light p-3 pr-5 pl-5 border rounded-md
                                    mt-3 cursor-pointer hover:bg-zinc-400'>
                                    Yes
                                </button>

                                <button onClick={() => setOpenStopGame(false)} className='btn p-3 pr-5 pl-5
                                    border rounded-md mt-3 cursor-pointer hover:bg-zinc-400'>
                                    No
                                </button>
                            </div>
                        </div>
                    ) : null
                }
            </Modal>
        </>
    )

}

export default Dashboard