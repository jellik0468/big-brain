import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import axios from 'axios';

function AppRoutes({ token, setToken }) {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log(token);
            const res = await axios.post('http://localhost:5005/admin/auth/logout', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            localStorage.removeItem('token');
            setToken(null);
            navigate('/login');
        } catch (err) {
            alert(err.response.data.error);
        }
    };

    return (
        <>
            {token && (
                <div>
                    <button onClick={logout}>Log Out</button>
                </div>
            )}
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
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </>
    );
}

export default AppRoutes;
