import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGames } from './context/GameContext';
import { useSession } from './context/SessionContext';
import axios from 'axios';

function AdminSessionPage() {
    const { sessionData, fetchSession, loadingSession } = useSession();
    const { games } = useGames();
    const params = useParams();
  
    const token = localStorage.getItem('token');
  
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
        return null;
    };
  
    useEffect(() => {
        const gameId = findGameIdBySession(params.sessionId);
        fetchSession(params.sessionId, token, gameId);
    }, [params.sessionId, games]);
  
    // Helper function get reamaining time
    const getRemainingTime = () => {
        if (!sessionData || !sessionData.isoTimeLastQuestionStarted) return 0;
        const start = new Date(sessionData.isoTimeLastQuestionStarted).getTime();
        const now = Date.now();
        const elapsed = (now - start) / 1000;

        return Math.max(0, sessionData.questionDuration - elapsed);
    };
  
    const advanceSession = async () => {
        try {
            await axios.post(
                `http://localhost:5005/admin/game/${sessionData.gameId}/mutate`,
                { mutationType: 'ADVANCE' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            fetchSession(params.sessionId, token, sessionData.gameId); // refresh after advance question
      } catch (err) {
            console.log(err);
      }
    };
  
    const stopSession = async () => {
        try {
            await axios.post(
                `http://localhost:5005/admin/game/${sessionData.gameId}/mutate`,
                { mutationType: 'END' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Game session stopped.");
            fetchSession(params.sessionId, token, sessionData.gameId); // refresh after stop
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
                    <p>Current Question: #{sessionData?.position !== undefined ? sessionData.position + 1 : 'N/A'}</p>
                    <p>Time Remaining: {Math.floor(getRemainingTime())}s</p>
                
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