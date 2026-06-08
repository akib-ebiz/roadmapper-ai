const { z } = require('zod');
const { QUIZ_DIFFICULTY } = require('../../common/constants');

const generateQuizSchema = z.object({
  difficulty: z
    .enum(Object.values(QUIZ_DIFFICULTY), {
      errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
    })
    .default(QUIZ_DIFFICULTY.MEDIUM),
});

const validateGenerateQuiz = (req, res, next) => {
  const result = generateQuizSchema.safeParse(req.body);
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

module.exports = { generateQuizSchema, validateGenerateQuiz };
