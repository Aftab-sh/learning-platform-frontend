// src/pages/teacher/TeacherInterviewProblems.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function TeacherInterviewProblems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topicId');
  const [problems, setProblems] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sampleInput: '',
    sampleOutput: '',
    hiddenTestInput: '',
    hiddenTestOutput: '',
    difficulty: 'Easy',
    marks: 10,
    orderIndex: 1
  });
  const [modalOpen, setModalOpen] = useState(false);
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!topicId) {
      alert('No topic selected');
      navigate('/teacher/coding-questions');
      return;
    }
    loadTopicName();
    loadProblems();
  }, [topicId]);

  const loadTopicName = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const topic = data.find(t => t.id == topicId);
      setTopicName(topic ? topic.name : 'Topic');
    } catch (err) {
      console.warn(err);
    }
  };

  const loadProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/interview-problems/topic/${topicId}`, {
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sampleInput: '',
      sampleOutput: '',
      hiddenTestInput: '',
      hiddenTestOutput: '',
      difficulty: 'Easy',
      marks: 10,
      orderIndex: 1
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    const { title } = formData;
    if (!title.trim()) return alert('Title required');
    const data = {
      ...formData,
      marks: parseInt(formData.marks),
      orderIndex: parseInt(formData.orderIndex),
      topic: { id: parseInt(topicId) }
    };
    try {
      const url = editingId
        ? `/api/teacher/interview-problems/${editingId}`
        : '/api/teacher/interview-problems';
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
      setModalOpen(false);
      resetForm();
      loadProblems();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteProblem = async (id) => {
    if (!confirm('Delete this problem?')) return;
    try {
      await fetch(`${API_BASE}/api/teacher/interview-problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      loadProblems();
    } catch (err) {
      alert(err.message);
    }
  };

  const editProblem = (problem) => {
    setEditingId(problem.id);
    setFormData({
      title: problem.title,
      description: problem.description || '',
      sampleInput: problem.sampleInput || '',
      sampleOutput: problem.sampleOutput || '',
      hiddenTestInput: problem.hiddenTestInput || '',
      hiddenTestOutput: problem.hiddenTestOutput || '',
      difficulty: problem.difficulty || 'Easy',
      marks: problem.marks || 10,
      orderIndex: problem.orderIndex || 1
    });
    setModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getDiffBadge = (diff) => {
    const cls = diff === 'Easy' ? 'bg-green-500/20 text-green-400' :
                diff === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{diff}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/coding-questions')}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Topics
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
          <h2 className="text-2xl font-bold text-white">Problems for Topic: <span className="text-cyan-400">{topicName}</span></h2>
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Problem
          </button>
        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center">No problems yet. Click "Add Problem".</p>
            ) : (
              problems.map(p => (
                <div key={p.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 hover:border-cyan-400 transition">
                  <div className="font-bold text-white text-lg">{p.title}</div>
                  <div className="flex justify-between items-center mt-2">
                    {getDiffBadge(p.difficulty)}
                    <span className="text-sm text-gray-400">🏆 {p.marks} marks</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Order: {p.orderIndex}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProblem(p)}
                        className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-3 py-1 rounded-lg text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProblem(p.id)}
                        className="border border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-[#11161f] border border-[#2a2f3f] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Problem' : 'Add Problem'}</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                rows="2"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Sample Input"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.sampleInput}
                  onChange={(e) => setFormData({...formData, sampleInput: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Sample Output"
                  className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.sampleOutput}
                  onChange={(e) => setFormData({...formData, sampleOutput: e.target.value})}
                />
              </div>
              <textarea
                placeholder="Hidden Test Input (one per line)"
                rows="2"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.hiddenTestInput}
                onChange={(e) => setFormData({...formData, hiddenTestInput: e.target.value})}
              />
              <textarea
                placeholder="Hidden Test Output (match order)"
                rows="2"
                className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                value={formData.hiddenTestOutput}
                onChange={(e) => setFormData({...formData, hiddenTestOutput: e.target.value})}
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <input
                  type="number"
                  placeholder="Marks"
                  className="bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.marks}
                  onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                />
                <input
                  type="number"
                  placeholder="Order"
                  className="bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex-1">
                Save
              </button>
              <button onClick={() => setModalOpen(false)} className="border border-gray-600 text-gray-300 hover:border-gray-400 px-6 py-2 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}