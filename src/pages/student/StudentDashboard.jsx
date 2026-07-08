// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Student' });

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
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white uppercase">
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-3xl font-bold">Welcome, {user.name}! 🎓</h2>
          <p className="text-blue-100 text-lg">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ✅ Card 1: Enroll Courses – Navigate to /courses */}
          <div
            onClick={() => navigate('/courses')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-blue-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">Enroll Courses</h3>
              <p className="text-gray-400 text-sm mb-6">Browse all available courses and enroll to upgrade your skills.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-blue-500 group-hover:text-blue-400 text-center py-2 rounded-lg font-medium transition">
              Explore →
            </button>
          </div>

          {/* ✅ Card 2: My Courses – Navigate to /mycourses */}
          <div
            onClick={() => navigate('/mycourses')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-indigo-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">My Courses</h3>
              <p className="text-gray-400 text-sm mb-6">Continue your ongoing enrolled tracks right where you left off.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-indigo-500 group-hover:text-indigo-400 text-center py-2 rounded-lg font-medium transition">
              Go →
            </button>
          </div>

          {/* ✅ Card 3: Coding Practice – Navigate to practice */}
          <div
            onClick={() => navigate('/practice')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-emerald-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Coding Practice</h3>
              <p className="text-gray-400 text-sm mb-6">Solve topic-wise coding problems and improve your skills.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-emerald-500 group-hover:text-emerald-400 text-center py-2 rounded-lg font-medium transition">
              Practice →
            </button>
          </div>

          {/* ✅ Card 4: Live Quiz – Navigate to /student-live-quiz */}
          <div
            onClick={() => navigate('/student-live-quiz')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-amber-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">Live Quiz</h3>
              <p className="text-gray-400 text-sm mb-6">Join a live interactive quiz with a room code.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-amber-500 group-hover:text-amber-400 text-center py-2 rounded-lg font-medium transition">
              Join →
            </button>
          </div>

          {/* ✅ Card 5: My Progress – Navigate to /progress */}
          <div
            onClick={() => navigate('/progress')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-purple-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">My Progress</h3>
              <p className="text-gray-400 text-sm mb-6">Track your learning journey, XP, badges, and analytics.</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-purple-500 group-hover:text-purple-400 text-center py-2 rounded-lg font-medium transition">
              Track →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}