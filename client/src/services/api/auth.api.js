import api from './axiosInstance'

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string, role: string }} data
 */
const register = async (data) => {
  const res = await api.post('/auth/register', data)
  return res.data
}

/**
 * Login and get JWT + user info
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials)
  return res.data.data // { token, user }
}

/**
 * Get current authenticated user
 */
const getCurrentUser = async () => {
  const res = await api.get('/auth/me')
  return res.data.data
}

/**
 * Logout — just clears local storage (stateless JWT)
 */
const logout = () => {
  localStorage.removeItem('token')
}

export default { register, login, getCurrentUser, logout }
