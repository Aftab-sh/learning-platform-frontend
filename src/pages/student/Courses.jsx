// src/pages/Courses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config/config';


export default function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrolling, setEnrolling] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') || 'explore';

const API_BASE = config.API_BASE;
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Use correct endpoint
      const res = await fetch(`${API_BASE}/api/student/all-courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      // ✅ Ensure data is an array
      setCourses(Array.isArray(data) ? data : []);

      // Fetch enrolled courses
      const enrolledRes = await fetch(`${API_BASE}/api/student/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (enrolledRes.ok) {
        const enrolledData = await enrolledRes.json();
        setEnrolledIds(Array.isArray(enrolledData) ? enrolledData.map(c => c.id) : []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]); // ✅ Prevent .map error
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      const res = await fetch(`${API_BASE}/api/student/enroll/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setEnrolledIds([...enrolledIds, courseId]);
        alert('✅ Enrolled successfully!');
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Enroll error:', err);
      alert('Unable to connect to server');
    } finally {
      setEnrolling(null);
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === 'explore' ? 'All Courses' : 'Browse Courses'}
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No courses available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div key={course.id} className="bg-[#11161f] border border-[#1e2330] rounded-xl overflow-hidden hover:border-blue-500/50 transition shadow-md">
                  <div className="h-28 bg-gradient-to-r from-blue-900/40 to-indigo-900/30 flex items-center justify-center text-4xl">
                    {course.title?.charAt(0) || '📘'}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{course.description || 'Learn this course'}</p>
                    <div className="mt-4">
                      {isEnrolled ? (
                        <button
                          onClick={() => navigate(`/course/${course.id}/modules`)}
                          className="w-full border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 py-2 rounded-lg font-medium transition"
                        >
                          Continue →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling === course.id}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}