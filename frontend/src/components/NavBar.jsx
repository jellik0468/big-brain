import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NavBar(props) {
  const setToken = props.setToken;
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const toDashboard = () => {
    navigate('/dashboard');
  }

  const toHistorySessions = () => {
    navigate('/historySession');
  }

  return  (
    <nav aria-label="Main navigation">
      <div className='p-3 flex flex-row flex-nowrap justify-start gap-5 bg-gray-900 border-b rounded-b-lg'>
        <button onClick={toDashboard} className='px-4 py-2 mr-2 text-white rounded hover:bg-gray-700 border'>Dashboard</button>
        <button onClick={logout} className='px-4 py-2 text-white rounded hover:bg-gray-700 border'>Log Out</button>
        <button onClick={toHistorySessions} className='px-4 py-2 text-white rounded hover:bg-gray-700 border'>History Sessions</button>
      </div>
      <Outlet />
    </nav>
  )
}

export default NavBar