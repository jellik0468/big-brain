// Global context to manage and share game-related data
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    // Holds all games fetched from the backend
    const [games, setGames] = useState({});
    // Tracks loading state while fetching games
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // Fetch games once on mount only when with token
    useEffect(() => {
        if (token) {
            fetchGames();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Refresh page function for children to call
    const fetchGames = async () => {
        try {
            const res = await axios.get("http://localhost:5005/admin/games", {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setGames(res.data.games);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GameContext.Provider value={{ games, setGames, loading, fetchGames }}>
            {children}
        </GameContext.Provider>
    );
};


export const useGames = () => useContext(GameContext);
