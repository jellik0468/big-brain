// src/pages/PlaySessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PlaySessionPage() {
    const { sessionId } = useParams();
    const playerId = localStorage.getItem(`player_${sessionId}`);

    // 1. Status polling
    const [hasStarted, setHasStarted]       = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    // 2. Question polling
    const [question, setQuestion]         = useState(null);
    const [sessionEnded, setSessionEnded] = useState(false);
    
    // 3. Selection state: null until a question arrives, then [] or a number
    const [selected, setSelected] = useState(null);

    // Poll /status
    useEffect(() => {
        if (!playerId) return;
        let cancelled = false;
        
        const checkStatus = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5005/play/${playerId}/status`
                );
                if (!cancelled) setHasStarted(res.data.started);
            } catch (err) {
                console.error('Status check failed', err);
            } finally {
                if (!cancelled) setLoadingStatus(false);
            }
        };

        checkStatus();
        const iv = setInterval(checkStatus, 1000);
        return () => {
            cancelled = true;
            clearInterval(iv);
        };
    }, [playerId]);

    // Poll /question once started
    useEffect(() => {
        if (!hasStarted || !playerId) return;
        let cancelled = false;

        const fetchQuestion = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5005/play/${playerId}/question`
                );
                if (!cancelled) setQuestion(res.data.question);
            } catch (err) {
                const msg = err.response?.data?.message?.toLowerCase() || '';
                if (msg.includes('ended') && !cancelled) {
                    setSessionEnded(true);
                } else {
                    console.error('Question fetch failed', err);
                }
            }
        };

        fetchQuestion();
        const iv = setInterval(fetchQuestion, 1000);
        return () => {
            cancelled = true;
            clearInterval(iv);
        };
    }, [hasStarted, playerId]);

    // Reset selection on new question
    useEffect(() => {
        if (!question) return;
        if (question.type === 'multiple') {
            setSelected([]);   // array for multiple
        } else {
            setSelected(null); // single choice not selected yet
        }
    }, [question?.text]);

    // Handle user selecting an option by index
    const handleSelect = idx => {
        let next;
        if (question.type === 'multiple') {
            const arr = Array.isArray(selected) ? selected : [];
            next = arr.includes(idx)
                ? arr.filter(i => i !== idx)
                : [...arr, idx];
        } else {
            next = idx;
        }
        setSelected(next);

        // Build payload as array of strings
        const answersPayload =
            question.type === 'multiple'
                ? (Array.isArray(next) ? next : []).map(i => question.answers[i])
                : [question.answers[next]];

        axios.put(`http://localhost:5005/play/${playerId}/answer`, {
            answers: answersPayload
        })
    };

    // Render logic
    if (loadingStatus) {
        return <p className="text-center mt-10">Checking game status…</p>;
    }

    if (!hasStarted) {
        return (
            <p className="text-center mt-10 font-medium text-lg">
              Please wait for the host to start the game…
            </p>
        );
    }

    if (!question && !sessionEnded) {
        return <p className="text-center mt-10">Loading question…</p>;
    }

    if (sessionEnded) {
        return <p className="text-center mt-10">Session has ended.</p>;
    }

    // Question UI
    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-gray-800 rounded">
            <h2 className="text-xl font-bold mb-2 text-white">{question.text}</h2>

            <form className="space-y-2">
                {question.answers.map((ans, index) => {
                    const id = `opt-${index}`;
                    // Safely check array only if selected is an array
                    const isChecked = question.type === 'multiple'
                        ? Array.isArray(selected) && selected.includes(index)
                        : selected === index;

                    return (
                        <div key={id} className="flex items-center">
                            <input
                                id={id}
                                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                name="answer"
                                checked={isChecked}
                                onChange={() => handleSelect(index)}
                                className="mr-2"
                            />
                            <label htmlFor={id} className="text-white">
                            {ans}
                            </label>
                        </div>
                    );
                })}
            </form>

            <p className="mt-4 text-sm text-gray-300">
                <strong>Selected:</strong>{' '}
                {question.type === 'multiple'
                    ? (Array.isArray(selected) ? selected : [])
                        .map(i => `"${question.answers[i]}"`)
                        .join(', ')
                    : selected !== null
                    ? `"${question.answers[selected]}"`
                    : 'none'}
            </p>
        </div>
    );
}

export default PlaySessionPage;