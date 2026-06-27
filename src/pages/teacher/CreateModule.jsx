// src/pages/teacher/CreateModule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModuleContentEditor from './ModuleContentEditor';
import config from '../../config/config';
export default function CreateModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [formData, setFormData] = useState({
    title: '',
    orderIndex: '',
    passingPercentage: 50,
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!courseId || courseId === 'null') {
      alert('Invalid course ID');
      navigate('/teacher/courses');
      return;
    }
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Quill editor ke liye alag handler (kyunki ye event nahi, direct HTML string deta hai)
  const handleContentChange = (html) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { title, orderIndex, passingPercentage, content } = formData;
    if (!title.trim()) return alert('Title required');
    if (!orderIndex) return alert('Order required');
    if (!passingPercentage) return alert('Passing percentage required');

    const payload = {
      title: title.trim(),
      content: content || '',
      orderIndex: parseInt(orderIndex),
      passingPercentage: parseInt(passingPercentage)
    };

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/module/create/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create module');
      setSuccess('✅ Module created! Redirecting...');
      setTimeout(() => {
        navigate(`/teacher/modules?courseId=${courseId}`);
      }, 1500);
    } catch (err) {
      setError('❌ ' + err.message);
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

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Create Module</h2>
          {error && <div className="text-red-400 mb-4">{error}</div>}
          {success && <div className="text-green-400 mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Module Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Order Index</label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Passing %</label>
                <input
                  type="number"
                  name="passingPercentage"
                  value={formData.passingPercentage}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>
            </div>

            {/* ✅ Textarea ki jagah ab Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Module Content</label>
              <ModuleContentEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your module content here — use headings, bold text, lists, and code blocks..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Module'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}