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

	// meta fiels
	const [gameName, setGameName] = useState("");
	const [thumbnail, setThumbnail] = useState("");
	const [thumbInputKey, setThumbInputKey] = useState(Date.now());

	useEffect(() => {
		fetchGames();
	}, []);

	useEffect(() => {
		// Load from context
		const matchedGame = Object.values(games).find(
			(g) => String(g.gameId) === String(params.gameId)
		);
		if (matchedGame) {
			setGame(matchedGame);
			setGameName(matchedGame.gameName || "");
			setThumbnail(matchedGame.thumbnailUrl || "");
		}
	}, [games, params.gameId]);

	// handle thumbnail upload
	const handleThumbnailUpload = (e) => {
	    const file = e.target.files[0];
	    if (!file) return;
	    const reader = new FileReader();
	    reader.onloadend = () => setThumbnail(reader.result);
	    reader.readAsDataURL(file);
	};

	const handleDeleteThumbnail = () => {
	    setThumbnail("");
	    setThumbInputKey(Date.now());
	};

	// save game meta (name + thumbnail)
	const handleSaveMeta = async () => {
	    try {
	      	const updatedGame = {
	        	...game,
	        	gameName: gameName.trim(),
	        	thumbnailUrl: thumbnail || null,
	      	};
	      	// update in global list
	      	const updatedGames = Object.values(games).map((g) =>
	      	  	String(g.gameId) === String(updatedGame.gameId) ? updatedGame : g
	      	);

	      	await axios.put(
	      	  	"http://localhost:5005/admin/games",
	      	  	{ games: updatedGames },
	      	  	{ headers: { 'Authorization': `Bearer ${token}` } }
	      	);

	      	setGame(updatedGame);
	      	setGames(updatedGames);
	    } catch (err) {
	    	console.log(err);
	    }
	};

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
		<div className="p-6 max-w-5xl mx-auto space-y-10" aria-label="Edit Game Page">

	  	</div>
	);
}

export default EditGame;
