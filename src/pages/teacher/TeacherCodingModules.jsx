// src/pages/teacher/TeacherCodingModules.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherCodingModules() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const coursesRes = await fetch(`${API_BASE}/api/teacher/course/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
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
          onClick={() => navigate('/teacher-dashboard')}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Dashboard
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">Manage Coding Problems</h2>
        <p className="text-gray-400 mb-6">Select a module to add/edit/delete coding problems.</p>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="space-y-6">
            {courses.length === 0 ? (
              <div className="text-gray-400">No courses found. Create a course first.</div>
            ) : (
              courses.map(course => {
                // We'll fetch modules per course using an inner component or simple state; we'll do it inline using a separate fetch inside the map
                // But easier: we'll add a state for modules per course (optional)
                // For simplicity, we can load modules on click of "Manage Coding Problems" button via navigation to a new route with courseId
                // However, the UI expects a list of modules per course, so we'll create a nested component
                // But to keep it simple, we'll show a button to go to course modules list
                return (
                  <div key={course.id} className="border-l-4 border-cyan-400 pl-4">
                    <div className="text-xl font-bold text-white mb-2">{course.title}</div>
                    <div className="space-y-2 ml-4">
                      {/* We need to load modules for this course */}
                      <ModuleList courseId={course.id} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component to load modules per course
function ModuleList({ courseId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/teacher/course/${courseId}/modules`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to load modules');
        const data = await res.json();
        setModules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, [courseId]);

  if (loading) return <div className="text-gray-500 text-sm">Loading modules...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (modules.length === 0) return <div className="text-gray-500 text-sm">No modules.</div>;

  return (
    <>
      {modules.map(module => (
        <div key={module.id} className="flex justify-between items-center bg-[#11161f] border border-[#1e2330] rounded-xl px-4 py-2">
          <span className="font-semibold text-gray-200">{module.title}</span>
          <button
            onClick={() => navigate(`/teacher/coding?moduleId=${module.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm transition"
          >
            Manage Coding Problems →
          </button>
        </div>
      ))}
    </>
  );
}