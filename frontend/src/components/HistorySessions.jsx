import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSession } from './context/SessionContext';
import { useGames } from './context/GameContext';

function HistorySession() {
    const navigate = useNavigate();
    // Getting the shared games
    const { games } = useGames();
    // using session context to control sessions
    const { allSessions, fetchAllSessions, loadingSession } = useSession();

    const token = localStorage.getItem("token");

    // Render the past sessions every time we render the page using function from session context
    useEffect(() => {
        if (games && Object.keys(games).length > 0) {
            fetchAllSessions(games, token);
        }
    }, [games]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-4">📜 Session History</h1>

            {loadingSession ? (
                <p className="text-gray-500">Loading sessions...</p>
            ) : (
                <>
                    {/* Active Sessions */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">🟢 Currently Active Sessions</h2>
                        {allSessions.activeList.length === 0 ? (
                            <p className="text-gray-500 italic">No active sessions running.</p>
                        ) : (
                            <div className="space-y-4">
                                {allSessions.activeList.map(session => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => navigate(`/session/${session.sessionId}`)}
                                        className="border border-green-300 bg-green-50 rounded-md p-4 
                                        shadow hover:shadow-md hover:bg-green-100 transition"
                                    >
                                        <p className="font-semibold text-green-700">Game: {session.gameName}</p>
                                        <p>Session ID: {session.sessionId}</p>
                                        <p className="text-sm text-green-600">Status: Active</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Most Recent */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">🕓 Most Recent Sessions</h2>
                        {allSessions.latestList.length === 0 ? (
                            <p className="text-gray-500 italic">No recent sessions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {allSessions.latestList.map(session => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => navigate(`/session/${session.sessionId}`)}
                                        className="cursor-pointer border border-blue-200 bg-blue-50 
                                        rounded-md p-4 shadow hover:shadow-md hover:bg-blue-200 transition duration-500"
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
                        {allSessions.pastList.length === 0 ? (
                            <p className="text-gray-500 italic">No past sessions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {allSessions.pastList.map(session => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => navigate(`/session/${session.sessionId}`)}
                                        className="cursor-pointer border border-gray-300 bg-slate-200 
                                        rounded-md p-4 shadow hover:shadow-md hover:bg-slate-400 transition duration-500"
                                    >
                                        <p className="font-semibold text-slate-800">Game: {session.gameName}</p>
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
