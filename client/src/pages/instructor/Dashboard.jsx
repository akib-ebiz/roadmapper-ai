import { Link } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'
import { useMyCourses, useDeleteCourse, usePublishCourse } from '../../hooks/useCourses'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700',
}

function InstructorDashboard() {
  const { user, logout } = useAuthStore()
  const { data, isLoading } = useMyCourses()
  const deleteMutation = useDeleteCourse()

  const courses = data?.courses || []

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Course
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courses.length },
            { label: 'Published', value: courses.filter((c) => c.status === 'published').length },
            { label: 'Total Students', value: courses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Courses table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">My Courses</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No courses yet.</p>
              <Link to="/instructor/courses/create" className="text-blue-600 hover:underline text-sm">
                Create your first course →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {courses.map((course) => (
                <div key={course._id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {course.difficulty} · {course.durationWeeks}w · {course.enrolledStudents} students
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[course.status]}`}>
                    {course.status}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteMutation.isPending}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
