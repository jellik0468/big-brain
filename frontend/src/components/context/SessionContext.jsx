//Global context to manage and share session data across the app
import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    // Store the current session's data (status, question info, etc.)
    const [sessionData, setSessionData] = useState(null);
    // Track whether session data is still being fetched to show load accordingly
    const [loadingSession, setLoadingSession] = useState(true);

    // Fetches the session status or results from the backend
    const fetchSession = async (sessionId, token, gameId = null) => {
        try {
            setLoadingSession(true);

            // Step 1: Get session status
            const statusRes = await axios.get(
                `http://localhost:5005/admin/session/${sessionId}/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sessionStatus = statusRes.data.results;

            // Step 2: If session has ended, get final results instead
            if (!sessionStatus.active) {
                const resultsRes = await axios.get(
                `http://localhost:5005/admin/session/${sessionId}/results`,
                { headers: { Authorization: `Bearer ${token}` } }
                );

                setSessionData({ ...resultsRes.data.results, gameId });
            } else {
                setSessionData({ ...sessionStatus, gameId });
            }
        } catch (err) {
            console.log('Failed to fetch session data:', err);
        } finally {
            setLoadingSession(false);
        }
    };

    return (
        <SessionContext.Provider value={{ sessionData, setSessionData, fetchSession, loadingSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
