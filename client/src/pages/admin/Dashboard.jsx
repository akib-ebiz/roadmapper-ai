import useAuthStore from '../../stores/auth.store'
import { useAdminDashboard } from '../../hooks/useDashboard'
import dashboardApi from '../../services/api/dashboard.api'
import GrowthChart from '../../components/charts/GrowthChart'
import AIUsageChart from '../../components/charts/AIUsageChart'

function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const { data: stats, isLoading } = useAdminDashboard()

  const handleExport = async (type) => {
    try {
      const blob = await dashboardApi.exportReport('json', type)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report.json`
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
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform analytics · {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('courses')}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Export Courses
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats?.totalUsers ?? 0 },
                { label: 'Students', value: stats?.students ?? 0 },
                { label: 'Instructors', value: stats?.instructors ?? 0 },
                { label: 'Admins', value: stats?.admins ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Courses', value: stats?.totalCourses ?? 0 },
                { label: 'Published', value: stats?.publishedCourses ?? 0 },
                { label: 'Enrollments', value: stats?.totalEnrollments ?? 0 },
                { label: 'Quiz Attempts', value: stats?.quizStats?.totalAttempts ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Platform Growth (30 days)</h2>
                <GrowthChart data={stats?.growthChart} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">AI Content Generated</h2>
                <AIUsageChart data={stats?.aiUsage} />
                {stats?.aiUsage?.note && (
                  <p className="text-xs text-gray-400 mt-3">{stats.aiUsage.note}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Quiz Platform Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats?.quizStats?.totalAttempts ?? 0}</p>
                  <p className="text-xs text-gray-500">Total Attempts</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats?.quizStats?.averageScore ?? 0}%</p>
                  <p className="text-xs text-gray-500">Avg Score</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats?.quizStats?.passRate ?? 0}%</p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
