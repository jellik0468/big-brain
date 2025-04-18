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

    // Fetch games once on mount
    useEffect(() => {
        const fetchGames = async () => {
        try {
            const res = await axios.get("http://localhost:5005/admin/games", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGames(res.data.games);
            console.log(res,'wdwd');
        } catch (err) {
            console.error("Failed to fetch games:", err);
        } finally {
            setLoading(false);
        }
    };
        fetchGames();
    }, []);

    return (
        <GameContext.Provider value={{ games, setGames, loading }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGames = () => useContext(GameContext);
