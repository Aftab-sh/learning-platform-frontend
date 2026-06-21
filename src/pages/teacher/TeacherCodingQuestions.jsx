// src/pages/teacher/TeacherCodingQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherCodingQuestions() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [topicName, setTopicName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load topics');
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async () => {
    const name = topicName.trim();
    if (!name) return alert('Topic name required');
    const data = { name, description: '' };
    try {
      const url = editingId
        ? `/api/teacher/topics/${editingId}`
        : '/api/teacher/topics';
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
      setTopicName('');
      setEditingId(null);
      loadTopics();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteTopic = async (id) => {
    if (!confirm('Delete this topic? All problems under it will be deleted.')) return;
    try {
      await fetch(`${API_BASE}/api/teacher/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      loadTopics();
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-white">Coding Topics (Interview Practice)</h2>
          <button
            onClick={() => {
              setEditingId(null);
              setTopicName('');
              setModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Topic
          </button>
        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center">No topics yet. Click "Add Topic".</p>
            ) : (
              topics.map(topic => (
                <div key={topic.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 hover:border-cyan-400 transition flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-lg text-white">{topic.name}</div>
                  </div>
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={() => {
                        setEditingId(topic.id);
                        setTopicName(topic.name);
                        setModalOpen(true);
                      }}
                      className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-3 py-1 rounded-lg text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="border border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-lg text-sm transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/interview-problems?topicId=${topic.id}`)}
                      className="border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-3 py-1 rounded-lg text-sm transition"
                    >
                      Problems
                    </button>
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
          <div className="bg-[#11161f] border border-[#2a2f3f] rounded-xl p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit Topic' : 'Add Topic'}</h3>
            <input
              type="text"
              placeholder="Topic Name (e.g., Arrays, Strings)"
              className="w-full bg-[#1a202c] border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveTopic}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex-1"
              >
                Save
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="border border-gray-600 text-gray-300 hover:border-gray-400 px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}