import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './AppRoutes';

function App() {
    const [token, setToken] = useState(() => () => localStorage.getItem('token'));

    return (
        <Router>
            <AppRoutes token={token} setToken={setToken} />
        </Router>
    )
}
export default App