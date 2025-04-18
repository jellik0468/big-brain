import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGames } from './context/GameContext';
import { useSession } from './context/SessionContext';
import axios from 'axios';

function AdminSessionPage() {
    const { sessionData, fetchSession, loadingSession } = useSession();
    const { games, fetchGames } = useGames();
    const params = useParams();
  
    const token = localStorage.getItem('token');
    // countdown timer state
    const [remainingTime, setRemainingTime] = useState(0);

    // Finds the game ID associated with the given session ID
    const findGameIdBySession = (sessionId) => {
        for (const game of Object.values(games)) {
            if (
                game.prevSessionId === Number(sessionId) ||
                game.active === Number(sessionId) ||
                (Array.isArray(game.oldSessions) && game.oldSessions.includes(Number(sessionId)))
            ) {
                return game.gameId;
            }
        }
        return null; // not found 
    };

    // Initial fetch when component mounts or when games/sessionId changes
    useEffect(() => {
        const initFetch = async () => {
            const gameId = findGameIdBySession(params.sessionId);
            if (token && params.sessionId && gameId) {
                await fetchSession(params.sessionId, token, gameId); // load session info
            }
        };
        initFetch();
    }, [params.sessionId, games]);

    // Timer effect: starts ticking if session is active and question exists
    useEffect(() => {
        if (!sessionData) return;
      
        const { active, questions, position, isoTimeLastQuestionStarted } = sessionData;
      
        /// Early return if session is inactive or data has fault
        if (
            active !== true ||
            !Array.isArray(questions) ||
            position < 0 ||
            position >= questions.length
        ) {
            setRemainingTime(0);
            return;
        }
      
        // Get current question and ensure it has a valid duration
        const question = questions[position];
        if (!question || typeof question.duration !== 'number') {
            setRemainingTime(0);
            return;
        }
      
        // Calculate end‑time
        const startMs = new Date(isoTimeLastQuestionStarted).getTime();
        const endMs   = startMs + question.duration * 1000;
      
        // Tick function updates remaining time every second
        const tick = () => {
            const secsLeft = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
            setRemainingTime(secsLeft);
        };
      
        // initialise timer start tick
        tick();
        const intervalId = setInterval(tick, 1000);
      
        return () => clearInterval(intervalId);
    }, [
        sessionData?.active,
        sessionData?.questions?.length,
        sessionData?.position,
        sessionData?.isoTimeLastQuestionStarted,
    ]);
    
    // Sends a request to advance the current question
    const advanceSession = async () => {
        try {
            await axios.post(
                `http://localhost:5005/admin/game/${sessionData.gameId}/mutate`,
                { mutationType: 'ADVANCE' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            await fetchGames();
            await fetchSession(params.sessionId, token, sessionData.gameId); // refresh after advance question
        } catch (err) {
            console.log(err);
        }
    };
  
    // Sends a request to end the session
    const stopSession = async () => {
        try {
            await axios.post(
                `http://localhost:5005/admin/game/${sessionData.gameId}/mutate`,
                { mutationType: 'END' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Game session stopped.");
            
            console.log(sessionData);
            // Refreseh games so dashboard or context stays updated globally
            await fetchSession(params.sessionId, token, sessionData.gameId);
            await fetchGames();
        } catch (err) {
            console.log(err);
        }
    };
  
    const sessionActive = sessionData?.active === true;
  
    return (
        <>
            {loadingSession ? (
                <p>Loading session...</p>
            ) : (
                <div className="text-center mt-10">
                    <h1 className="text-2xl font-bold mb-4">Session ID: {params.sessionId}</h1>
                    <p>Current Question: #{sessionData?.position + 1}</p>
                    <p>Time Remaining: {remainingTime}s</p>
                
                    {sessionActive ? (
                        <div className="flex gap-4 justify-center mt-4">
                            <button
                                className="btn border rounded-md p-3 bg-blue-200 hover:bg-blue-300"
                                onClick={advanceSession}
                            >
                                Advance Question
                            </button>
                            <button
                                className="btn border rounded-md p-3 bg-red-200 hover:bg-red-300"
                                onClick={stopSession}
                            >
                                Stop Session
                            </button>
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-500 italic">Session is not active.</p>
                    )}
                </div>
            )}
        </>
    );
}
  
  export default AdminSessionPage;