// src/pages/teacher/TeacherCreateCourse.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherCreateCourse() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Optionally verify teacher role
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert('Title required');
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const teacherId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).id
        : null;
      if (!teacherId) throw new Error('Teacher ID not found');
      const res = await fetch(`${API_BASE}/api/teacher/course/create/${teacherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: trimmedTitle, description })
      });
      if (!res.ok) throw new Error('Failed to create course');
      setMessage({ type: 'success', text: '✅ Course created! Redirecting...' });
      setTimeout(() => {
        navigate('/teacher/courses');
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
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
            onClick={() => navigate('/teacher-dashboard')}
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

      <div className="max-w-lg mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Dashboard
        </button>
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Course</h2>
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Course Title</label>
              <input
                type="text"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows="3"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}