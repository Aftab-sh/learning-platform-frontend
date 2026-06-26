// src/pages/teacher/TeacherLiveQuiz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function TeacherLiveQuiz() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [roomCode, setRoomCode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});
  const [roomCreated, setRoomCreated] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null);
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const getToken = () => localStorage.getItem('token');

  const apiCall = async (method, url, body) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Request failed');
    }
    return res.json();
  };

  const connectWebSocket = (room) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/live-quiz`),
      connectHeaders: {},
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Teacher WebSocket connected');
        stompClientRef.current = client;
        client.subscribe(`/topic/quiz/${room}/participants`, (msg) => {
          try {
            setParticipants(JSON.parse(msg.body));
          } catch (e) {}
        });
        client.subscribe(`/topic/quiz/${room}/leaderboard`, (msg) => {
          try {
            setLeaderboard(JSON.parse(msg.body));
          } catch (e) {}
        });
        // Join room (teacher)
        client.publish({
          destination: '/app/quiz.join',
          body: JSON.stringify({ roomCode: room }),
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        alert('WebSocket connection failed. Please refresh.');
      },
    });
    client.activate();
  };

  const createRoom = async () => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall('POST', `/api/live-quiz/create?title=${encodeURIComponent(quizTitle)}`);
      if (!res || !res.roomCode) throw new Error('No room code returned');
      setRoomCode(res.roomCode);
      setRoomCreated(true);
      connectWebSocket(res.roomCode);
      await loadQuestions(res.roomCode);
    } catch (err) {
      alert('Failed to create room: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (room = roomCode) => {
    try {
      const res = await apiCall('GET', `/api/live-quiz/room/${room}/questions`);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const addQuestion = async () => {
    if (!questionText.trim() || options.some((o) => !o.trim())) {
      alert('Please fill all fields.');
      return;
    }
    const optionsStr = options.join(',');
    try {
      await apiCall('POST', `/api/live-quiz/room/${roomCode}/add-question?questionText=${encodeURIComponent(questionText)}&options=${encodeURIComponent(optionsStr)}&correctOption=${correctOption}`);
      setModalOpen(false);
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectOption(0);
      await loadQuestions();
    } catch (err) {
      alert('Failed to add question: ' + err.message);
    }
  };

  const removeQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await apiCall('DELETE', `/api/live-quiz/room/${roomCode}/question/${id}`);
      await loadQuestions();
    } catch (err) {
      alert('Failed to delete question: ' + err.message);
    }
  };

  const startQuiz = async () => {
    try {
      const res = await apiCall('POST', `/api/live-quiz/start/${roomCode}`);
      if (res && res.started) {
        alert(`Quiz started! Total ${res.totalQuestions} questions.`);
        setStarted(true);
        setNextDisabled(false);
      } else {
        alert('Cannot start quiz. Add at least one question.');
      }
    } catch (err) {
      alert('Error starting quiz: ' + err.message);
    }
  };

  const nextQuestion = async () => {
    try {
      const res = await apiCall('POST', `/api/live-quiz/next/${roomCode}`);
      if (res.ended) {
        alert('🎉 Quiz Finished!');
        setNextDisabled(true);
      }
    } catch (err) {
      alert('Error moving to next question: ' + err.message);
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      alert('Room code copied!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ... rendering JSX (same as before, but ensure it uses state values)
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">LearnBridge</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/teacher-dashboard')} className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm font-medium transition">Dashboard</button>
          <button onClick={handleLogout} className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">Live Quiz Control</h2>

        {!roomCreated ? (
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-400 mb-1">Quiz Title</label>
              <input
                type="text"
                placeholder="Enter quiz title"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>
            <button
              onClick={createRoom}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Room Code: <span className="text-cyan-400 text-2xl font-mono cursor-pointer hover:underline" onClick={copyRoomCode}>{roomCode}</span>
                    <button onClick={copyRoomCode} className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Copy</button>
                  </h3>
                  <h4 className="text-gray-300">Quiz Title: <span className="text-white">{quizTitle}</span></h4>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setModalOpen(true)} className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm transition">+ Add Question</button>
                <button onClick={startQuiz} disabled={questions.length === 0} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition ${questions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>Start Quiz</button>
                <button onClick={nextQuestion} disabled={nextDisabled} className={`border border-gray-600 text-gray-300 px-4 py-1.5 rounded-lg text-sm transition ${!nextDisabled ? 'hover:border-cyan-400 hover:text-cyan-400' : 'opacity-50 cursor-not-allowed'}`}>Next Question</button>
              </div>

              <div className="mt-4">
                <h4 className="font-bold text-white">Questions ({questions.length})</h4>
                {questions.length === 0 && <p className="text-gray-500 text-sm mt-2">No questions yet.</p>}
                <div className="space-y-2 mt-2">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex justify-between items-center border-b border-[#1e2330] py-2">
                      <span className="text-gray-300">{idx+1}. {q.questionText}</span>
                      <button onClick={() => removeQuestion(q.id)} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4">
                <h4 className="font-bold text-white mb-2">Participants</h4>
                {participants.length === 0 ? <p className="text-gray-500">Waiting for participants...</p> : participants.map((p, i) => <div key={i} className="text-gray-300">{p}</div>)}
              </div>
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4">
                <h4 className="font-bold text-white mb-2">Leaderboard (Live)</h4>
                {Object.keys(leaderboard).length === 0 ? <p className="text-gray-500">Waiting for answers...</p> : (
                  <ol className="list-decimal ml-5">
                    {Object.entries(leaderboard).map(([name, score]) => (
                      <li key={name} className="text-gray-300"><strong>{name}</strong>: {score} points</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Question</h3>
            <input type="text" placeholder="Question text" className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white mb-3" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
            {[0,1,2,3].map(i => (
              <input key={i} type="text" placeholder={`Option ${String.fromCharCode(65+i)}`} className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white mb-2" value={options[i]} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} />
            ))}
            <select className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white mb-4" value={correctOption} onChange={(e) => setCorrectOption(parseInt(e.target.value))}>
              <option value="0">Option A</option>
              <option value="1">Option B</option>
              <option value="2">Option C</option>
              <option value="3">Option D</option>
            </select>
            <div className="flex gap-3">
              <button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex-1">Save</button>
              <button onClick={() => setModalOpen(false)} className="border border-gray-600 text-gray-300 hover:border-gray-400 px-6 py-2 rounded-lg transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}