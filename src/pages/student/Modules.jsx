// src/pages/Modules.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config/config';


export default function Modules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('Course');
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      // Fetch modules
      const res = await fetch(`${API_BASE}/api/student/course/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch modules');
      const data = await res.json();
      setModules(data);
      if (data.length > 0) {
        // Try to get course title from first module (or separate API)
        setCourseTitle(data[0].courseTitle || 'Course');
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModule = (moduleId, moduleTitle) => {
    localStorage.setItem('cl_current_module', moduleId);
    localStorage.setItem('cl_current_module_title', moduleTitle);
    navigate(`/course/${courseId}/module/${moduleId}/content`);
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
            onClick={() => navigate('/mycourses')}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← My Courses
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">{courseTitle} — Modules</h2>
          <p className="text-gray-400 text-sm mt-1">Complete each module to unlock the next one.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-[#11161f] rounded-xl border border-[#1e2330] p-10">
            No modules found.
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod, index) => (
              <div
                key={mod.id}
                className={`bg-[#11161f] border border-[#1e2330] rounded-xl p-5 flex items-center gap-4 transition ${
                  mod.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/50 cursor-pointer'
                }`}
                onClick={() => !mod.locked && openModule(mod.id, mod.title)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  mod.completed ? 'bg-green-500/20 text-green-400' : 'bg-[#1a202c] text-gray-400'
                }`}>
                  {mod.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{mod.title}</h3>
                  <div className="text-sm text-gray-400">
                    {mod.locked
                      ? '🔒 Complete previous module first'
                      : mod.completed
                      ? `✅ Completed — Score: ${mod.quizScore || 0}%`
                      : '📖 Click to start learning'}
                  </div>
                </div>
                <div>
                  {mod.locked ? (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">Locked</span>
                  ) : mod.completed ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">Done</span>
                  ) : (
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition">
                      Start →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}