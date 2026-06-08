const { z } = require('zod');
const { DIFFICULTY } = require('../../common/constants');

/**
 * Zod schema for the generate course API request body
 */
const generateCourseSchema = z.object({
  topic: z
    .string({ required_error: 'Topic is required' })
    .trim()
    .min(2, 'Topic must be at least 2 characters')
    .max(100, 'Topic must not exceed 100 characters'),

  targetAudience: z
    .string({ required_error: 'Target audience is required' })
    .trim()
    .min(2, 'Target audience must be at least 2 characters')
    .max(100)
    .optional()
    .default('General learners'),

  difficulty: z.enum(Object.values(DIFFICULTY), {
    errorMap: () => ({ message: 'Difficulty must be beginner, intermediate, or advanced' }),
  }),

  durationWeeks: z
    .number({ required_error: 'Duration is required', invalid_type_error: 'Duration must be a number' })
    .int()
    .min(1, 'Duration must be at least 1 week')
    .max(52, 'Duration must not exceed 52 weeks'),
});

/**
 * Express middleware: validate request body
 */
const validateGenerateCourse = (req, res, next) => {
  const result = generateCourseSchema.safeParse(req.body);
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

module.exports = { generateCourseSchema, validateGenerateCourse };
