// src/pages/teacher/ViewModule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function ViewModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!moduleId) {
      alert('No module selected');
      navigate('/teacher/courses');
      return;
    }
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch module');
      const data = await res.json();
      setModuleData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const targetCourseId = courseId || moduleData?.courseId;
    if (targetCourseId) {
      navigate(`/teacher/modules?courseId=${targetCourseId}`);
    } else {
      navigate('/teacher/courses');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#0a0f1a] text-red-400 flex items-center justify-center">{error}</div>;
  if (!moduleData) return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Module not found.</div>;

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
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{moduleData.title}</h1>
            <p className="text-gray-400">Learning Module Content</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-[#2a2f3f] hover:bg-[#3a3f4f] text-white px-4 py-2 rounded-lg transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="bg-[#1a202c] px-4 py-2 rounded-lg">
              <span className="text-xs text-gray-400 block uppercase">Module No</span>
              <span className="font-bold">{moduleData.orderIndex}</span>
            </div>
            <div className="bg-[#1a202c] px-4 py-2 rounded-lg">
              <span className="text-xs text-gray-400 block uppercase">Passing %</span>
              <span className="font-bold">{moduleData.passingPercentage}%</span>
            </div>
            <div className="bg-[#1a202c] px-4 py-2 rounded-lg">
              <span className="text-xs text-gray-400 block uppercase">Course ID</span>
              <span className="font-bold">{moduleData.courseId}</span>
            </div>
          </div>
          <div className="border-t border-[#1e2330] pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Module Notes</h2>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {moduleData.content || 'No content available.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}