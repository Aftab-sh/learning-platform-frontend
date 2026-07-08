// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// ─── AUTH PAGES ───
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// ─── STUDENT PAGES ───
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import MyCourses from './pages/student/MyCourses';
import Modules from './pages/student/Modules';
import Content from './pages/student/Content';
import Practice from './pages/student/Practice';
import PracticeSolve from './pages/student/PracticeSolve';
import Progress from './pages/student/Progress';
import CodingPractice from './pages/student/CodingPractice';

// ─── TEACHER PAGES ───
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherManageCourses from './pages/teacher/TeacherManageCourses';
import TeacherCreateCourse from './pages/teacher/TeacherCreateCourse';
import TeacherModules from './pages/teacher/TeacherModules';
import CreateModule from './pages/teacher/CreateModule';
import EditModule from './pages/teacher/EditModule';
import TeacherCoding from './pages/teacher/TeacherCoding';
import TeacherCodingModules from './pages/teacher/TeacherCodingModules';
import TeacherCodingQuestions from './pages/teacher/TeacherCodingQuestions';
import TeacherInterviewProblems from './pages/teacher/TeacherInterviewProblems';
import TeacherStudents from './pages/teacher/TeacherStudents';
import ViewModule from './pages/teacher/ViewModule';
import ViewQuestion from './pages/teacher/ViewQuestion';
import QuizList from './pages/teacher/QuizList';
import Questions from './pages/teacher/Questions';
import CreateQuiz from './pages/teacher/CreateQuiz';
import CreateQuestion from './pages/teacher/CreateQuestion';

// ─── LIVE QUIZ (LAZY LOADED) ───
const LiveQuiz = lazy(() => import('./pages/student/LiveQuiz'));
const TeacherLiveQuiz = lazy(() => import('./pages/teacher/TeacherLiveQuiz'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── AUTH ROUTES ─── */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      // ─── STUDENT ROUTES ───
<Route path="/student-dashboard" element={<StudentDashboard />} />
<Route path="/courses" element={<Courses />} />               {/* ✅ Enroll Courses */}
<Route path="/mycourses" element={<MyCourses />} />           {/* ✅ My Courses */}
<Route path="/course/:courseId/modules" element={<Modules />} />
<Route path="/course/:courseId/module/:moduleId/content" element={<Content />} />

<Route path="/course/:courseId/module/:moduleId/coding-practice" element={<CodingPractice />} /> {/* ✅ Coding Practice */}
<Route path="/practice" element={<Practice />} />              {/* ✅ Practice (topics) */}
<Route path="/practice-solve" element={<PracticeSolve />} />
<Route path="/progress" element={<Progress />} />
<Route path="/student-live-quiz" element={<LiveQuiz />} />

        

        {/* ─── TEACHER ROUTES ─── */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        {/* Teacher: Course Management */}
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/manage-courses" element={<TeacherManageCourses />} />
        <Route path="/teacher/create-course" element={<TeacherCreateCourse />} />
        <Route path="/teacher/modules" element={<TeacherModules />} />
        <Route path="/teacher/create-module" element={<CreateModule />} />
        <Route path="/teacher/edit-module" element={<EditModule />} />

        {/* Teacher: Quiz Management */}
        <Route path="/teacher/quiz-list" element={<QuizList />} />
        <Route path="/teacher/questions" element={<Questions />} />
        <Route path="/teacher/view-question" element={<ViewQuestion />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher/create-question" element={<CreateQuestion />} />

        {/* Teacher: Coding Problems (Module-wise) */}
        <Route path="/teacher/coding" element={<TeacherCoding />} />
        <Route path="/teacher/coding-modules" element={<TeacherCodingModules />} />

        {/* Teacher: Interview Practice (Topic-wise) */}
        <Route path="/teacher/coding-questions" element={<TeacherCodingQuestions />} />
        <Route path="/teacher/interview-problems" element={<TeacherInterviewProblems />} />

        {/* ─── TEACHER LIVE QUIZ ─── */}
        <Route
          path="/teacher/live-quiz"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TeacherLiveQuiz />
            </Suspense>
          }
        />

        {/* Teacher: Student Analytics */}
        <Route path="/teacher/students" element={<TeacherStudents />} />

        {/* Teacher: View Module */}
        <Route path="/teacher/view-module" element={<ViewModule />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;