import { useState } from 'react';

import {
    BrowserRouter as Router,
    useNavigate,
    Link,
} from "react-router-dom"

import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5005/admin/auth/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                }
            });
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            alert(err.response.data.error)
        }
    }

    return(
    <>
    Dashboard
    <button onClick={logout}>Log Out</button>
    </>
    )

}

export default Dashboard