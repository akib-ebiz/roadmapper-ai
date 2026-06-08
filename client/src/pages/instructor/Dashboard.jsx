import { Link } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'
import { useMyCourses, useDeleteCourse } from '../../hooks/useCourses'
import { useInstructorDashboard } from '../../hooks/useDashboard'
import dashboardApi from '../../services/api/dashboard.api'
import EnrollmentChart from '../../components/charts/EnrollmentChart'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700',
}

function InstructorDashboard() {
  const { user, logout } = useAuthStore()
  const { data: coursesData, isLoading: coursesLoading } = useMyCourses()
  const { data: analytics, isLoading: analyticsLoading } = useInstructorDashboard()
  const deleteMutation = useDeleteCourse()

  const courses = coursesData?.courses || []
  const isLoading = coursesLoading || analyticsLoading

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleExport = async () => {
    try {
      const blob = await dashboardApi.exportReport('csv', 'courses')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'courses-report.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (_err) {
      alert('Export failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Export CSV
          </button>
          <Link
            to="/instructor/courses/generate"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium rounded-lg"
          >
            ✨ Generate with AI
          </Link>
          <Link
            to="/instructor/courses/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
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
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Courses', value: analytics?.totalCourses ?? courses.length },
                { label: 'Published', value: analytics?.publishedCourses ?? 0 },
                { label: 'Students', value: analytics?.totalStudents ?? 0 },
                { label: 'Completion Rate', value: `${analytics?.averageCompletionRate ?? 0}%` },
                { label: 'Quiz Pass Rate', value: `${analytics?.quizStats?.passRate ?? 0}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {analytics?.enrollmentChart?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="font-semibold text-gray-800 mb-4">Course Performance</h2>
                <EnrollmentChart data={analytics.enrollmentChart} />
              </div>
            )}

            {analytics?.topCourses?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="font-semibold text-gray-800 mb-4">Top Courses</h2>
                <div className="space-y-2">
                  {analytics.topCourses.map((c, i) => (
                    <div key={c.courseId} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700">{i + 1}. {c.title}</span>
                      <span className="text-gray-400">{c.enrollments} enrolled · {c.completionRate}% complete</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">My Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No courses yet.</p>
              <Link to="/instructor/courses/generate" className="text-indigo-600 hover:underline text-sm">
                Generate with AI →
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[course.status]}`}>
                    {course.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link to={`/courses/${course._id}`} className="text-xs text-blue-600 hover:underline">View</Link>
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
