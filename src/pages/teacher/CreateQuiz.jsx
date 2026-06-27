// src/pages/teacher/CreateQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!moduleId) {
      alert('Module ID missing. Please select a module first.');
      navigate('/teacher/courses');
    }
  }, [moduleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = quizTitle.trim();
    if (!title) return alert('Quiz title is required');

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/quiz/create/${moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to create quiz');
      const quiz = await res.json();
      // Redirect to create question page with quizId, moduleId, courseId
      navigate(`/teacher/create-question?quizId=${quiz.id}&moduleId=${moduleId}&courseId=${courseId || ''}`);
    } catch (err) {
      setError('❌ ' + err.message);
      setLoading(false);
    }
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
            onClick={() => navigate(`/teacher/modules?courseId=${courseId}`)}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Create Module Quiz</h2>
          <p className="text-gray-400 text-sm">Create quiz for this module</p>
        </div>
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
          {error && <div className="text-red-400 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Example: Python Loops Quiz"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Continue To Add Questions →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}