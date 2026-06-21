// src/pages/teacher/Questions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Questions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 0,
    marks: 1
  });
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!moduleId) {
      alert('Module ID missing');
      navigate('/teacher/courses');
      return;
    }
    loadQuestions();
  }, [moduleId]);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/quiz-questions?moduleId=${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/quiz-questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Deleted');
      loadQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      questionText: formData.questionText.trim(),
      optionA: formData.optionA.trim(),
      optionB: formData.optionB.trim(),
      optionC: formData.optionC.trim(),
      optionD: formData.optionD.trim(),
      correctOption: parseInt(formData.correctOption),
      marks: parseInt(formData.marks)
    };
    if (!data.questionText) return alert('Question text required');
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      const url = editingId
        ? `${API_BASE}/api/teacher/quiz-questions/${editingId}?questionText=${encodeURIComponent(data.questionText)}&optionA=${encodeURIComponent(data.optionA)}&optionB=${encodeURIComponent(data.optionB)}&optionC=${encodeURIComponent(data.optionC)}&optionD=${encodeURIComponent(data.optionD)}&correctOption=${data.correctOption}&marks=${data.marks}`
        : `${API_BASE}/api/teacher/quiz-questions?moduleId=${moduleId}&questionText=${encodeURIComponent(data.questionText)}&optionA=${encodeURIComponent(data.optionA)}&optionB=${encodeURIComponent(data.optionB)}&optionC=${encodeURIComponent(data.optionC)}&optionD=${encodeURIComponent(data.optionD)}&correctOption=${data.correctOption}&marks=${data.marks}`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Save failed');
      alert(editingId ? 'Question updated' : 'Question added');
      setShowModal(false);
      resetForm();
      loadQuestions();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Question';
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 0,
      marks: 1
    });
    setEditingId(null);
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setFormData({
      questionText: q.questionText,
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctOption: q.correctOption || 0,
      marks: q.marks || 1
    });
    setShowModal(true);
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
        <button
          onClick={() => navigate(`/teacher/quiz-list?moduleId=${moduleId}&courseId=${courseId}`)}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Back to Quizzes
        </button>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-white">Quiz Questions</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Question
          </button>
        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center text-gray-400">No questions. Click Add Question.</div>
            ) : (
              questions.map((q, idx) => {
                let optionsText = '';
                try {
                  const opts = JSON.parse(q.options);
                  optionsText = opts.join(' | ');
                } catch {
                  optionsText = q.options || '';
                }
                const letter = ['A','B','C','D'][q.correctOption] || '?';
                return (
                  <div key={q.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{idx+1}. {q.questionText}</div>
                      <div className="text-sm text-gray-400">{optionsText}</div>
                      <div className="text-xs text-gray-500">Correct: {letter} | Marks: {q.marks}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Question */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#11161f] border border-[#2a2f3f] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Question' : 'Add Question'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Question Text</label>
                <textarea
                  rows="2"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.questionText}
                  onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Option A</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.optionA}
                    onChange={(e) => setFormData({...formData, optionA: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Option B</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.optionB}
                    onChange={(e) => setFormData({...formData, optionB: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Option C</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.optionC}
                    onChange={(e) => setFormData({...formData, optionC: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Option D</label>
                  <input
                    type="text"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.optionD}
                    onChange={(e) => setFormData({...formData, optionD: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Correct Answer</label>
                  <select
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.correctOption}
                    onChange={(e) => setFormData({...formData, correctOption: parseInt(e.target.value)})}
                  >
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Marks</label>
                  <input
                    type="number"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex-1">
                  Save Question
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="border border-gray-600 text-gray-300 hover:border-gray-400 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}