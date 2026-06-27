// src/pages/teacher/TeacherCourses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

export default function TeacherCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const API_BASE = config.API_BASE;


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/course/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Dashboard
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">All My Courses</h2>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-gray-400">No courses found.</p>
            ) : (
              courses.map(course => (
                <div key={course.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4">
                  <div className="font-bold text-white">{course.title}</div>
                  <div className="text-gray-400 text-sm">{course.description || ''}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}