// src/pages/student/Practice.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Practice() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [problems, setProblems] = useState([]);
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [currentTopicId, setCurrentTopicId] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/student/practice/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch topics');
      const data = await res.json();
      setTopics(data);
      if (data.length > 0) {
        setCurrentTopicId(data[0].id);
        loadProblems(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async (topicId, difficulty = currentDifficulty) => {
    if (!topicId) return;
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE}/api/student/practice/problems?topicId=${topicId}`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch problems');
      const data = await res.json();
      setProblems(data);
      // Fetch solved status
      const solvedRes = await fetch(`${API_BASE}/api/student/practice/solved`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (solvedRes.ok) {
        const solvedData = await solvedRes.json();
        setSolvedSet(new Set(solvedData));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (id) => {
    setCurrentTopicId(id);
    loadProblems(id);
  };

  const handleDifficultyClick = (diff) => {
    setCurrentDifficulty(diff);
    if (currentTopicId) loadProblems(currentTopicId, diff);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">Practice Problems</h2>

        {loading && topics.length === 0 && <div className="text-gray-400">Loading topics...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && topics.length === 0 && !error && (
          <div className="text-gray-400">No topics available. Teacher needs to add topics first.</div>
        )}

        {/* Topic Buttons */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {topics.map(topic => (
              <button
                key={topic.id}
                className={`px-4 py-1.5 rounded-full border transition ${
                  currentTopicId === topic.id
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'bg-[#1a202c] border-gray-700 text-gray-300 hover:border-cyan-400'
                }`}
                onClick={() => handleTopicClick(topic.id)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        )}

        {/* Difficulty Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
            <button
              key={diff}
              className={`px-4 py-1.5 rounded-full border transition ${
                currentDifficulty === diff
                  ? 'bg-cyan-400 text-black border-cyan-400'
                  : 'bg-[#1a202c] border-gray-700 text-gray-300 hover:border-cyan-400'
              }`}
              onClick={() => handleDifficultyClick(diff)}
            >
              {diff === 'all' ? 'All' : diff}
            </button>
          ))}
        </div>

        {/* Problems Grid */}
        {loading && <div className="text-gray-400">Loading problems...</div>}
        {!loading && problems.length === 0 && (
          <div className="text-gray-400">No problems in this topic.</div>
        )}
        {!loading && problems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map(problem => {
              const solved = solvedSet.has(problem.id);
              return (
                <div
                  key={problem.id}
                  className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition transform hover:-translate-y-1"
                  onClick={() => navigate(`/practice-solve?problemId=${problem.id}&topicId=${currentTopicId}`)}
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{solved && '✓ '}{problem.title}</span>
                    {solved && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Solved</span>}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{problem.difficulty}</span>
                    {!solved && <span className="text-gray-400">🏆 {problem.marks} marks</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}