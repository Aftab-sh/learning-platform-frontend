// src/pages/teacher/TeacherCoding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function TeacherCoding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    constraintsText: '',
    sampleInput: '',
    sampleOutput: '',
    hiddenTestInput: '',
    hiddenTestOutput: '',
    difficulty: 'Easy',
    marks: 10,
    orderIndex: 1
  });
  const API_BASE =config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!moduleId) {
      alert('Module ID missing');
      navigate('/teacher/coding-modules');
      return;
    }
    loadProblems();
  }, [moduleId]);

  const loadProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/coding-problems/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load problems');
      const data = await res.json();
      setProblems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, hiddenTestInput, hiddenTestOutput } = formData;
    if (!title.trim()) return alert('Title required');
    if (!hiddenTestInput.trim() || !hiddenTestOutput.trim()) return alert('Hidden test cases required');

    const data = {
      ...formData,
      marks: parseInt(formData.marks),
      orderIndex: parseInt(formData.orderIndex)
    };

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const url = editingId
        ? `/api/teacher/coding-problems/${editingId}`
        : `/api/teacher/coding-problems/${moduleId}`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Save failed');
      alert(editingId ? 'Problem updated' : 'Problem added');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadProblems();
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Problem';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      constraintsText: '',
      sampleInput: '',
      sampleOutput: '',
      hiddenTestInput: '',
      hiddenTestOutput: '',
      difficulty: 'Easy',
      marks: 10,
      orderIndex: 1
    });
  };

  const editProblem = (problem) => {
    setEditingId(problem.id);
    setFormData({
      title: problem.title,
      description: problem.description || '',
      constraintsText: problem.constraintsText || '',
      sampleInput: problem.sampleInput || '',
      sampleOutput: problem.sampleOutput || '',
      hiddenTestInput: problem.hiddenTestInput || '',
      hiddenTestOutput: problem.hiddenTestOutput || '',
      difficulty: problem.difficulty || 'Easy',
      marks: problem.marks || 10,
      orderIndex: problem.orderIndex || 1
    });
    setShowForm(true);
  };

  const deleteProblem = async (id) => {
    if (!confirm('Delete this problem?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/coding-problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      alert('Deleted');
      loadProblems();
    } catch (err) {
      alert(err.message);
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
            onClick={() => navigate('/teacher/coding-modules')}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Back to Modules
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
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-white">Coding Problems for Module: {moduleId}</h3>
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Problem
          </button>
        </div>

        {loading && <div className="text-center text-gray-400">Loading...</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {problems.length === 0 ? (
              <p className="text-gray-400">No coding problems yet. Click "Add Problem".</p>
            ) : (
              problems.map(p => (
                <div key={p.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <strong className="text-white">{p.title}</strong> ({p.difficulty}) - {p.marks} marks<br />
                    <small className="text-gray-400">Order: {p.orderIndex}</small>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProblem(p)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProblem(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Problem' : 'Add New Problem'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  rows="3"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Constraints (optional)</label>
                <textarea
                  rows="2"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.constraintsText}
                  onChange={(e) => setFormData({...formData, constraintsText: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Sample Input</label>
                  <textarea
                    rows="2"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({...formData, sampleInput: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Sample Output</label>
                  <textarea
                    rows="2"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({...formData, sampleOutput: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Hidden Test Input (separate with newline)</label>
                  <textarea
                    rows="3"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.hiddenTestInput}
                    onChange={(e) => setFormData({...formData, hiddenTestInput: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Hidden Test Output (match order)</label>
                  <textarea
                    rows="3"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.hiddenTestOutput}
                    onChange={(e) => setFormData({...formData, hiddenTestOutput: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Difficulty</label>
                  <select
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Marks</label>
                  <input
                    type="number"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Order Index</label>
                  <input
                    type="number"
                    className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button id="saveBtn" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
                  Save Problem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="border border-gray-600 text-gray-300 hover:border-gray-400 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}