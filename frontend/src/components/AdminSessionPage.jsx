import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminSessionPage() {
    const params = useParams();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    // Called to load the session result when sessionId change
    useEffect(() => {
        const fetchSession = async () => {
            try {
                // Step 1: Get session status
                const statusRes = await axios.get(`http://localhost:5005/admin/session/${params.sessionId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const statusData = statusRes.data;
    
                // Step 2: If session is not active, get the results
                if (!statusData.results.active) {
                    const resultsRes = await axios.get(`http://localhost:5005/admin/session/${params.sessionId}/results`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setSessionData(resultsRes.data);
                } else {
                    // If session is active, use status data
                    setSessionData(statusData);
                }
    
                setLoading(false);
            } catch (err) {
                console.error("Failed to load session data:", err);
            }
        };
    
        fetchSession();
    }, [params.sessionId]);

    const getRemainingTime = () => {
        if (!sessionData) return 0;
        const start = new Date(sessionData.questionStartedAt).getTime();
        const now = Date.now();
        const elapsed = (now - start) / 1000;
        return Math.max(0, sessionData.questionDuration - elapsed);
    };

    const advanceSession = async () => {
        try {
            await axios.post(`http://localhost:5005/admin/game/${sessionData.gameId}/advance`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

        } catch (err) {
            console.error(err);
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
        } catch (err) {
            alert(err)
            console.error(err);
        }
    };

    const sessionActive = sessionData?.active === true;

    return (
        <>
            {loading ? (
                <p>Loading session...</p>
            ) : (
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Session ID: {params.sessionId}</h1>
                    <p>Current Question: #{sessionData.position + 1}</p>
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
    )
}

export default AdminSessionPage;