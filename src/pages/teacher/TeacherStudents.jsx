// src/pages/teacher/TeacherStudents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalEnrollments: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const API_BASE = config.API_BASE;

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
      // Fetch all students
      const studentsRes = await fetch(`${API_BASE}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!studentsRes.ok) throw new Error('Failed to fetch students');
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      // Fetch enrollment stats
      const statsRes = await fetch(`${API_BASE}/api/teacher/enrollment-stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      const totalStudents = studentsData.length;
      const totalCourses = statsData.length;
      const totalEnrollments = statsData.reduce((sum, c) => sum + c.enrolledStudents, 0);
      setStats({ totalStudents, totalCourses, totalEnrollments });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showStudentDetail = async (studentId) => {
    setModalOpen(true);
    setSelectedStudent(students.find(s => s.id === studentId));
    setStudentProgress(null);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/student-progress/${studentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load progress');
      const data = await res.json();
      setStudentProgress(data);
    } catch (err) {
      alert('Error loading details: ' + err.message);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setStudentProgress(null);
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
        <h2 className="text-2xl font-bold text-white mb-6">Student Analytics</h2>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400">{stats.totalStudents}</div>
                <div className="text-gray-400 text-sm">Total Students</div>
              </div>
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400">{stats.totalCourses}</div>
                <div className="text-gray-400 text-sm">Your Courses</div>
              </div>
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400">{stats.totalEnrollments}</div>
                <div className="text-gray-400 text-sm">Total Enrollments</div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">All Students</h3>
            <div className="space-y-3">
              {students.length === 0 ? (
                <p className="text-gray-400">No students found.</p>
              ) : (
                students.map(student => (
                  <div
                    key={student.id}
                    className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition"
                    onClick={() => showStudentDetail(student.id)}
                  >
                    <div className="font-bold text-white">{student.name}</div>
                    <div className="text-sm text-gray-400">{student.email}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{selectedStudent.name} <span className="text-sm font-normal text-gray-400">({selectedStudent.email})</span></h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            {studentProgress ? (
              <>
                <h4 className="font-bold text-white mt-4 mb-2">Course Progress</h4>
                {studentProgress.courseProgress && studentProgress.courseProgress.length > 0 ? (
                  studentProgress.courseProgress.map((cp, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{cp.courseTitle}</span>
                        <span>{cp.completedModules}/{cp.totalModules} modules ({cp.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#1e2330] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${cp.percentage}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No courses enrolled yet.</p>
                )}
                <h4 className="font-bold text-white mt-4 mb-2">Interview Practice</h4>
                <p>Solved problems: <span className="text-green-400 font-bold">{studentProgress.solvedInterviewProblems || 0}</span></p>
              </>
            ) : (
              <div className="text-gray-400">Loading details...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}