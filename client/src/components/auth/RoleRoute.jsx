import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'

/**
 * RoleRoute — restricts access to specific roles
 * Must be nested inside ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute>
 *     <RoleRoute roles={['admin']}>
 *       <AdminDashboard />
 *     </RoleRoute>
 *   </ProtectedRoute>
 */
function RoleRoute({ children, roles }) {
  const { user } = useAuthStore()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleRoute
