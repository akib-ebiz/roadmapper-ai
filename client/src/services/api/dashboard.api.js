import api from './axiosInstance'

const getStudentDashboard = async () => {
  const res = await api.get('/dashboard/student')
  return res.data.data
}

const getInstructorDashboard = async () => {
  const res = await api.get('/dashboard/instructor')
  return res.data.data
}

const getInstructorCourses = async () => {
  const res = await api.get('/dashboard/instructor/courses')
  return res.data.data.courses
}

const getInstructorQuizzes = async () => {
  const res = await api.get('/dashboard/instructor/quizzes')
  return res.data.data
}

const getAdminDashboard = async () => {
  const res = await api.get('/dashboard/admin')
  return res.data.data
}

const exportReport = async (format = 'json', type = 'courses') => {
  const res = await api.get(`/reports/export?format=${format}&type=${type}`, {
    responseType: 'blob',
  })
  return res.data
}

export default {
  getStudentDashboard,
  getInstructorDashboard,
  getInstructorCourses,
  getInstructorQuizzes,
  getAdminDashboard,
  exportReport,
}
