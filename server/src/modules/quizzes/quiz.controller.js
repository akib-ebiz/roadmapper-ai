const quizService = require('./quiz.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/response');

const generateQuiz = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const result = await quizService.generateQuiz(moduleId, req.body, req.user);
  return sendSuccess(res, result, 'Quiz generated successfully');
});

const saveQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.saveQuiz(req.body, req.user);
  return sendCreated(res, { quiz }, 'Quiz saved successfully');
});

const getQuizForTaking = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizForTaking(req.params.quizId, req.user);
  return sendSuccess(res, { quiz });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.submitQuiz(req.params.quizId, req.body, req.user);
  return sendSuccess(res, result, 'Quiz submitted successfully');
});

const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await quizService.getAttemptById(req.params.attemptId, req.user);
  return sendSuccess(res, attempt);
});

const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(req.params.quizId, req.user);
  return sendSuccess(res, { quiz });
});

const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.quizId, req.body, req.user);
  return sendSuccess(res, { quiz }, 'Quiz updated successfully');
});

const deleteQuiz = asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(req.params.quizId, req.user);
  return sendSuccess(res, {}, 'Quiz deleted successfully');
});

module.exports = {
  generateQuiz,
  saveQuiz,
  getQuizForTaking,
  submitQuiz,
  getAttemptById,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};
