// src/pages/student/LiveQuiz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import config from '../../config/config';



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
  const [answered, setAnswered] = useState(false);

  // ✅ Refs - stale closure fix ke liye
  const stompClientRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const answeredRef = useRef(false);
  const questionRef = useRef(null);      // latest question
  const roomCodeRef = useRef('');        // latest roomCode
  const studentNameRef = useRef('');     // latest studentName

  const API_BASE = config.API_BASE;

  const TOTAL_TIME = 20000;
  const MAX_POINTS = 1000;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const apiCall = async (method, url, body) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return res.json();
  };

  // ✅ Parameters se lo - state se nahi
  const connectWebSocket = (room, name) => {
    console.log('🔌 Connecting WebSocket | room:', room, '| name:', name);

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/live-quiz`),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        console.log('✅ WebSocket Connected');
        stompClientRef.current = client;

        // ── Question Subscribe ──
        client.subscribe(`/topic/quiz/${room}/question`, (msg) => {
          console.log('📨 Question received:', msg.body);
          try {
            const data = JSON.parse(msg.body);

            if (data.ended) {
              clearInterval(timerIntervalRef.current);
              setActive(false);
              setEnded(true);
              setWaiting(false);
              apiCall('GET', `/api/live-quiz/room/${room}/leaderboard`)
                .then(lb => setLeaderboard(lb))
                .catch(console.error);
              return;
            }

            // ✅ Naya question aaya
            questionRef.current = data;
            answeredRef.current = false;
            setAnswered(false);
            setQuestion(data);
            setWaiting(false);
            setActive(true);
            setTimerPercent(100);
            setPointsPotential(MAX_POINTS);
            startTimer();

          } catch (e) {
            console.error('❌ Question parse error:', e);
          }
        });

        // ── Leaderboard Subscribe ──
        client.subscribe(`/topic/quiz/${room}/leaderboard`, (msg) => {
          try {
            const lb = JSON.parse(msg.body);
            setLeaderboard(lb);
            if (name && lb[name] !== undefined) {
              setMyScore(lb[name]);
            }
          } catch (e) {
            console.error('❌ Leaderboard parse error:', e);
          }
        });

        // ✅ Join - parameters use karo
        console.log('📤 Sending join | room:', room, '| name:', name);
        client.publish({
          destination: '/app/quiz.join',
          body: JSON.stringify({ roomCode: room, studentName: name }),
        });
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame);
        setError('WebSocket connection failed. Please refresh.');
      },
    });

    client.activate();
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      setTimerPercent((remaining / TOTAL_TIME) * 100);
      setPointsPotential(Math.floor((remaining / TOTAL_TIME) * MAX_POINTS));

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        setPointsPotential(0);

        // ✅ Ref se check karo - state nahi
        if (!answeredRef.current && questionRef.current && stompClientRef.current) {
          answeredRef.current = true;
          setAnswered(true);
          stompClientRef.current.publish({
            destination: '/app/quiz.answer',
            body: JSON.stringify({
              roomCode: roomCodeRef.current,
              questionId: questionRef.current.id,
              selectedOption: -1,
              studentName: studentNameRef.current,
              remainingPoints: 0,
            }),
          });
        }
      }
    }, 50);
  };

  const handleOptionClick = (idx) => {
    if (answeredRef.current || !questionRef.current) return;
    answeredRef.current = true;
    setAnswered(true);

    const elapsed = Date.now() - startTimeRef.current;
    const remainingMs = Math.max(0, TOTAL_TIME - elapsed);
    const remainingPoints = Math.floor((remainingMs / TOTAL_TIME) * MAX_POINTS);

    clearInterval(timerIntervalRef.current);
    setPointsPotential(remainingPoints);

    // ✅ Refs use karo
    stompClientRef.current.publish({
      destination: '/app/quiz.answer',
      body: JSON.stringify({
        roomCode: roomCodeRef.current,
        questionId: questionRef.current.id,
        selectedOption: idx,
        studentName: studentNameRef.current,
        remainingPoints: remainingPoints,
      }),
    });
  };

  const handleJoin = async () => {
    const name = studentName.trim();
    const room = roomCode.trim().toUpperCase();

    if (!name || !room) { alert('Enter name and room code'); return; }

    try {
      const status = await apiCall('GET', `/api/live-quiz/room/${room}/exists`);
      if (!status?.exists) { setError('❌ Invalid room code.'); return; }

      // ✅ Pehle refs update karo
      roomCodeRef.current = room;
      studentNameRef.current = name;

      setError('');
      setJoined(true);
      setWaiting(!status.active);
      setActive(false); // WebSocket se aayega

      // ✅ Direct values pass karo - state update ka wait nahi
      connectWebSocket(room, name);

    } catch (err) {
      setError('❌ ' + (err.message || 'Invalid room code'));
    }
  };

  const renderLeaderboard = () => {
    const entries = Object.entries(leaderboard);
    if (!entries.length) return <div className="text-gray-400">Waiting for answers...</div>;
    return (
      <ol className="list-decimal ml-5 text-gray-300 space-y-1">
        {entries.map(([name, score], idx) => (
          <li key={name} className={name === studentNameRef.current ? 'text-cyan-400 font-bold' : ''}>
            <strong>{idx + 1}.</strong> {name}: {score} pts
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
          <button onClick={() => navigate('/student-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm transition">
            Dashboard
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">Live Quiz</h2>

        {!joined ? (
          /* ── JOIN FORM ── */
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 space-y-4">
            <input type="text" placeholder="Your Display Name"
              className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            <input type="text" placeholder="Room Code"
              className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={handleJoin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
              Join Room
            </button>
            {error && <div className="text-red-400">{error}</div>}
          </div>
        ) : (
          /* ── QUIZ VIEW ── */
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 space-y-4">
            <div className="text-sm text-gray-400">
              Room: <span className="text-white font-mono">{roomCodeRef.current}</span>
              {' '}| Welcome, <span className="text-white">{studentNameRef.current}</span>
            </div>

            {/* Waiting */}
            {waiting && !active && !ended && (
              <div className="text-center py-12 text-gray-400 text-lg animate-pulse">
                ⏳ Waiting for teacher to start the quiz...
              </div>
            )}

            {/* Active Question */}
            {active && question && (
              <div className="space-y-4">
                {/* Timer Bar */}
                <div className="w-full h-4 bg-[#1e2330] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${timerPercent}%`, transitionDuration: '50ms' }} />
                </div>

                {/* Points */}
                <div className="text-center text-2xl font-bold text-yellow-400">
                  ⭐ {answered ? 'Answer Submitted!' : `Potential Points: ${pointsPotential}`}
                </div>

                {/* Question */}
                <h3 className="text-xl font-bold text-white">{question.questionText}</h3>

                {/* Options */}
                <div className="space-y-2">
                  {question.options.map((opt, idx) => (
                    <button key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={answered}
                      className={`w-full text-left rounded-lg px-4 py-3 border transition
                        ${answered
                          ? 'bg-[#1a202c] border-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-[#1a202c] border-gray-700 hover:border-cyan-400 hover:bg-cyan-400/10 cursor-pointer'
                        }`}>
                      <span className="font-bold text-cyan-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Ended */}
            {ended && (
              <div className="text-center py-8 space-y-4">
                <h2 className="text-3xl font-bold text-cyan-400">🎉 Quiz Ended!</h2>
                <div>
                  <h3 className="font-bold text-white text-lg mb-3">🏆 Final Leaderboard</h3>
                  <div className="inline-block text-left">{renderLeaderboard()}</div>
                </div>
                <button onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
                  Join Another Quiz
                </button>
              </div>
            )}

            {/* Live Score + Leaderboard (during quiz) */}
            {active && !ended && (
              <div className="border-t border-[#1e2330] pt-4 mt-2">
                <div className="text-center text-cyan-400 font-bold mb-2">
                  🎯 Your Score: {myScore}
                </div>
                <div className="bg-[#0f1219] rounded-lg p-4">
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