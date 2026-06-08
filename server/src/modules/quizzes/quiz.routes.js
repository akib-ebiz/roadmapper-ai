const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');
const {
  generateQuiz,
  saveQuiz,
  getQuizForTaking,
  submitQuiz,
  getAttemptById,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require('./quiz.controller');
const { validateGenerateQuiz } = require('../../ai/validators/generate-quiz.validator');
const { validateBody, saveQuizSchema, updateQuizSchema, submitQuizSchema } = require('./quiz.validator');

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many generation requests, please wait a moment' },
});

router.post(
  '/generate/:moduleId',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  aiLimiter,
  validateGenerateQuiz,
  generateQuiz
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  validateBody(saveQuizSchema),
  saveQuiz
);

// Must be before /:quizId routes
router.get('/attempts/:attemptId', authMiddleware, getAttemptById);

router.get('/:quizId/take', authMiddleware, roleMiddleware('student', 'admin'), getQuizForTaking);

router.post(
  '/:quizId/submit',
  authMiddleware,
  roleMiddleware('student', 'admin'),
  validateBody(submitQuizSchema),
  submitQuiz
);

router.get('/:quizId', authMiddleware, getQuizById);

router.put(
  '/:quizId',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  validateBody(updateQuizSchema),
  updateQuiz
);

router.delete(
  '/:quizId',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  deleteQuiz
);

module.exports = router;
