import { useState } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './AppRoutes';
import { GameProvider } from './components/context/GameContext';
import { SessionProvider } from './components/context/SessionContext';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  return (
    <GameProvider>
      <SessionProvider>
        <Router>
          <AppRoutes token={token} setToken={setToken} />
        </Router>
      </SessionProvider>
    </GameProvider>
  )
}
export default App