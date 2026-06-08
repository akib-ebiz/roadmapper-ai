import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store'

/**
 * ProtectedRoute — redirects unauthenticated users to /login
 * Preserves the intended destination in location state for post-login redirect
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
