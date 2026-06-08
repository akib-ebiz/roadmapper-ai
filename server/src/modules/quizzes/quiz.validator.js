const { z } = require('zod');
const { QUIZ_DIFFICULTY, QUIZ } = require('../../common/constants');

const questionSchema = z.object({
  text: z.string().trim().min(5, 'Question text is required'),
  options: z
    .array(z.string().trim().min(1))
    .length(QUIZ.OPTIONS_PER_QUESTION, `Each question must have exactly ${QUIZ.OPTIONS_PER_QUESTION} options`),
  correctOption: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(5, 'Explanation is required'),
});

const saveQuizSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
  difficulty: z.enum(Object.values(QUIZ_DIFFICULTY), {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
  }),
  questions: z
    .array(questionSchema)
    .min(QUIZ.MIN_QUESTIONS, `Quiz must have at least ${QUIZ.MIN_QUESTIONS} questions`)
    .max(QUIZ.MAX_QUESTIONS, `Quiz must have at most ${QUIZ.MAX_QUESTIONS} questions`),
});

const updateQuizSchema = z.object({
  difficulty: z.enum(Object.values(QUIZ_DIFFICULTY)).optional(),
  questions: z
    .array(questionSchema)
    .min(QUIZ.MIN_QUESTIONS)
    .max(QUIZ.MAX_QUESTIONS)
    .optional(),
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = result.data;
  return next();
};

const submitAnswerSchema = z.object({
  questionId: z.number().int().min(0),
  selectedOption: z.number().int().min(0).max(3),
});

const submitQuizSchema = z.object({
  answers: z
    .array(submitAnswerSchema)
    .min(1, 'At least one answer is required'),
});

module.exports = {
  saveQuizSchema,
  updateQuizSchema,
  submitQuizSchema,
  validateBody,
};
