import api from './axiosInstance'

/**
 * Generate a course structure using Gemini AI.
 * Returns a preview — does NOT save to DB.
 */
const generateCourse = async (params) => {
  const res = await api.post('/courses/generate', params)
  return res.data.data
}

/**
 * Generate quiz questions for a module using Groq (Gemini fallback).
 * Returns a preview — does NOT save to DB.
 */
const generateQuiz = async (moduleId, params) => {
  const res = await api.post(`/quizzes/generate/${moduleId}`, params)
  return res.data.data
}

/**
 * Save a reviewed quiz and attach it to the module.
 */
const saveQuiz = async (payload) => {
  const res = await api.post('/quizzes', payload)
  return res.data.data.quiz
}

export default { generateCourse, generateQuiz, saveQuiz }
