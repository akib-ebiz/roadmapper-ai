import { Link } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'
import { useStudentCourses } from '../../hooks/useStudent'
import ProgressBar from '../../components/progress/ProgressBar'
import CompletionBadge from '../../components/progress/CompletionBadge'

function MyCourses() {
  const { logout } = useAuthStore()
  const { data, isLoading } = useStudentCourses()
  const courses = data?.courses || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500">{courses.length} enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student/dashboard" className="text-sm text-blue-600 hover:underline">
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No enrolled courses yet.</p>
            <Link to="/courses" className="text-blue-600 hover:underline text-sm">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{course.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{course.topic} · {course.difficulty}</p>
                  </div>
                  <CompletionBadge completed={course.isCompleted} />
                </div>
                <ProgressBar
                  value={course.progress}
                  label={`${course.completedModules}/${course.totalModules} modules`}
                  className="mb-4"
                />
                <Link
                  to={`/student/courses/${course._id}/learn`}
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                >
                  Continue Learning →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCourses
