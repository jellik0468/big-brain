import { useEffect, useState } from "react";
import axios from "axios";

function HistorySession() {
    // used sessions state
    const [activeSessions, setActiveSessions] = useState([]);
    const [latestSessions, setLatestSessions] = useState([]);
    const [pastSessions, setPastSessions] = useState([]);

    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // Render the past sessions every time we render the page
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get("http://localhost:5005/admin/games", {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            
                const games = res.data.games;
                const activeList = [];
                const latestList = [];
                const pastList = [];
            
                for (const game of Object.values(games)) {
                    // get a copy of the value in the game object
                    const { gameId, gameName, prevSessionId, oldSessions } = game;
                
                    // Handle prevSessionId
                    if (prevSessionId) {
                        latestList.push({ sessionId: prevSessionId, gameId, gameName });

                        // Check session status
                        try {
                            const statusRes = await axios.get(
                                `http://localhost:5005/admin/session/${prevSessionId}/status`,
                                { headers: { 'Authorization': `Bearer ${token}` } }
                            );
                        
                            // Keep Track of the currently active session
                            if (statusRes.data.results.active) {
                                activeList.push({
                                    sessionId: prevSessionId,
                                    gameId,
                                    gameName,
                                });
                            }
                        } catch (err) {
                            console.log(`Could not fetch status for session ${prevSessionId}`, err);
                        }
                    }
                
                    // Handle oldSessions
                    if (Array.isArray(oldSessions)) {
                        oldSessions.forEach((sessionId) => {
                            pastList.push({ 
                                sessionId, 
                                gameId, 
                                gameName 
                            });
                        });
                    }
                }
                
                // Making changes to state
                setActiveSessions(activeList);
                setLatestSessions(latestList);
                setPastSessions(pastList);
            } catch (err) {
                console.error("Failed to fetch session data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-4">📜 Session History</h1>
    
            {loading ? (
                <p className="text-gray-500">Loading sessions...</p>
            ) : (
                <>
                    {/* Active Sessions */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">🟢 Currently Active Sessions</h2>
                        {activeSessions.length === 0 ? (
                            <>
                                <p className="text-gray-500 italic">No active sessions running.</p>
                                <p className='border-b mt-5'></p>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {activeSessions.map((session) => (
                                    <div
                                        key={session.sessionId}
                                        className="border border-green-300 bg-green-50 rounded-md p-4 shadow"
                                    >
                                        <p className="font-semibold text-green-700">Game: {session.gameName}</p>
                                        <p>Session ID: {session.sessionId}</p>
                                        <p className="text-sm text-green-600">Status: Active</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    
                    {/* Latest (prevSessionId) */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">🕓 Most Recent Sessions (For each game)</h2>
                        {latestSessions.length === 0 ? (
                            <p className="text-gray-500 italic">No recent sessions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {latestSessions.map((session) => (
                                    <div
                                        key={session.sessionId}
                                        className="border border-blue-200 bg-blue-50 rounded-md p-4 shadow"
                                    >
                                        <p className="font-semibold text-blue-700">Game: {session.gameName}</p>
                                        <p>Session ID: {session.sessionId}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    
                    {/* Past Sessions */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">📚 Archived Sessions</h2>
                        {pastSessions.length === 0 ? (
                            <p className="text-gray-500 italic">No past sessions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {pastSessions.map((session) => (
                                <div
                                    key={session.sessionId}
                                    className="border border-gray-300 bg-white rounded-md p-4 shadow"
                                >
                                    <p className="font-semibold text-gray-800">Game: {session.gameName}</p>
                                    <p>Session ID: {session.sessionId}</p>
                                </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default HistorySession;
