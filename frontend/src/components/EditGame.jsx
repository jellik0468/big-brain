import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditGame() {
    const params = useParams();
    const token = localStorage.getItem("token");
  	const [game, setGame] = useState(null);

  	useEffect(() => {
    	fetchGame();
  	}, []);

  	useEffect(() => {
    	if (game !== null) {
      		handleSaveChanges();
    	}
  	}, [game]);

	// Loading the corresponding game
  	const fetchGame = async () => {
    	try {
      		const res = await axios.get("http://localhost:5005/admin/games", {
        		headers: { Authorization: `Bearer ${token}` },
      		});

      		const matchedGame = res.data.games.find(
        		(g) => String(g.gameId) === String(params.gameId)
      		);

      		if (matchedGame) {
        		setGame(matchedGame);
      		} else {
        		alert("Game not found");
      		}
    	} catch (err) {
      		console.error(err);
      		alert("Failed to fetch game");
    	}
  	};
	
	// Handle delete question by updating game state
  	const handleDeleteQuestion = (index) => {
    	const updated = [...game.questions];
    	updated.splice(index, 1);
    	setGame({ ...game, questions: updated });
  	};

	// Handle add question by updating game state
  	const handleAddQuestion = () => {
    	const newQuestion = {
      		duration: 30,
      		correctAnswers: [],
      		Answers: [],
    	};
    	setGame({ ...game, questions: [...game.questions, newQuestion] });
  	};

  	const handleSaveChanges = async () => {
    	try {
      		// 1. Fetch all games again
      		const res = await axios.get("http://localhost:5005/admin/games", {
        		headers: { 'Authorization': `Bearer ${token}` },
      		});

      		// 2. Replace the game we just edited
      		const updatedGames = res.data.games.map((g) => 
      		String(g.gameId) === String(game.gameId) ? game : g)

      		// 3. PUT the updated games list
      		await axios.put("http://localhost:5005/admin/games", { games: updatedGames }, {
        		headers: { 'Authorization': `Bearer ${token}` },
      		});
      
    	} catch (err) {
      		console.error(err);
      		alert("Failed to save changes");
    	}
  	};

  	return (
    	<div className="p-6">
      		<h2 className="text-2xl font-bold mb-4">
        		Edit Game: {game ? game.id : "Loading..."}
      		</h2>

      		{game && (
        	<>
          	<div className="grid gap-4">
            	{game.questions.map((q, index) => (
              		<div
                		key={index}
                		className="border p-4 rounded shadow bg-white space-y-2"
              		>
                		<h3 className="font-bold text-lg">Question {index + 1}</h3>
                		<p>
                  			<strong>Duration:</strong> {q.duration} seconds
                		</p>

                		<p>
                  			<strong>Correct Answers:</strong>{" "}
                  			{Array.isArray(q.correctAnswers)
                    		? q.correctAnswers.join(", ")
                    		: ""}
                		</p>

                		<p>
                  			<strong>Options:</strong>{" "}
                  			{q.Answers && q.Answers.length > 0
                    		? q.Answers.map((a, i) => a.Answer).join(", ")
                    		: "None"}
                		</p>

                		<button
                  			className="text-red-500 hover:underline"
                  			onClick={() => handleDeleteQuestion(index)}
                		>
                  			❌ Delete This Question
                		</button>
              		</div>
            	))}
        	</div>

          	<button
            	onClick={handleAddQuestion}
            	className="mt-6 bg-green-500 text-white px-4 py-2 rounded"
          	>
            	➕ Add New Question
          	</button>
        	</>
      		)}
    	</div>
  	);
}

export default EditGame;
