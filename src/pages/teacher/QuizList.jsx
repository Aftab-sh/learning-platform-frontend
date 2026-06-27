// src/pages/teacher/QuizList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../config/config';

export default function QuizList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const API_BASE = config.API_BASE;

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
    loadQuizzes();
  }, [moduleId]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/quiz/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ New Delete Functionality
  const handleDelete = async (quizId) => {
    if (!window.confirm('Kya aap sach me is quiz ko delete karna chahte hain?')) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quiz/delete/${quizId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete quiz');
      
      // List se deleted quiz ko filter out karo taaki UI turant update ho jaye
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      alert('✅ Quiz successfully delete ho gaya!');
    } catch (err) {
      alert('❌ Delete karne me error aaya: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(`/teacher/modules?courseId=${courseId || ''}`)}
          className="text-cyan-400 hover:underline mb-4 inline-block cursor-pointer"
        >
          &larr; Back
        </button>
        
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Module Quizzes</h2>
            <p className="text-gray-400 text-sm">Manage quizzes for this module</p>
          </div>
          <button
            onClick={() => navigate(`/teacher/create-quiz?moduleId=${moduleId}&courseId=${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            + Create Quiz
          </button>
        </div>

        {loading && <div className="text-gray-400">Loading quizzes...</div>}
        {error && <div className="text-red-400">{error}</div>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-8">
                No quizzes found.{' '}
                <button 
                  onClick={() => navigate(`/teacher/create-quiz?moduleId=${moduleId}&courseId=${courseId}`)} 
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Create a quiz
                </button>
              </div>
            ) : (
              quizzes.map(quiz => (
                <div key={quiz.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5 shadow-lg hover:border-cyan-400/50 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{quiz.title}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 w-full">
                    <button
                      onClick={() => navigate(`/teacher/questions?quizId=${quiz.id}&moduleId=${moduleId}&courseId=${courseId}`)}
                      className="bg-cyan-400 text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-cyan-300 transition cursor-pointer"
                    >
                      Questions
                    </button>
                    
                    {/* ✅ New Delete Button */}
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      disabled={deleteLoading}
                      className="border border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      Delete
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