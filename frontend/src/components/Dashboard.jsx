import { useEffect, useState } from 'react';
import { useGames } from './context/useGames';
import axios from 'axios';
import Modal from './Modal';
import Button from './MyButton'

import { useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate =  useNavigate();
  const { games, fetchGames } = useGames();

  // All the state for modals
  const [openAddGame, setOpenAddGame] = useState(false);
  const [openStartGame, setOpenStartGame] = useState(false);
  const [openStopGame, setOpenStopGame] = useState(false);
  const [openDeleteGame, setOpenDeleteGame] = useState(false);

  const [step, setStep] = useState('confirm');
  const [gameName, setGameName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [uploadedGame, setUploadedGame] = useState(null);

  const owner = localStorage.getItem('owner');
  const token = localStorage.getItem('token');

  // Function to handle show result by navigating to the result page of the session just ended
  const handleViewResult = () => {
    navigate(`/session/${sessionId}`);
  }

  useEffect(() => {
	  fetchGames();
  }, []);

  // Function to update game via PUT API
  const handleCreateGame = async () => {
    try {
      let newGame;

      if (uploadedGame) {
        newGame = {
          ...uploadedGame,
          useAdvancedScoring: uploadedGame.useAdvancedScoring?? false
        }
      } else {
        newGame = {
          gameName: gameName,
          gameId: Math.floor(Math.random() * 100000000),
          owner: owner,
          questions: [],
          useAdvancedScoring: false, // default it to false
        }
      }
      const updatedGames = [...Object.values(games), newGame];

      await axios.put('http://localhost:5005/admin/games',
        { games: updatedGames },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setStep('finishAddGame')
      await fetchGames(); // refresh imediately

    } catch (err) {
      console.log(err);
      alert("Failed to create game.");
    }
  }

  // Functio to handle delete game
  const handleDeleteGame = async () => {
    try {
      const updatedGames = games.filter(game => game.gameId !== selectedGameId);

      await axios.put(`http://localhost:5005/admin/games`,
        { games: updatedGames },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStep('finishDelete');
      await fetchGames(); // refresh imediately
    } catch (err) {
      console.log(err);
    }
  };

  // Function to stop a game via API
  const handleStopGame = async () => {
    try {
      await axios.post(`http://localhost:5005/admin/game/${selectedGameId}/mutate`,
        { mutationType: 'END' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const game = games.find(g => g.gameId === selectedGameId);

      setSessionId(game.prevSessionId);

      setStep('gameStopped');
      setSelectedGameId(null);
      await fetchGames(); // re render

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
            
      await fetchGames(); // re render

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
        <div className='border-b'>
          <div className="flex items-center justify-between mx-10 mt-10 pb-4">
            <h2 className="text-3xl font-semibold text-gray-800">Dashboard</h2>
            <Button
              variant="primary"
              aria-label="Add a new game"
              onClick={() => {
                setStep('confirm');
                setOpenAddGame(true);
              }}
            >
              Add Game
            </Button>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-3">
          {Object.values(games).map(game => (
            <div 
              aria-label={`Open game ${game.gameName} edit page`}
              key={game.gameId}
              className={`border rounded-xl p-4 shadow cursor-pointer hover:shadow-2xl
              text-white ${game.active ? "bg-emerald-700 hover:bg-emerald-900" 
              : "bg-sky-800 hover:bg-sky-900"}`}
              onClick={() => navigate(`/game/${game.gameId}`)}
            >
              {game.thumbnailUrl && (
                <img
                  src={game.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <div className='flex justify-between'> 
                <h2 className="text-lg font-semibold">
                  Game ID: {game.gameName}
                </h2>

                <Button
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGameId(game.gameId);
                    setStep('confirm');
                    setOpenDeleteGame(true);
                  }}
                  aria-label={`Delete game ${game.gameName}`}
                >
                  Delete Game
                </Button>
              </div>

              <p>Questions: {game.questions.length}</p>
              <p>Total Duration: {
                game.questions.reduce((sum, q) => sum + q.duration, 0)
              } seconds</p>

              <div className='flex gap-4 mt-3'>
                {!game.active && (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGameId(game.gameId);
                      setStep('confirm');
                      setOpenStartGame(true);
                    }}
                    aria-label={`Start game ${game.gameName}`}
                  >
                    Start Game
                  </Button>
                )}

                {game.active && (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGameId(game.gameId);
                      setStep('confirm');
                      setOpenStopGame(true);
                    }}
                    aria-label={`Stop game ${game.gameName}`}
                  >
                    Stop Game
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for add game button*/}
      <Modal open={openAddGame} onClose={() => {
        setStep('confirm');
        setUploadedGame(null);
        setOpenAddGame(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      >

        {step === 'confirm' ? (
          <div className="text-center w-72 mx-auto p-4 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Create New Game
            </h3>
    
            {/* Game Name input (disabled if JSON uploaded) */}
            <div className="text-left mb-3">
              <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-1">
                Game Name
              </label>
              <input
                type="text"
                id="gameName"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                onChange={e => setGameName(e.target.value)}
                value={gameName}
                disabled={!!uploadedGame}
              />
            </div>
            
            {/* JSON upload input */}
            <div className="text-left mb-4">
              <label htmlFor="uploadJson" className="block text-sm font-medium text-gray-700 mb-1">
                Or upload full game JSON:
              </label>
              <input
                type="file"
                accept=".json"
                id="uploadJson"
                className="w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md 
                file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-100 hover:file:bg-gray-200"
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const data = JSON.parse(reader.result);
                      if (
                        typeof data.gameName !== 'string' ||
                        !data.gameId ||
                        !Array.isArray(data.questions)
                      ) {
                        throw new Error('Invalid game structure');
                      }
                      console.log('e')
                      setUploadedGame(data);
                      setGameName(data.gameName);
                    } catch (err) {
                      alert('Failed to parse game JSON: ' + err.message);
                      setUploadedGame(null);
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </div>
                
            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateGame}
              >
                Create
              </Button>

              <Button
                variant="default"
                fullWidth
                onClick={() => {
                  setStep('confirm');
                  setUploadedGame(null);
                  setOpenAddGame(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : step === 'finishAddGame' ? (
          <div className="text-center w-72 mx-auto p-4 bg-white rounded-lg">
            <p className="font-semibold text-lg text-gray-800 mb-4">
              Game has been added!
            </p>
            <Button
              variant='primary'
              onClick={() => {
                setStep('confirm');
                setUploadedGame(null);
                setGameName('');
                setOpenAddGame(false);
              }}
            >
                OK
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* Modal for delete game button*/}
      <Modal open={openDeleteGame} onClose={() => {
        setStep('confirm');
        setSelectedGameId(null);
        setOpenDeleteGame(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      >
        {step === 'confirm' ? (
          <>
            <div className="text-center w-56">
              <h3 className="text-lg font-black text-red-800 mb-5">Are you sure you want to delete this game</h3>
            </div>

            <div className='flex justify-between gap-2'>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDeleteGame}
              >
                Delete
              </Button>

              <Button
                variant="default"
                fullWidth
                onClick={() => setOpenDeleteGame(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : step === 'finishDelete' ? (
          <>
            <div className='text-center'>
              <p className='font-semibold text-lg'> Game have been deleted!</p>
              <Button variant='primary'
                onClick={() => {
                  setStep('confirm');
                  setSelectedGameId(null);
                  setOpenDeleteGame(false);
                }}
              >
                OK
              </Button>
            </div>
          </>
        ) : null }
      </Modal>

      {/* Modal for start game button*/}
      <Modal open={openStartGame} onClose={() => {
        setOpenStartGame(false)
        setSessionId(null);
        setCopied(false);
        setStep('confirm')
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      >
        {step === 'confirm' ? (
          <>
            <p>Are you sure you want to start the game?</p>
            <div className='flex gap-4 mt-3 justify-center'>
              <Button variant='primary'
                onClick={generateSessionCode}>
                Yes
              </Button>

              <Button variant='primary'
                onClick={() => setOpenStartGame(false)}>
                No
              </Button>
            </div>
          </>
        ) : step === 'session' && sessionId ? (
        
          <div>
            <div className='text-center'>
              <p className='font-semibold text-lg'> Game Started!</p>
              <p className='mt-2'>Session Code:</p>
              <h2 className='text-2l font-bold tracking-wider mt-1'>{sessionId}</h2>

              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  const link = `${window.location.origin}/join/${sessionId}`;
                  navigator.clipboard.writeText(link);
                  setCopied(true);
                }}
              >
                Copy Join Link
              </Button>

              {copied && (
                <p className="mt-2 text-sm text-red-600 mb-3 font-medium" aria-live="assertive">
                  Link copied to clipboard!
                </p>
              )}
              <p className="text-sm text-gray-700 mt-5">
                Manage your past game sessions from the admin panel.
              </p>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate(`/session/${sessionId}`)}
                className='mb-5'
              >
                Go to Admin panel for this session
              </Button>

              <Button
                variant="default"
                fullWidth
                onClick={() => {
                  setOpenStartGame(false);
                  setSessionId(null);
                  setCopied(false);
                  setStep('confirm');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : step === 'alreadyActive' ? (
          <div className="text-center">
            <p className="font-bold text-xl text-yellow-600">Game Already Running!!!</p>
            <p className="mt-2 text-sm text-gray-600">
              This game already has an active session. You can&apos;t start another one until it&apos;s ended.
            </p>
            <Button variant='primary'
              onClick={() => {
                setOpenStartGame(false);
                setStep('confirm');
                setSessionId(null);
              }}
            >
              Close
            </Button>
          </div>
        ) : null
        }
      </Modal>

      {/* Modal for stop game button*/}
      <Modal open={openStopGame} onClose={() => setOpenStopGame(false)} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        {step === 'confirm' ? (
          <>
            <p>Are you sure you want to stop the game?</p>
            <div className='flex gap-4 mt-3 justify-center'>
              <Button onClick={handleStopGame} variant='primary'>
                Yes
              </Button>

              <Button onClick={() => setOpenStopGame(false)}  variant='primary'>
                No
              </Button>
            </div>
          </>
        ) : step === 'gameStopped' ? (
          <div>
            <p>The game has ended, would you like to view the results?</p>
            <div className='flex gap-4 mt-3 justify-center'>
              <Button variant='primary' onClick={handleViewResult}>
                Yes
              </Button>

              <Button variant='primary' onClick={() => setOpenStopGame(false)}>
                No
              </Button>
            </div>
          </div>
        ) : null
        }
      </Modal>
    </>
  )
}

export default Dashboard