import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function JoinSession() {
  const params = useParams();
  const navigate = useNavigate();

  // If the URL provided a sessionId, pre-fill and lock the input
  const [sessionId, setSessionId] = useState(params.sessionId || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  return (
	  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br 
		  from-gray-900 via-black to-gray-800 px-4">
  		<div className="max-w-md w-full bg-gray-800 border border-blue-500/30 rounded-xl shadow-2xl p-8">
  			<h1 className="text-3xl font-extrabold text-center text-blue-400 mb-6 drop-shadow-lg">
    			🎮 Join a Game Session
  			</h1>

    		<form onSubmit={handleSubmit} className="space-y-5">
      		{!params.sessionId && (
      		  <div>
      		  	<label className="block text-sm font-medium text-blue-200 mb-1">
      		  	  Session ID
      		  	</label>
      		  	<input
      		  	  type="text"
      		  	  value={sessionId}
      		  	  onChange={e => setSessionId(e.target.value)}
      		  	  placeholder="Enter session code"
      		  	  required
      		  	  className="w-full px-4 py-2 bg-gray-700 border border-blue-500 
						    text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      		  	/>
      		  </div>
      		)}

      		<div>
      		  <label className="block text-sm font-medium text-blue-200 mb-1">
      		  	  Your Name
      		  </label>
      		  <input
      		  	type="text"
      		  	value={name}
      		  	onChange={e => setName(e.target.value)}
      		  	placeholder="Enter your name"
      		  	className="w-full px-4 py-2 bg-gray-700 border border-blue-500 text-white 
						  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      		  />
      		</div>

      		{error && (
      		  <p className="text-sm text-red-500 font-semibold drop-shadow">
      		  	{error}
      		  </p>
      		)}

      		<button
      		  type="submit"
      		  disabled={loading}
      		  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md 
					hover:bg-blue-700 transition shadow-md hover:shadow-blue-500/50 disabled:opacity-50"
      		>
        		{loading ? 'Joining...' : 'Join Session'}
      		</button>
    		</form>
  		</div>
    </div>
  );
}

export default JoinSession;