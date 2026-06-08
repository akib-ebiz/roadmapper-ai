const { z } = require('zod');
const { DIFFICULTY } = require('../../common/constants');

// ─── Module schema (embedded) ─────────────────────────────────────
const moduleSchema = z.object({
  title: z.string().trim().min(1, 'Module title is required').max(200),
  objectives: z.array(z.string().trim()).optional().default([]),
  videoUrl: z.string().trim().optional().default(''),
});

// ─── Create course ────────────────────────────────────────────────
const createCourseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),

  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),

  topic: z
    .string({ required_error: 'Topic is required' })
    .trim()
    .min(1, 'Topic is required')
    .max(100),

  difficulty: z.enum(Object.values(DIFFICULTY), {
    errorMap: () => ({ message: 'Difficulty must be beginner, intermediate, or advanced' }),
  }),

  durationWeeks: z
    .number({ required_error: 'Duration is required', invalid_type_error: 'Duration must be a number' })
    .int()
    .min(1, 'Duration must be at least 1 week')
    .max(52, 'Duration must not exceed 52 weeks'),

  thumbnail: z.string().trim().optional().default(''),

  modules: z.array(moduleSchema).optional().default([]),
});

// ─── Update course (all fields optional) ─────────────────────────
const updateCourseSchema = createCourseSchema.partial();

// ─── Query params for GET /courses ───────────────────────────────
const courseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  difficulty: z.enum(Object.values(DIFFICULTY)).optional(),
  topic: z.string().trim().optional(),
  search: z.string().trim().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

/**
 * Middleware factory: validates req.body with a Zod schema
 */
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

/**
 * Middleware factory: validates req.query with a Zod schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Invalid query parameters', errors });
  }
  req.query = result.data;
  return next();
};

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  validateBody,
  validateQuery,
};
