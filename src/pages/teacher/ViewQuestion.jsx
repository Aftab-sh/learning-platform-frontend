// src/pages/teacher/ViewQuestion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ViewQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('questionId');
  const quizId = searchParams.get('quizId');
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 2
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!questionId) {
      alert('No question selected');
      navigate('/teacher/courses');
      return;
    }
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/quiz-questions/${questionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch question');
      const data = await res.json();
      setFormData({
        questionText: data.questionText || '',
        optionA: data.optionA || '',
        optionB: data.optionB || '',
        optionC: data.optionC || '',
        optionD: data.optionD || '',
        correctAnswer: data.correctAnswer || 'A',
        marks: data.marks || 2
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      questionText: formData.questionText.trim(),
      optionA: formData.optionA.trim(),
      optionB: formData.optionB.trim(),
      optionC: formData.optionC.trim(),
      optionD: formData.optionD.trim(),
      correctOption: ['A','B','C','D'].indexOf(formData.correctAnswer),
      marks: parseInt(formData.marks)
    };
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Updating...';
    try {
      const url = `${API_BASE}/api/teacher/quiz-questions/${questionId}?questionText=${encodeURIComponent(payload.questionText)}&optionA=${encodeURIComponent(payload.optionA)}&optionB=${encodeURIComponent(payload.optionB)}&optionC=${encodeURIComponent(payload.optionC)}&optionD=${encodeURIComponent(payload.optionD)}&correctOption=${payload.correctOption}&marks=${payload.marks}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Update failed');
      setSuccess('✅ Question updated!');
      setTimeout(() => {
        navigate(`/teacher/questions?quizId=${quizId}&moduleId=${moduleId}&courseId=${courseId}`);
      }, 1500);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Question';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/quiz-questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      alert('Deleted');
      navigate(`/teacher/questions?quizId=${quizId}&moduleId=${moduleId}&courseId=${courseId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Loading...</div>;

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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(`/teacher/questions?quizId=${quizId}&moduleId=${moduleId}&courseId=${courseId}`)}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Back to Questions
        </button>
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Question Details</h2>
          {error && <div className="text-red-400 mb-4">{error}</div>}
          {success && <div className="text-green-400 mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Question Text</label>
              <textarea
                id="questionText"
                rows="3"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.questionText}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Option A</label>
                <input
                  type="text"
                  id="optionA"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.optionA}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option B</label>
                <input
                  type="text"
                  id="optionB"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.optionB}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option C</label>
                <input
                  type="text"
                  id="optionC"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.optionC}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Option D</label>
                <input
                  type="text"
                  id="optionD"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.optionD}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Correct Answer</label>
                <select
                  id="correctAnswer"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.correctAnswer}
                  onChange={handleChange}
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
                  id="marks"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
              >
                Update Question
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition"
              >
                Delete Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}