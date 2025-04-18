import { Routes, Route, Navigate, useNavigate, Outlet} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EditGame from './components/EditGame';
import NavBar from './components/NavBar';
import EditQuestion from './components/EditQuestion';
import AdminSessionPage from './components/AdminSessionPage';
import HistorySession from './components/HistorySessions';

function AppRoutes({ token, setToken }) {

    return (
        <>
            <Routes>
                <Route
                    path="/" 
                    element={token ? <Navigate replace to="/dashboard" /> : <Login setToken={setToken} />} 
                />
                <Route 
                    path="/login" 
                    element={token ? <Navigate replace to="/dashboard" /> : <Login setToken={setToken} />} 
                />
                <Route 
                    path="/register" 
                    element={token ? <Navigate replace to="/dashboard" /> : <Register setToken={setToken} />} 
                />
                <Route path="/" element={<NavBar setToken={setToken}/>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="/game/:gameId" element={<EditGame />} />
                    <Route path="/game/:gameId/question/:questionId" element={<EditQuestion/>} />
                    <Route path="/session/:sessionId" element={<AdminSessionPage/>} />
                    <Route path="/historySession" element={<HistorySession/>} />
                </Route>
            </Routes>
        </>
    );
}

export default AppRoutes;
