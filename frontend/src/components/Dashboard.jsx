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

    return(
        <>
            <div className="">
                <h2 className='text-2xl font-semibold mb-4 text-center border-b m-5 pb-5'>
                    <button className='btn relative bottom-0 right-30 border rounded-xl p-5 cursor-pointer' onClick={() => setOpen(true)}>Add Game</button>
                    Dashboard</h2> 
                    <Modal open={open} onClose={() => setOpen(false)}>
                        <div className="text-center w-56">
                            <div className="mx-auto my-4 w-48">
                                <h3 className="text-lg font-black text-gray-800">Create New Game</h3>
                                <label htmlFor="gameId">Game Id</label>
                                <input type="text" id="gameId" className='border rounded-sm'/>
                            </div>
                            <div className="flex gap-4">
                                <button className="btn w-full">Create</button>
                                <button
                                    className="btn btn-light w-full"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.map(game => (
                        <div 
                            key={game.id}
                            className="border rounded p-4 shadow cursor-pointer hover:shadow-lg"
                            onClick={() => navigate(`/game/${game.id}`)}
                        >
                            <img 
                                src={'https://via.placeholder.com/150'} 
                                alt="Thumbnail" 
                                className="w-full h-40 object-cover rounded mb-2" 
                            />
                            <h3 className="text-lg font-semibold">Game ID: {game.id}</h3>
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