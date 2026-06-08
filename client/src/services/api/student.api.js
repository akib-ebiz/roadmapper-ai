import api from './axiosInstance'

const getStudentCourses = async () => {
  const res = await api.get('/student/courses')
  return res.data.data
}

const getLearningPath = async (courseId) => {
  const res = await api.get(`/student/courses/${courseId}/learn`)
  return res.data.data
}

export default { getStudentCourses, getLearningPath }
