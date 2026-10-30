// src/pages/student/Progress.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

export default function Progress() {
  const navigate = useNavigate();
  const API_BASE = config.API_BASE;

  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    const authHeaders = { Authorization: 'Bearer ' + token };

    const loadProgress = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Logged-in student ke enrolled courses
        const coursesResponse = await fetch(
          API_BASE + '/api/student/courses',
          { headers: authHeaders }
        );

        if (coursesResponse.status === 401 || coursesResponse.status === 403) {
          throw new Error(
            'You are not authorized to view your progress. Please log in again.'
          );
        }

        if (!coursesResponse.ok) {
          throw new Error('Unable to load your enrolled courses.');
        }

        const coursesData = await coursesResponse.json();
        const enrolledCourses = Array.isArray(coursesData) ? coursesData : [];

        setCourses(enrolledCourses);

        if (enrolledCourses.length === 0) {
          setCourseProgress([]);
          return;
        }

        // 2. Har course ka module progress
        const progressResults = await Promise.all(
          enrolledCourses.map(async (course) => {
            const courseId = course.id ?? course.courseId;

            if (courseId == null) {
              return { course, modules: [], error: 'Course ID is missing.' };
            }

            try {
              const response = await fetch(
                API_BASE + '/api/student/progress/course/' + courseId,
                { headers: authHeaders }
              );

              if (!response.ok) {
                return {
                  course,
                  modules: [],
                  error: 'Unable to load progress for this course.',
                };
              }

              const modules = await response.json();

              return {
                course,
                modules: Array.isArray(modules) ? modules : [],
                error: '',
              };
            } catch (e) {
              return {
                course,
                modules: [],
                error: 'Unable to connect to load this course progress.',
              };
            }
          })
        );

        setCourseProgress(progressResults);
      } catch (err) {
        console.error('Error loading student progress:', err);
        setError(err.message || 'Something went wrong while loading progress.');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [API_BASE, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getCourseTitle = (course) =>
    course.title ||
    course.courseName ||
    course.name ||
    'Course ' + (course.id ?? course.courseId ?? '');

  const isCompleted = (module) => module.completed === true;

  const totalModules = courseProgress.reduce(
    (total, item) => total + item.modules.length,
    0
  );

  const completedModules = courseProgress.reduce(
    (total, item) => total + item.modules.filter(isCompleted).length,
    0
  );

  const overallPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const totalCourses = courses.length;

  const getCoursePercentage = (modules) => {
    if (!modules.length) return 0;
    const completed = modules.filter(isCompleted).length;
    return Math.round((completed / modules.length) * 100);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#1e2330] border-t-cyan-400" />
          <p className="text-gray-400">Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      {/* Navigation */}
      <nav className="flex flex-wrap justify-between items-center gap-4 bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            ← Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Learning Progress</h1>
          <p className="text-gray-400 mt-2">
            Track your course completion, module progress and quiz scores.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            <p>{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Overall summary */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5">
                <p className="text-sm text-gray-400">Enrolled Courses</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{totalCourses}</p>
              </div>

              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5">
                <p className="text-sm text-gray-400">Total Modules</p>
                <p className="text-3xl font-bold text-white mt-2">{totalModules}</p>
              </div>

              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5">
                <p className="text-sm text-gray-400">Completed Modules</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{completedModules}</p>
              </div>

              <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5">
                <p className="text-sm text-gray-400">Overall Completion</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{overallPercentage}%</p>
              </div>
            </section>

            {/* Overall progress bar */}
            <section className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5 sm:p-6 mb-8">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <h2 className="text-lg font-bold text-white">Overall Course Progress</h2>

                <span className="text-sm text-cyan-400 font-semibold">
                  {completedModules} of {totalModules} modules completed
                </span>
              </div>

              <div
                className="w-full h-3 bg-[#1e2330] rounded-full overflow-hidden"
                role="progressbar"
                aria-label="Overall course completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overallPercentage}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: overallPercentage + '%' }}
                />
              </div>

              <p className="text-sm text-gray-400 mt-3">
                {totalModules === 0
                  ? 'Your module progress will appear here once course data is available.'
                  : overallPercentage === 100
                    ? 'Great work! You have completed all modules in your enrolled courses.'
                    : 'Keep learning and complete the remaining modules to make progress.'}
              </p>
            </section>

            {/* Course progress */}
            <section>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <h2 className="text-2xl font-bold text-white">Progress by Course</h2>

                <span className="text-sm text-gray-400">
                  {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
                </span>
              </div>

              {courses.length === 0 ? (
                <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-bold text-white">No enrolled courses yet</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Enroll in a course to start tracking your learning progress.
                  </p>
                  <button
                    onClick={() => navigate('/student-dashboard')}
                    className="mt-5 bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-semibold px-5 py-2 rounded-lg transition"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {courseProgress.map((item, index) => {
                    const { course, modules, error: courseError } = item;
                    const percentage = getCoursePercentage(modules);
                    const completed = modules.filter(isCompleted).length;

                    return (
                      <article
                        key={course.id ?? course.courseId ?? index}
                        className="bg-[#11161f] border border-[#1e2330] rounded-xl p-5 sm:p-6"
                      >
                        {/* Course heading */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {getCourseTitle(course)}
                            </h3>

                            <p className="text-sm text-gray-400 mt-1">
                              {completed} of {modules.length} modules completed
                            </p>
                          </div>

                          <span className="text-lg font-bold text-cyan-400">
                            {courseError ? '—' : percentage + '%'}
                          </span>
                        </div>

                        {!courseError && (
                          <div
                            className="w-full h-2 bg-[#1e2330] rounded-full overflow-hidden mb-5"
                            role="progressbar"
                            aria-label={getCourseTitle(course) + ' completion'}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percentage}
                          >
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: percentage + '%' }}
                            />
                          </div>
                        )}

                        {courseError ? (
                          <p className="text-sm text-red-300">{courseError}</p>
                        ) : modules.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No modules are available for this course yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {modules.map((module, moduleIndex) => {
                              const completedModule = isCompleted(module);

                              return (
                                <div
                                  key={module.moduleId ?? moduleIndex}
                                  className="border border-[#252c3a] rounded-lg p-4"
                                >
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={
                                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                                          (completedModule
                                            ? 'bg-green-500/15 text-green-400'
                                            : 'bg-[#1e2330] text-gray-400')
                                        }
                                      >
                                        {completedModule
                                          ? '✓'
                                          : (module.orderIndex ?? moduleIndex + 1)}
                                      </div>

                                      <div>
                                        <h4 className="font-semibold text-white">
                                          {module.moduleTitle || 'Module ' + (moduleIndex + 1)}
                                        </h4>

                                        <p className="text-xs text-gray-400 mt-1">
                                          {completedModule ? 'Module completed' : 'In progress'}
                                        </p>
                                      </div>
                                    </div>

                                    <span
                                      className={
                                        'self-start text-xs font-semibold px-3 py-1 rounded-full ' +
                                        (completedModule
                                          ? 'bg-green-500/10 text-green-400'
                                          : 'bg-yellow-500/10 text-yellow-400')
                                      }
                                    >
                                      {completedModule ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pl-11 text-sm">
                                    <span className="text-gray-400">
                                      Quiz Score:{' '}
                                      <span className="text-white font-medium">
                                        {module.quizScore ?? 0}%
                                      </span>
                                    </span>

                                    <span className="text-gray-400">
                                      Completed On:{' '}
                                      <span className="text-white font-medium">
                                        {formatDate(module.completedAt)}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}