import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from "./context/GameContext";

function EditGame() {
	const navigate = useNavigate();
	const params = useParams();
    const token = localStorage.getItem("token");
	const { games, setGames, fetchGames } = useGames();
  	const [game, setGame] = useState(null);

	  useEffect(() => {
		// Load from context
		const matchedGame = Object.values(games).find(
			(g) => String(g.gameId) === String(params.gameId)
		);
		if (matchedGame) {
			setGame(matchedGame);
		}
	}, [games, params.gameId]);

	
	// Handle delete question by updating game state
	const handleDeleteQuestion = async (index) => {
		const updatedQuestions = [...game.questions];
		updatedQuestions.splice(index, 1); // Remove the selected question
		
		// paste back
		const updatedGame = {
			...game,
			questions: updatedQuestions,
		};
	
		try {
			const updatedGames = Object.values(games).map((g) =>
				String(g.gameId) === String(game.gameId) ? updatedGame : g
			);
	
			await axios.put("http://localhost:5005/admin/games", {
				games: updatedGames,
			}, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
	
			setGame(updatedGame); // local game target
			setGames(updatedGames); // setting for global context
		} catch (err) {
			console.log(err);
			alert("Failed to delete question.");
		}
	};

	// Handle add question by updating game state
	const handleAddQuestion = async () => {
		const newQuestion = {
			duration: 0,
			correctAnswers: [],
			Answers: [],
		};
		// Copying current game for later update
		const updatedGame = {
			...game,
			questions: [...game.questions, newQuestion],
		};
	
		try {
			const updatedGames = Object.values(games).map((g) =>
				String(g.gameId) === String(game.gameId) ? updatedGame : g
			);
	
			await axios.put("http://localhost:5005/admin/games", {
				games: updatedGames,
			}, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
	
			setGame(updatedGame); // local state
			setGames(updatedGames); // setting global context
		} catch (err) {
			console.log(err);
			alert("Failed to add and save question.");
		}
	};
	

	// Handle redirecting when edit question button is clicked.
	const handleEditQuestion = (index) => {
		navigate(`/game/${params.gameId}/question/${index}`);
	}

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold mb-4">
				Edit Game: {game ? game.gameName : "Loading..."}
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

								<div className="flex space-x-4">
									<button
										className="text-red-500 hover:underline"
										onClick={() => handleDeleteQuestion(index)}
									>
										❌ Delete This Question
									</button>

									<button
										className="text-blue-700 hover:underline"
										onClick={() => handleEditQuestion(index)}
									>
										Edit Question
									</button>
								</div>
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
