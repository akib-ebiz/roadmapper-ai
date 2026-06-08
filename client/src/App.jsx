import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/auth.store'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Course pages
import CourseList from './pages/courses/CourseList'
import CourseDetails from './pages/courses/CourseDetails'
import CreateCourse from './pages/instructor/CreateCourse'
import GenerateCourse from './pages/instructor/GenerateCourse'
import GenerateQuiz from './pages/instructor/GenerateQuiz'

// Dashboard pages
import StudentDashboard from './pages/student/Dashboard'
import MyCourses from './pages/student/MyCourses'
import LearningPath from './pages/student/LearningPath'
import TakeQuiz from './pages/student/TakeQuiz'
import QuizResults from './pages/student/QuizResults'
import InstructorDashboard from './pages/instructor/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

// Route guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleRoute from './components/auth/RoleRoute'

// ─── Home redirect based on role ─────────────────────────────────
function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Roadmapper AI</h1>
          <p className="text-gray-500 text-lg mb-8">AI-Powered Course Builder</p>
          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Sign in
            </a>
            <a
              href="/register"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Create account
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Redirect authenticated users to their dashboard
  const roleRoutes = {
    student: '/student/dashboard',
    instructor: '/instructor/dashboard',
    admin: '/admin/dashboard',
  }

  return <Navigate to={roleRoutes[user?.role] || '/student/dashboard'} replace />
}

// ─── 401 Unauthorized page ────────────────────────────────────────
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-400">403</h1>
        <p className="text-gray-600 mt-4 text-lg">Access denied</p>
        <p className="text-gray-400 text-sm mt-2">You don&apos;t have permission to view this page.</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline text-sm">
          Go home
        </a>
      </div>
    </div>
  )
}

// ─── 404 page ─────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-gray-600 mt-4">Page not found</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Go home
        </a>
      </div>
    </div>
  )
}

// ─── App Routes ───────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Public courses */}
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetails />} />

      {/* Student routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['student', 'admin']}>
              <StudentDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['student', 'admin']}>
              <MyCourses />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId/learn"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['student', 'admin']}>
              <LearningPath />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quiz/:quizId"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['student', 'admin']}>
              <TakeQuiz />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quiz/results/:attemptId"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['student', 'admin']}>
              <QuizResults />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Instructor routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['instructor', 'admin']}>
              <InstructorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/create"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['instructor', 'admin']}>
              <CreateCourse />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/generate"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['instructor', 'admin']}>
              <GenerateCourse />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/quiz/:moduleId"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['instructor', 'admin']}>
              <GenerateQuiz />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
