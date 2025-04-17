import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminSessionPage() {
    const params = useParams();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('toekn');

    // Called to load the session result when sessionId change
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`http://localhost:5005/admin/session/${params.sessionId}/results`,{
                    headers: { Authorization: `Bearer ${token}`}
                });
                setSessionData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
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
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Game session stopped.");
        } catch (err) {
          console.error(err);
        }
      };

    return (
        <>
            {loading ? (
                <p>Loading session...</p>
            ) : (
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Session ID: {sessionId}</h1>
                    <p>Current Question: #{sessionData.position + 1}</p>
                    <p>Time Remaining: {Math.floor(getRemainingTime())}s</p>
            
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
              </div>
            )}
        </>
    )
}

export default AdminSessionPage;