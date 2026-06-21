// src/pages/student/LiveQuiz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from '@stomp/stompjs';

export default function LiveQuiz() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [active, setActive] = useState(false);
  const [ended, setEnded] = useState(false);
  const [question, setQuestion] = useState(null);
  const [timerPercent, setTimerPercent] = useState(100);
  const [pointsPotential, setPointsPotential] = useState(1000);
  const [leaderboard, setLeaderboard] = useState({});
  const [myScore, setMyScore] = useState(0);
  const [error, setError] = useState('');
  const stompClientRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const answeredRef = useRef(false);
  const API_BASE = 'http://localhost:8080';
  const TOTAL_TIME = 20000; // 20 seconds
  const MAX_POINTS = 1000;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const getToken = () => localStorage.getItem('token');

  const apiCall = async (method, url, body) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Request failed');
    }
    return res.json();
  };

  const connectWebSocket = () => {
    const socket = new SockJS(`${API_BASE}/live-quiz`);
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    stompClient.connect({}, () => {
      // Subscribe to question
      stompClient.subscribe(`/topic/quiz/${roomCode}/question`, (msg) => {
        const data = JSON.parse(msg.body);
        if (data.ended) {
          // Quiz ended
          clearInterval(timerIntervalRef.current);
          setActive(false);
          setEnded(true);
          // Fetch final leaderboard
          apiCall('GET', `/api/live-quiz/room/${roomCode}/leaderboard`)
            .then(lb => setLeaderboard(lb))
            .catch(console.error);
          return;
        }
        // New question
        setQuestion(data);
        setWaiting(false);
        setActive(true);
        setTimerPercent(100);
        setPointsPotential(MAX_POINTS);
        answeredRef.current = false;
        startTimeRef.current = Date.now();
        startTimer();
      });

      // Subscribe to leaderboard updates
      stompClient.subscribe(`/topic/quiz/${roomCode}/leaderboard`, (msg) => {
        const lb = JSON.parse(msg.body);
        setLeaderboard(lb);
        // Find my score
        if (studentName && lb[studentName] !== undefined) {
          setMyScore(lb[studentName]);
        }
      });

      // Join room
      stompClient.send('/app/quiz.join', {}, JSON.stringify({
        roomCode: roomCode,
        studentName: studentName
      }));
    }, (error) => {
      setError('WebSocket connection failed. Refresh and try again.');
    });
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      const percent = (remaining / TOTAL_TIME) * 100;
      setTimerPercent(percent);
      const points = Math.floor((remaining / TOTAL_TIME) * MAX_POINTS);
      setPointsPotential(points);
      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        setPointsPotential(0);
        if (!answeredRef.current) {
          answeredRef.current = true;
          stompClientRef.current.send('/app/quiz.answer', {}, JSON.stringify({
            roomCode: roomCode,
            questionId: question.id,
            selectedOption: -1,
            studentName: studentName,
            remainingPoints: 0
          }));
        }
      }
    }, 50);
  };

  const handleJoin = async () => {
    const name = studentName.trim();
    const room = roomCode.trim().toUpperCase();
    if (!name || !room) {
      alert('Enter name and room code');
      return;
    }
    try {
      const status = await apiCall('GET', `/api/live-quiz/room/${room}/exists`);
      if (!status || !status.exists) {
        setError('❌ Invalid room code.');
        return;
      }
      setError('');
      setStudentName(name);
      setRoomCode(room);
      setJoined(true);
      if (status.active) {
        setWaiting(false);
        setActive(true);
      } else {
        setWaiting(true);
        setActive(false);
      }
      connectWebSocket();
    } catch (err) {
      setError('❌ ' + (err.message || 'Invalid room code'));
    }
  };

  const handleOptionClick = (idx) => {
    if (answeredRef.current || !question) return;
    answeredRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    const remainingMs = Math.max(0, TOTAL_TIME - elapsed);
    const remainingPoints = Math.floor((remainingMs / TOTAL_TIME) * MAX_POINTS);
    clearInterval(timerIntervalRef.current);
    stompClientRef.current.send('/app/quiz.answer', {}, JSON.stringify({
      roomCode: roomCode,
      questionId: question.id,
      selectedOption: idx,
      studentName: studentName,
      remainingPoints: remainingPoints
    }));
    setPointsPotential(0);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderLeaderboard = () => {
    const entries = Object.entries(leaderboard);
    if (entries.length === 0) return <div className="text-gray-400">Waiting for answers...</div>;
    let rank = 1;
    return (
      <ol className="list-decimal ml-5 text-gray-300">
        {entries.map(([name, score]) => (
          <li key={name} className={name === studentName ? 'text-cyan-400 font-bold' : ''}>
            <strong>{rank++}.</strong> {name}: {score} pts
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">LearnBridge</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">Live Quiz</h2>

        {!joined ? (
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 space-y-4">
            <input
              type="text"
              placeholder="Your Display Name"
              className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room Code"
              className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button
              onClick={handleJoin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              Join Room
            </button>
            {error && <div className="text-red-400">{error}</div>}
          </div>
        ) : (
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 space-y-4">
            <div className="text-sm text-gray-400">
              Room: <span className="text-white font-mono">{roomCode}</span> | Welcome, <span className="text-white">{studentName}</span>
            </div>

            {waiting && !active && !ended && (
              <div className="text-center py-8 text-gray-400">⏳ Waiting for teacher to start the quiz...</div>
            )}

            {active && question && (
              <>
                <div className="w-full h-4 bg-[#1e2330] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-50"
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
                <div className="text-center text-2xl font-bold text-yellow-400">
                  ⭐ Potential Points: <span id="pointsPotential">{pointsPotential}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{question.questionText}</h3>
                <div className="space-y-2">
                  {question.options.map((opt, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 hover:border-cyan-400 transition disabled:opacity-50"
                      onClick={() => handleOptionClick(idx)}
                      disabled={answeredRef.current}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {ended && (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-cyan-400">🎉 Quiz Ended!</h2>
                <div className="mt-4">
                  <h3 className="font-bold text-white">🏆 Final Leaderboard</h3>
                  <div className="inline-block text-left">
                    {renderLeaderboard()}
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
                >
                  Join Another Quiz
                </button>
              </div>
            )}

            {(active || ended) && (
              <div className="mt-6 border-t border-[#1e2330] pt-4">
                <div className="text-center text-cyan-400 font-bold">🎯 Your Score: {myScore}</div>
                <div className="mt-2 bg-[#0f1219] rounded-lg p-4">
                  <strong className="text-white">🏆 Live Leaderboard</strong>
                  <div className="mt-2">{renderLeaderboard()}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}