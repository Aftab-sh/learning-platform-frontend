// src/pages/student/Progress.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Progress() {
  const navigate = useNavigate();
  const [xpData, setXpData] = useState({ xp: 0, streak: 0, badges: [] });
  const [level, setLevel] = useState({ level: 1, title: 'Beginner', next: 100 });
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:8080';

  const ALL_BADGES = [
    { id: 'first_login', label: '🌟 First Login', desc: 'Login for the first time' },
    { id: 'streak_3', label: '🔥 3 Day Streak', desc: 'Login 3 days in a row' },
    { id: 'streak_7', label: '⚡ 7 Day Streak', desc: 'Login 7 days in a row' },
    { id: 'streak_30', label: '👑 30 Day Streak', desc: 'Login 30 days in a row' },
    { id: 'xp_100', label: '⭐ 100 XP', desc: 'Earn 100 XP' },
    { id: 'xp_500', label: '💎 500 XP', desc: 'Earn 500 XP' },
    { id: 'xp_1000', label: '🏆 1000 XP', desc: 'Earn 1000 XP' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadProgressData();
  }, []);

  const getLevel = (xp) => {
    if (xp >= 1000) return { level: 5, title: 'Master', next: 1500 };
    if (xp >= 500) return { level: 4, title: 'Expert', next: 1000 };
    if (xp >= 250) return { level: 3, title: 'Advanced', next: 500 };
    if (xp >= 100) return { level: 2, title: 'Intermediate', next: 250 };
    return { level: 1, title: 'Beginner', next: 100 };
  };

  const loadProgressData = async () => {
    setLoading(true);
    try {
      // Fetch progress from backend
      const res = await fetch(`${API_BASE}/api/student/progress/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setXpData(data.xpData || { xp: 0, streak: 0, badges: [] });
        setAnalytics(data.analytics || []);
      } else {
        // Fallback to localStorage
        const savedXp = localStorage.getItem('cl_xp');
        const savedStreak = localStorage.getItem('cl_streak');
        const savedBadges = localStorage.getItem('cl_badges');
        setXpData({
          xp: parseInt(savedXp) || 0,
          streak: parseInt(savedStreak) || 0,
          badges: savedBadges ? JSON.parse(savedBadges) : []
        });
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const xp = xpData.xp || 0;
  const streak = xpData.streak || 0;
  const badges = xpData.badges || [];
  const lvl = getLevel(xp);
  const pct = Math.min(100, Math.round((xp / lvl.next) * 100));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* XP Card */}
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/30 border border-purple-800/30 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-lg font-bold text-white">Level {lvl.level} — {lvl.title}</div>
              <div className="text-sm text-gray-400">{xp} XP total</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">🔥 {streak}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
          </div>
          <div className="w-full h-2 bg-[#1e2330] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{xp} XP</span>
            <span>{lvl.next} XP for Level {lvl.level + 1}</span>
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Quiz Analytics</h2>
          <p className="text-gray-400 text-sm mb-6">Track your performance across all modules.</p>
          {analytics.length === 0 ? (
            <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 text-center text-gray-400">
              No quiz data available yet. Start taking quizzes!
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((item, idx) => (
                <div key={idx} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{item.moduleTitle}</span>
                    <span className={`font-bold ${item.score >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1e2330] rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${item.score >= 60 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.score}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{item.attempts || 1} attempt(s)</span>
                    <span>{item.completed ? '✅ Completed' : '📖 In Progress'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white mb-4">🏅 My Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_BADGES.map((b) => {
              const earned = badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`bg-[#11161f] border rounded-xl p-4 text-center transition ${
                    earned ? 'border-green-500/50 hover:border-green-400' : 'border-[#1e2330] opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-2">{b.label.split(' ')[0]}</div>
                  <div className="font-bold text-sm text-white">{b.label.substring(2)}</div>
                  <div className="text-xs text-gray-400 mt-1">{b.desc}</div>
                  <div className={`mt-2 text-xs font-bold ${earned ? 'text-green-400' : 'text-gray-500'}`}>
                    {earned ? '✓ Earned' : '🔒 Locked'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}