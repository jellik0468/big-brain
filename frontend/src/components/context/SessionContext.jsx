import { createContext, useState } from 'react';
import axios from 'axios';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [allSessions, setAllSessions] = useState({
    activeList: [],
    latestList: [],
    pastList: [],
  });

  const fetchSession = async (sessionId, token, gameId = null) => {
    try {
      setLoadingSession(true);
      const res = await axios.get(
        `http://localhost:5005/admin/session/${sessionId}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sessionStatus = res.data.results;

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
      console.error('Failed to fetch session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  const fetchAllSessions = async (games, token) => {
    setLoadingSession(true);
    try {
      const activeList = [];
      const latestList = [];
      const pastList = [];

      for (const game of Object.values(games)) {
        const { gameId, gameName, prevSessionId, oldSessions } = game;

        if (prevSessionId) {
          latestList.push({ sessionId: prevSessionId, gameId, gameName });

          try {
            const res = await axios.get(
              `http://localhost:5005/admin/session/${prevSessionId}/status`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.results.active) {
              activeList.push({ sessionId: prevSessionId, gameId, gameName });
            }
          } catch (err) {
            console.log(err);
          }
        }

        if (Array.isArray(oldSessions)) {
          oldSessions.forEach(sessionId => {
            pastList.push({ sessionId, gameId, gameName });
          });
        }
      }

      setAllSessions({ activeList, latestList, pastList });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionData,
        setSessionData,
        loadingSession,
        fetchSession,
        fetchAllSessions,
        allSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
