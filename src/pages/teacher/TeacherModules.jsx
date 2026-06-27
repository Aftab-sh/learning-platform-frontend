// src/pages/teacher/TeacherModules.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function TeacherModules() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!courseId || courseId === 'null') {
      alert('No course selected');
      navigate('/teacher/courses');
      return;
    }
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/module/list/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch modules');
      const data = await res.json();
      setModules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteModule = async (id) => {
    if (!confirm('Delete this module? All quizzes and coding problems will be deleted.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/module/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      alert('Module deleted');
      loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!courseId) return <div className="text-center py-10 text-gray-400">No course selected.</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/courses')}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Back to Courses
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
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-white">Modules for Course ID: {courseId}</h3>
          <button
            onClick={() => navigate(`/teacher/create-module?courseId=${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Create Module
          </button>
        </div>

        {loading && <div className="text-center text-gray-400">Loading modules...</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center">No modules yet. Click "Create Module".</p>
            ) : (
              modules.map(mod => (
                <div key={mod.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 hover:border-blue-500/50 transition">
                  <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/teacher/view-module?moduleId=${mod.id}&courseId=${courseId}`)}
                      className="bg-cyan-400 text-black px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Open Module
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/edit-module?moduleId=${mod.id}&courseId=${courseId}`)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteModule(mod.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/create-quiz?moduleId=${mod.id}&courseId=${courseId}`)}
                      className="bg-green-500 text-black px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Create Quiz
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/quiz-list?moduleId=${mod.id}&courseId=${courseId}`)}
                      className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      View Quiz
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}