import { Routes, Route, Navigate, useNavigate, Outlet} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EditGame from './components/EditGame';
import NavBar from './components/NavBar';

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
                </Route>
                <Route
                    path="/game/:gameId" element={<EditGame />} 
                />
            </Routes>
        </>
    );
}

export default AppRoutes;
