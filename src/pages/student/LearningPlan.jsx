
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../../config/config';

export default function LearningPlan() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const API_BASE = config.API_BASE;

  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    const controller = new AbortController();

    const fetchLearningPlan = async () => {
      setLoading(true);
      setError('');
      setPlan('');

      try {
        const response = await fetch(
          `${API_BASE}/api/ai/progress/${courseId}/learning-plan`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'You are not authorized. Please log in again or check your access.'
          );
        }

        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message || 'Unable to generate your learning plan.'
          );
        }

        const result = await response.text();

        if (!result.trim()) {
          throw new Error('The AI returned an empty learning plan. Please try again.');
        }

        setPlan(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Learning plan error:', err);
          setError(err.message || 'Something went wrong. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLearningPlan();

    return () => controller.abort();
  }, [API_BASE, courseId, navigate]);

  const retry = () => {
    // Re-run the request by reloading the page.
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex flex-wrap justify-between items-center gap-4 bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">
          &lt;CodeLearn/&gt;
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mycourses')}
            className="border border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm transition"
          >
            ← My Courses
          </button>

          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-3xl font-bold text-white">
            AI Personalized Learning Plan
          </h1>
          <p className="text-gray-400 mt-3">
            Get learning recommendations based on your progress in this course.
          </p>
          <p className="text-sm text-cyan-400 mt-2">
            Course ID: {courseId}
          </p>
        </section>

        {loading && (
          <section
            className="bg-[#11161f] border border-[#1e2330] rounded-2xl p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#252c3a] border-t-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Creating your learning plan...
            </h2>
            <p className="text-gray-400 mt-2">
              AI is reviewing your available learning progress. This may take a
              little while.
            </p>
          </section>
        )}

        {!loading && error && (
          <section
            className="bg-[#11161f] border border-red-500/30 rounded-2xl p-6"
            role="alert"
          >
            <h2 className="text-xl font-bold text-red-300">
              Unable to load learning plan
            </h2>
            <p className="text-gray-300 mt-3 break-words">{error}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={retry}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-semibold px-5 py-2 rounded-lg transition"
              >
                Try Again
              </button>

              <button
                onClick={() => navigate('/mycourses')}
                className="border border-gray-600 hover:border-gray-400 px-5 py-2 rounded-lg transition"
              >
                Back to My Courses
              </button>
            </div>
          </section>
        )}

        {!loading && !error && plan && (
          <section className="bg-[#11161f] border border-cyan-500/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                🧠
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Your Recommended Plan
                </h2>
                <p className="text-sm text-gray-400">
                  Generated from your available course progress
                </p>
              </div>
            </div>

            <div className="border-t border-[#252c3a] pt-6">
              <div className="whitespace-pre-wrap break-words leading-7 text-gray-200">
                {plan}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#252c3a] flex flex-wrap gap-3">
              <button
                onClick={retry}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-semibold px-5 py-2 rounded-lg transition"
              >
                Generate Again
              </button>

              <button
                onClick={() => navigate(`/course/${courseId}/modules`)}
                className="border border-gray-600 hover:border-indigo-400 hover:text-indigo-300 px-5 py-2 rounded-lg transition"
              >
                Open Course Modules →
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
