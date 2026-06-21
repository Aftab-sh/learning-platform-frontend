// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (!sessionUser) {
      navigate('/');
      return;
    }
    try {
      const parsed = JSON.parse(sessionUser);
      // ✅ Ensure name fallback
      if (!parsed.name) parsed.name = parsed.email || 'Teacher';
      setUser(parsed);
    } catch {
      navigate('/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ✅ Safe fallback while user loads
  if (!user) {
    return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Loading...</div>;
  }

  const displayName = user.name || user.email || 'Teacher';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white uppercase">
            {initial}
          </div>
          <span className="font-medium hidden sm:inline">{displayName}</span>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-800/30 p-8 rounded-2xl mb-10 shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, Teacher {displayName}! 👨‍🏫</h2>
          <p className="text-gray-400 text-lg">Manage your courses, modules, quizzes, and coding problems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: My Courses */}
          <div
            onClick={() => navigate('/teacher/manage-courses')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-blue-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">My Courses</h3>
              <p className="text-gray-400 text-sm mb-6">View, edit, delete, manage modules</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-blue-500 group-hover:text-blue-400 text-center py-2 rounded-lg font-medium transition">
              Manage →
            </button>
          </div>

          {/* Card 2: Create New Course */}
          <div
            onClick={() => navigate('/teacher/create-course')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-emerald-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">➕</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Create New Course</h3>
              <p className="text-gray-400 text-sm mb-6">Add a new course</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-emerald-500 group-hover:text-emerald-400 text-center py-2 rounded-lg font-medium transition">
              Create →
            </button>
          </div>

          {/* Card 3: Coding Problems (module-wise) */}
          <div
            onClick={() => navigate('/teacher/coding-modules')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-cyan-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">Coding Problems</h3>
              <p className="text-gray-400 text-sm mb-6">Add / edit / delete coding problems for any module</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-cyan-500 group-hover:text-cyan-400 text-center py-2 rounded-lg font-medium transition">
              Manage →
            </button>
          </div>

          {/* Card 4: Coding Questions (topic-wise interview practice) */}
          <div
            onClick={() => navigate('/teacher/coding-questions')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-amber-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">🗂️</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">Coding Questions</h3>
              <p className="text-gray-400 text-sm mb-6">Manage topics (Arrays, Strings, Recursion) and problems</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-amber-500 group-hover:text-amber-400 text-center py-2 rounded-lg font-medium transition">
              Manage →
            </button>
          </div>

          {/* Card 5: Student Analytics */}
          <div
            onClick={() => navigate('/teacher/students')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-rose-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-400 transition">Student Analytics</h3>
              <p className="text-gray-400 text-sm mb-6">View all students, enrollments, progress</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-rose-500 group-hover:text-rose-400 text-center py-2 rounded-lg font-medium transition">
              Track →
            </button>
          </div>

          {/* Card 6: Live Quiz */}
          <div
            onClick={() => navigate('/teacher/live-quiz')}
            className="bg-[#11161f] border border-[#1e2330] p-6 rounded-xl hover:border-green-500/50 cursor-pointer transition shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">Live Quiz</h3>
              <p className="text-gray-400 text-sm mb-6">Create and host real-time quiz battles</p>
            </div>
            <button className="w-full border border-gray-600 text-gray-300 group-hover:border-green-500 group-hover:text-green-400 text-center py-2 rounded-lg font-medium transition">
              Start →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}