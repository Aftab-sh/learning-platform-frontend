// src/pages/student/Content.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Content() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [moduleData, setModuleData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('content'); // 'content', 'quiz', 'result'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [passingPct, setPassingPct] = useState(50);
  const API_BASE = 'http://localhost:8080';

  // ─── FETCH MODULE & QUIZ DATA ───
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchModuleData();
    fetchQuizQuestions();
  }, [moduleId]);

  const fetchModuleData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/student/course/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const mod = data.find(m => m.id == moduleId);
      if (mod) {
        setModuleData(mod);
        setPassingPct(mod.passingPercentage || 50);
        localStorage.setItem('cl_current_module_title', mod.title);
      }
    } catch (err) {
      console.error('Error fetching module:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/student/module/${moduleId}/quiz`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
    }
  };

  // ─── NAVIGATION ───
  // ✅ FIX: Ab yahan se courseId aur moduleId dono URL parameters me pass honge
  const handlePracticeClick = () => {
    navigate(`/course/${courseId}/module/${moduleId}/coding-practice`);
  };

  // ─── QUIZ SUBMIT ───
  const handleQuizSubmit = async () => {
    const unanswered = questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) {
      alert(`Please answer all ${unanswered.length} question(s)!`);
      return;
    }

    const answersMap = {};
    questions.forEach((q, i) => { 
      answersMap[q.id] = answers[i]; 
    });

    try {
      const res = await fetch(`${API_BASE}/api/student/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ moduleId: parseInt(moduleId), answers: answersMap })
      });
      const data = await res.json();
      setQuizResult(data);
      setView('result');
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
    }
  };

  // ─── QUIZ QUESTION RENDER VIEW ───
  const renderQuestion = () => {
    const q = questions[currentQ];
    if (!q) return null;
    
    const letters = ['A', 'B', 'C', 'D'];
    const total = questions.length;

    let rawOptions = [];
    try {
      rawOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    } catch (e) {
      rawOptions = q.options || [];
    }

    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => setView('content')}
          className="text-cyan-400 hover:underline mb-4 inline-block text-sm font-medium cursor-pointer"
        >
          &larr; Exit Quiz
        </button>

        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border border-blue-800/30 p-6 rounded-xl mb-6">
          <h1 className="text-2xl font-bold text-white">Quiz: {moduleData?.title}</h1>
          <p className="text-gray-400 text-sm mt-1">Question {currentQ + 1} of {total} | Passing Criteria: {passingPct}%</p>
        </div>

        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 shadow-xl">
          <div className="mb-6">
            <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">Question {currentQ + 1}</div>
            <div className="text-lg font-medium text-white whitespace-pre-wrap">{q.questionText}</div>
          </div>

          <div className="space-y-3">
            {rawOptions.map((opt, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-150 text-sm font-medium cursor-pointer ${
                  answers[currentQ] === idx
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 font-semibold'
                    : 'border-[#1e2330] bg-[#161b26]/50 text-gray-300 hover:border-gray-600 hover:bg-[#161b26]'
                }`}
                onClick={() => setAnswers({ ...answers, [currentQ]: idx })}
              >
                <span className="text-cyan-500 mr-2">{letters[idx]}.</span> {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#1e2330] flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap items-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    i === currentQ ? 'bg-cyan-400 scale-125 ring-4 ring-cyan-400/20' :
                    answers[i] !== undefined ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                  onClick={() => setCurrentQ(i)}
                  title={`Go to question ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="border border-[#1e2330] text-gray-400 hover:border-gray-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                &larr; Prev
              </button>
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="bg-[#1e2330] border border-gray-700 text-white hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition cursor-pointer"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── RESULT SUMMARY VIEW ───
  const renderResult = () => {
    if (!quizResult) return null;
    const pct = Math.round(quizResult.score);
    const passed = quizResult.passed;

    return (
      <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#11161f] border border-[#1e2330] rounded-2xl p-8 text-center shadow-2xl">
          <div className={`text-6xl font-black mb-3 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct}%
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? '🎉 Passed Successfully!' : '😔 Required Passing Percentage Not Met'}
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{quizResult.message}</p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {!passed && (
              <button
                onClick={() => {
                  setView('quiz');
                  setAnswers({});
                  setCurrentQ(0);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-bold transition cursor-pointer"
              >
                Retry Quiz
              </button>
            )}
            <button
              onClick={() => navigate(`/course/${courseId}/modules`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition cursor-pointer"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-gray-400 flex items-center justify-center text-lg tracking-wide">
        <span className="animate-pulse">Loading core content metadata...</span>
      </div>
    );
  }

  if (view === 'result') return renderResult();
  if (view === 'quiz' && questions.length > 0) return renderQuestion();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      {/* Dynamic Navbar */}
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/course/${courseId}/modules`)}
            className="border border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            &larr; Modules
          </button>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }} 
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(`/course/${courseId}/modules`)}
          className="text-cyan-400 hover:underline mb-4 inline-block text-sm font-medium cursor-pointer"
        >
          &larr; Back to Module List
        </button>

        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border border-blue-800/30 p-6 rounded-xl mb-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white tracking-tight">{moduleData?.title || 'Loading Lecture Module...'}</h1>
          <p className="text-gray-400 text-sm mt-1">Master the concepts thoroughly below, then benchmark your progress via the module checkpoints.</p>
        </div>

        {/* Lecture Notes Rich Content Box */}
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl overflow-hidden shadow-2xl mb-8">
          <div 
            className="p-6 prose prose-invert max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: moduleData?.content || '<p className="text-gray-500">No textbook lecture notes recorded for this active index.</p>' 
            }}
          />
        </div>

        {/* Footer Task Controls */}
        <div className="flex flex-wrap gap-4 justify-center items-center pt-2">
          {questions.length > 0 ? (
            <button
              onClick={() => setView('quiz')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/30 transition transform hover:-translate-y-0.5 cursor-pointer text-base"
            >
              📝 Take Module Quiz ({questions.length})
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-800 text-gray-500 px-10 py-3.5 rounded-xl font-bold border border-gray-700 cursor-not-allowed text-base"
            >
              🔒 No Quiz Available
            </button>
          )}
          
          <button
            onClick={handlePracticeClick}
            className="border border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 px-10 py-3.5 rounded-xl font-bold transition transform hover:-translate-y-0.5 cursor-pointer text-base"
          >
            💻 Practice Sandbox Problems
          </button>
        </div>
      </div>
    </div>
  );
}