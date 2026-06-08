import useAuthStore from '../../stores/auth.store'

function AdminDashboard() {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">
            Phase 08 — Admin user management coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
