// src/pages/MyCourses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';


export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const API_BASE = config.API_BASE;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/student/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);

      // Fetch progress for each course
      const progressData = {};
      for (const course of data) {
        const progRes = await fetch(`${API_BASE}/api/student/progress/course/${course.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (progRes.ok) {
          const prog = await progRes.json();
          progressData[course.id] = prog;
        }
      }
      setProgress(progressData);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (courseId) => {
    const prog = progress[courseId] || [];
    const total = prog.length;
    const completed = prog.filter(p => p.completed).length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
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
            onClick={() => navigate('/student-dashboard')}
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
        <h2 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h2>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-[#11161f] rounded-xl border border-[#1e2330] p-10">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-white mb-2">No courses enrolled yet</h3>
            <p className="text-gray-400 text-sm">Go explore and enroll!</p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Explore Courses →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const { total, completed, pct } = getProgress(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}/modules`)}
                  className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5 hover:border-indigo-500/50 cursor-pointer transition flex items-center gap-4"
                >
                  <div className="text-3xl">{course.title?.charAt(0) || '📘'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <div className="text-sm text-gray-400">{completed}/{total} modules completed</div>
                    <div className="w-full h-2 bg-[#1e2330] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${pct === 100 ? 'bg-green-500/20 text-green-400' : pct > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}