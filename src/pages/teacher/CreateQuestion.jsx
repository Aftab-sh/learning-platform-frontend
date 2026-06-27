// src/pages/teacher/CreateQuestion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const quizId = searchParams.get('quizId');

  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 2
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
    if (!moduleId) {
      alert('Module ID missing. Please go back to modules.');
      navigate('/teacher/courses');
    }
  }, [moduleId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks } = formData;
    if (!questionText.trim()) return alert('Question text required');
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      return alert('All options required');
    }

    const correctOptionMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctOption = correctOptionMap[correctAnswer];

    setLoading(true);
    setError('');
    setSuccess('');

    const params = new URLSearchParams({
      moduleId: moduleId,
      questionText: questionText.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctOption: correctOption,
      marks: parseInt(marks)
    });

    try {
      const res = await fetch(`${API_BASE}/api/teacher/quiz-questions?${params.toString()}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to add question');
      setSuccess('✅ Question added!');
      // Reset form
      setFormData({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 2
      });
      // Redirect back to quiz list after short delay
      setTimeout(() => {
        navigate(`/teacher/quiz-list?moduleId=${moduleId}&courseId=${courseId || ''}`);
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
            onClick={() => navigate(`/teacher/quiz-list?moduleId=${moduleId}&courseId=${courseId}`)}
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

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Add Quiz Question</h2>
          {error && <div className="text-red-400 mb-4">{error}</div>}
          {success && <div className="text-green-400 mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Question Text</label>
              <textarea
                name="questionText"
                rows="3"
                value={formData.questionText}
                onChange={handleChange}
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Option A</label>
                <input
                  type="text"
                  name="optionA"
                  value={formData.optionA}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option B</label>
                <input
                  type="text"
                  name="optionB"
                  value={formData.optionB}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option C</label>
                <input
                  type="text"
                  name="optionC"
                  value={formData.optionC}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option D</label>
                <input
                  type="text"
                  name="optionD"
                  value={formData.optionD}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Correct Answer</label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Marks</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  min="1"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}