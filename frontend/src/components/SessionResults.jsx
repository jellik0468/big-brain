import { useState, useEffect } from 'react';
import axios from 'axios';
import { useGames } from './context/useGames';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  ResponsiveContainer
} from 'recharts';

function SessionResults({ sessionId }) {
  const { games } = useGames();
  const token = localStorage.getItem('token');

  // State for tracking players, question stats, loading status, and errors
  const [topPlayers, setTopPlayers] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Looking for the current game.
  const game = Object.values(games).find(g => String(g.prevSessionId) === sessionId);
  // use advanced scoring flag
  const useAdvancedScoring = !!game.useAdvancedScoring;

  useEffect(() => {
  // Fetch session results from API
	  const fetchSession = async () => {
	    try {
	    	const { data } = await axios.get(
	    	  `http://localhost:5005/admin/session/${sessionId}/results`,
	    	  { headers: { 'Authorization': `Bearer ${token}` } }
	    	);
	    	const players = Array.isArray(data.results) ? data.results : [];
	    	if (players.length === 0) {
	    	  setError('No player results found');
	    	  setLoading(false);
	    	  return;
	    	}
	    	console.log(data)
			  // Determine how many questions exist (from the first player's answer length)
	     	const numQuestions = players[0].answers.length;
	     	// map players to scores based on correct answers
	     	const scores = players.map((p, i) => {
	     		const correctCount = p.answers.filter(a => a.correct).length;
	     		return {
	     		  name: p.name || `Player ${i + 1}`,
	     		  score: correctCount
	     		};
	     	});

			  // Sort and take top 5 players
	      const top5 = scores
	      	.sort((a, b) => b.score - a.score)
	      	.slice(0, 5);
	      setTopPlayers(top5);

	      // Calculate per-question statistics
	      const stats = Array.from({ length: numQuestions }).map((_, idx) => {
	        const records = players.map(p => p.answers[idx]);
	        const totalCount = records.length;
	        const correctCount = records.filter(r => r.correct).length;

				  // Compute time taken to answer in seconds
	        const times = records
				  	.map(r =>
	            r.answeredAt && r.questionStartedAt
	            ? (new Date(r.answeredAt).getTime() -
	               new Date(r.questionStartedAt).getTime()) / 1000
	            : null
	          )
	          .filter(t => t != null);

	        const avgTime = times.length
	          ? times.reduce((sum, t) => sum + t, 0) / times.length
	          : 0;

	        return {
	        	name: `Question ${idx + 1}`,
	        	percentage: totalCount ? (correctCount / totalCount) * 100 : 0,
	        	avgTime
	        };
	      });
	      	setQuestionStats(stats);

	    	} catch (err) {
	      	console.log(err);
	      	setError('Failed to load session results'); // Visual error prompt

	    	} finally {
			  // Stop loading state
	      	setLoading(false);
	    	}
	  };
	  fetchSession();
  }, [sessionId, token]);

  // SHowing corresponding on status
  if (loading) return <p>Loading session results...</p>;  
  if (error) {
  	return (
  	  	<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  			<span className="block sm:inline">{error}</span>
  	  	</div>
  	);
  } 
  return (
    <div className="p-6">
  		<div className='flex justify-between'>
  			<h2 className="text-2xl font-bold mb-4">Session Results</h2>
  			{useAdvancedScoring && <div>
  				<p className='text-center pb-4 border-l border-gray-300 pl-10'>
            	        🧮 <b>Advanced Scoring is applied:</b> Your score is based on how quickly you answer.<br />
            	        If correct, your points are calculated as:<br />
            	        Points = (1 - TimeTaken ÷ Duration) * Question Points
            	    </p>
  			</div>}
  		</div>  
        	{/* Top 5 Players */}
        	<h3 className="text-xl font-semibold mb-2">Top 5 Players</h3>
        	<table className="table-auto w-full mb-6 border-collapse">
        	  	<thead>
        	    	<tr>
        	    	  	<th className="px-2 py-1 border">Rank</th>
        	    	  	<th className="px-2 py-1 border">Player</th>
        	    	  	<th className="px-2 py-1 border">Score</th>
        	    	</tr>
        	  	</thead>
        	  	<tbody>
        	    	{topPlayers.map((p, i) => (
        	      		<tr key={p.name} className="border">
        	        		<td className="px-2 py-1 border">{i + 1}</td>
        	        		<td className="px-2 py-1 border">{p.name}</td>
        	        		<td className="px-2 py-1 border">{p.score}</td>
        	      		</tr>
        	    	))}
        	  	</tbody>
        	</table>  
        	{/* Question Correctness (%) */}
        	<h3 className="text-xl font-semibold mb-2">Question Correctness (%)</h3>
        	<ResponsiveContainer width="100%" height={300}>
        	  	<BarChart data={questionStats}>
        	  	  	<XAxis dataKey="name" />
        	  	  	<YAxis unit="%" />
        	  	  	<Bar dataKey="percentage" />
        	  	</BarChart>
        	</ResponsiveContainer>  
        	{/* Average Response Time (s) */}
        	<h3 className="text-xl font-semibold mt-6 mb-2">Average Response Time (s)</h3>
        	<ResponsiveContainer width="100%" height={300}>
        	  	<LineChart data={questionStats}>
        	  	  	<XAxis dataKey="name" />
        	  	  	<YAxis unit="s" />
        	  	  	<Line type="monotone" dataKey="avgTime" />
        	  	</LineChart>
        	</ResponsiveContainer>
    </div>
  );
}

export default SessionResults;
