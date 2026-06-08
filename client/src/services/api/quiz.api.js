import api from './axiosInstance'

const getQuizForTaking = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}/take`)
  return res.data.data.quiz
}

const submitQuiz = async (quizId, answers) => {
  const res = await api.post(`/quizzes/${quizId}/submit`, { answers })
  return res.data.data
}

const getAttempt = async (attemptId) => {
  const res = await api.get(`/quizzes/attempts/${attemptId}`)
  return res.data.data
}

export default { getQuizForTaking, submitQuiz, getAttempt }
