// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Teacher' });

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (!sessionUser) {
      navigate('/');
    } else {
      setUser(JSON.parse(sessionUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
          <span className="font-medium hidden sm:inline">{user.name}</span>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-800/30 p-8 rounded-2xl mb-10 shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}! 👨‍🏫</h2>
          <p className="text-gray-400 text-lg">Manage your courses, modules, and students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Manage Courses */}
          <div
            onClick={() => navigate('/teacher/courses')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-purple-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">Manage Courses</h3>
              <p className="text-gray-400 text-sm mb-6">Add, edit, or delete courses and modules.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-purple-500 group-hover:text-purple-400 text-center py-2 rounded-lg font-medium transition">
              Manage →
            </button>
          </div>

          {/* Card 2: Quiz Questions */}
          <div
            onClick={() => navigate('/teacher/quiz')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-emerald-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Quiz Questions</h3>
              <p className="text-gray-400 text-sm mb-6">Add MCQ questions for modules.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-emerald-500 group-hover:text-emerald-400 text-center py-2 rounded-lg font-medium transition">
              Add Questions →
            </button>
          </div>

          {/* Card 3: Coding Problems */}
          <div
            onClick={() => navigate('/teacher/coding')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-amber-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">Coding Problems</h3>
              <p className="text-gray-400 text-sm mb-6">Add coding problems for modules.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-amber-500 group-hover:text-amber-400 text-center py-2 rounded-lg font-medium transition">
              Add Problems →
            </button>
          </div>

          {/* Card 4: Live Quiz */}
          <div
            onClick={() => navigate('/teacher/live-quiz')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-rose-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-400 transition">Live Quiz</h3>
              <p className="text-gray-400 text-sm mb-6">Create and manage live quiz sessions.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-rose-500 group-hover:text-rose-400 text-center py-2 rounded-lg font-medium transition">
              Create Test →
            </button>
          </div>

          {/* Card 5: Students */}
          <div
            onClick={() => navigate('/teacher/students')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-cyan-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">Students</h3>
              <p className="text-gray-400 text-sm mb-6">View enrolled students and their progress.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-cyan-500 group-hover:text-cyan-400 text-center py-2 rounded-lg font-medium transition">
              View →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}