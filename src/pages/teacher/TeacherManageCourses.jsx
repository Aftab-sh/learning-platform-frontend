// src/pages/teacher/TeacherManageCourses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherManageCourses() {
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
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/course/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editCourse = async (id, oldTitle, oldDesc) => {
    const newTitle = prompt('New title:', oldTitle);
    if (newTitle === null) return; // cancelled
    if (!newTitle.trim()) return alert('Title cannot be empty');
    const newDesc = prompt('New description:', oldDesc) || '';
    try {
      const res = await fetch(
        `${API_BASE}/api/teacher/course/update/${id}?title=${encodeURIComponent(newTitle)}&description=${encodeURIComponent(newDesc)}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!res.ok) throw new Error('Update failed');
      alert('Course updated');
      loadCourses();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course? All modules, quizzes, coding will be deleted.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/course/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      alert('Deleted');
      loadCourses();
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="text-cyan-400 hover:underline mb-4 inline-block"
        >
          ← Dashboard
        </button>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-white">Manage My Courses</h2>
          <button
            onClick={() => navigate('/teacher/create-course')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Create New Course
          </button>
        </div>

        {loading && <div className="text-center text-gray-400">Loading...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center text-gray-400">No courses yet. <button onClick={() => navigate('/teacher/create-course')} className="text-cyan-400 hover:underline">Create one</button></div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-white">{course.title}</div>
                    <div className="text-sm text-gray-400">{course.description || ''}</div>
                    <div className="text-xs text-green-400 mt-1">👥 {course.enrolledStudents || 0} student{course.enrolledStudents !== 1 ? 's' : ''} enrolled</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => editCourse(course.id, course.title, course.description)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/modules?courseId=${course.id}`)}
                      className="bg-cyan-400 text-black px-3 py-1 rounded-lg text-sm font-medium hover:bg-cyan-300 transition"
                    >
                      Modules
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