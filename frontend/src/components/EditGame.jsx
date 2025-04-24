import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from './context/useGames';
import Modal from "./Modal";

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

	// keeping track of state of use advanced points system
	const [useAdvancedScoring, setUseAdvancedScoring] = useState(false);

	const [isModalOpen, setModalOpen] = useState(false);

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
			setUseAdvancedScoring(!!matchedGame.useAdvancedScoring);
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

	const handleDeleteThumbnail = async () => {
	    setThumbnail("");
	    setThumbInputKey(Date.now());
	};

	//make form onSubmit async
	const handleSubmit = async (e) => {
		e.preventDefault();
		const success = await handleSaveMeta();

		if (success) {
		  	setModalOpen(true);
		} else {
		  	alert("Save failed—please try again.");
		}
	};

	// save game meta (name + thumbnail)
	const handleSaveMeta = async () => {
	    try {
	      	const updatedGame = {
	        	...game,
	        	gameName: gameName.trim(),
	        	thumbnailUrl: thumbnail || null,
				useAdvancedScoring,
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

			// returen true to open modal
			return true;
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
			<h1 className="text-3xl font-bold text-center">Edit Game: {game ? game.gameName : "Loading..."}</h1>

		  	<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-xl"
				aria-labelledby="edit-game-form"
		  	>
			  	<div className="flex flex-col">
				  	<label htmlFor="gameName" className="mb-2 text-lg font-medium">
						Game Name <span className="sr-only">required</span>
				  	</label>
				  	<input
					   id="gameName"
					   name="gameName"
					   type="text"
					   value={gameName}
					   onChange={(e) => setGameName(e.target.value)}
					   className="border border-gray-300 rounded-xl px-4 py-2 
						  focus:outline-none focus:ring-2 focus:ring-blue-500"
					   required
					   aria-required="true"
				  	/>
			  	</div>
			
			  	<div className="flex flex-col">
				  	<label htmlFor="thumbnail" className="mb-2 text-lg font-medium">
							Thumbnail (optional)
				  	</label>
				  	<input
						key={thumbInputKey}
						id="thumbnail"
						name="thumbnail"
						type="file"
						accept="image/*"
						onChange={handleThumbnailUpload}
						className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						aria-describedby="thumbnail-desc"
				  	/>
				  	<span id="thumbnail-desc" className="sr-only">Image preview will appear below if uploaded</span>
				  	{thumbnail && (
						<div className="mt-4 flex items-center space-x-4">
						  	<img
								src={thumbnail}
								alt="Current game thumbnail preview"
								className="h-24 w-auto object-contain border rounded-lg"
						  	/>
						  	<button
								type="button"
								onClick={handleDeleteThumbnail}
								className="px-4 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
								aria-label="Remove thumbnail preview"
						  	>
								Remove
						  	</button>
						</div>
				  	)}
			  	</div>
				{/* Game-level Multiplier */}
				<div className="col-span-full flex items-center space-x-4">
          			<label className="flex items-center">
            			<input
            		  		type="checkbox"
            		  		checked={useAdvancedScoring}
            		  		onChange={() => setUseAdvancedScoring(prev => !prev)}
            			/>
            			<span className="ml-2">Enable advanced scoring</span>
          			</label>
        		</div>
			  
			  	<div className="col-span-full text-right">
					  	<button
							type="submit"
							className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition"
							aria-label="Save game metadata"
					  	>
							Save Metadata
					  	</button>
			  	</div>
		  	</form>
			  
		  	<div className="bg-white p-6 rounded-xl shadow space-y-6" aria-labelledby="questions-section">
				<h2 id="questions-section" className="text-2xl font-bold">Questions</h2>
				<div className="space-y-4">
				  	{game?.questions?.map((q, index) => (
						<div
						  	key={index}
						  	className="border p-4 rounded-lg shadow-sm bg-gray-50 space-y-2"
						  	aria-label={`Question ${index + 1}`}
						>
						  	<h3 className="font-semibold text-lg">Question {index + 1}</h3>
						  	<p>
								<strong>Duration:</strong> {q.duration}s
						  	</p>
						  	<p>
								<strong>Correct Answers:</strong>{" "}
								{Array.isArray(q.correctAnswers)
							  	? q.correctAnswers.join(", ")
							  	: ""}
						  	</p>
								
						  	<div className="flex flex-wrap gap-4">
								<button
								  	className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
								  	onClick={() => handleDeleteQuestion(index)}
								  	aria-label={`Delete Question ${index + 1}`}
								>
									❌ Delete
								</button>
								
								<button
								  	className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
								  	onClick={() => handleEditQuestion(index)}
								  	aria-label={`Edit Question ${index + 1}`}
								>
								  	Edit
								</button>
						  	</div>
						</div>
				  	))}
			  	</div>
			  
				<button
				  onClick={handleAddQuestion}
				  className="mt-6 px-6 py-2 bg-green-500 text-white text-lg font-semibold
				  rounded-xl hover:bg-green-600 transition"
				  aria-label="Add new question"
				>
				  ➕ Add New Question
				</button>
		  	</div>

			<Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
        		<h2 className="text-xl font-bold mb-4">Saved!</h2>
        		<p>Your game metadata has been successfully updated.</p>
        		<div className="mt-6 text-right">
        			<button
        			    onClick={() => setModalOpen(false)}
        			    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        			>
        			    OK
        			</button>
        		</div>
      		</Modal>
	  	</div>
	);
}

export default EditGame;
