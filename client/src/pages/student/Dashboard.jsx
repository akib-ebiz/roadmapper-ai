import { Link } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'
import { useStudentDashboard } from '../../hooks/useDashboard'
import ProgressBar from '../../components/progress/ProgressBar'
import ScoreChart from '../../components/charts/ScoreChart'
import ProgressChart from '../../components/charts/ProgressChart'

function StudentDashboard() {
  const { user, logout } = useAuthStore()
  const { data: stats, isLoading } = useStudentDashboard()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/student/courses"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            My Courses
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Enrolled', value: stats?.enrolledCourses ?? 0 },
                { label: 'Completed', value: stats?.completedCourses ?? 0 },
                { label: 'Modules Done', value: stats?.completedModules ?? 0 },
                { label: 'Avg Score', value: `${stats?.averageScore ?? 0}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Quiz Scores</h2>
                <ScoreChart data={stats?.scoreChart} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Course Progress</h2>
                <ProgressChart data={stats?.progressChart} dataKey="progress" labelKey="title" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="font-semibold text-gray-800 mb-4">Overall Progress</h2>
              <ProgressBar value={stats?.overallProgress ?? stats?.progress ?? 0} />
            </div>

            {stats?.recentAttempts?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Recent Quiz Activity</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.recentAttempts.map((attempt) => (
                    <div key={attempt.attemptId} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Score: {attempt.score}%</p>
                        <p className="text-xs text-gray-400">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
