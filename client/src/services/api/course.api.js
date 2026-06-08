import api from './axiosInstance'

/**
 * Get paginated list of published courses
 * @param {{ page, limit, difficulty, topic, search }} params
 */
const getCourses = async (params = {}) => {
  const res = await api.get('/courses', { params })
  return res.data.data // { courses, total, page, limit, totalPages }
}

/**
 * Get a single course by ID
 * @param {string} id
 */
const getCourse = async (id) => {
  const res = await api.get(`/courses/${id}`)
  return res.data.data
}

/**
 * Get courses owned (instructor) or enrolled (student) by the current user
 */
const getMyCourses = async (params = {}) => {
  const res = await api.get('/courses/my-courses', { params })
  return res.data.data
}

/**
 * Create a new course (instructor only)
 * @param {{ title, description, topic, difficulty, durationWeeks, modules? }} data
 */
const createCourse = async (data) => {
  const res = await api.post('/courses', data)
  return res.data.data
}

/**
 * Update a course (owner or admin)
 * @param {string} id
 * @param {object} data
 */
const updateCourse = async (id, data) => {
  const res = await api.put(`/courses/${id}`, data)
  return res.data.data
}

/**
 * Delete a course (owner or admin)
 * @param {string} id
 */
const deleteCourse = async (id) => {
  const res = await api.delete(`/courses/${id}`)
  return res.data
}

/**
 * Publish a course (owner or admin)
 * @param {string} id
 */
const publishCourse = async (id) => {
  const res = await api.patch(`/courses/${id}/publish`)
  return res.data.data
}

/**
 * Enroll the current student in a course
 * @param {string} id
 */
const enrollCourse = async (id) => {
  const res = await api.post(`/courses/${id}/enroll`)
  return res.data
}

export default { getCourses, getCourse, getMyCourses, createCourse, updateCourse, deleteCourse, publishCourse, enrollCourse }
