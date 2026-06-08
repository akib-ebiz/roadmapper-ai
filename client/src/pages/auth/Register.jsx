import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authApi from '../../services/api/auth.api'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Browse courses, track progress' },
  { value: 'instructor', label: 'Instructor', desc: 'Create courses, generate AI content' },
]

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password needs uppercase, lowercase, and a number'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setApiError('')

    try {
      await authApi.register(form)
      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      const serverErrors = err.response?.data?.errors
      if (serverErrors) {
        const fieldErrors = {}
        serverErrors.forEach(({ field, message }) => {
          fieldErrors[field] = message
        })
        setErrors(fieldErrors)
      } else {
        setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Roadmapper AI</h1>
          <p className="mt-2 text-gray-500">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Get started</h2>

          {/* API error */}
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50
                            ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50
                            ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 chars, upper + lower + number"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50
                            ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors
                                ${form.role === value
                                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={form.role === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium
                         rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
