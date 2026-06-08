const { z } = require('zod');
const { ROLES } = require('../../common/constants');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  role: z
    .enum(Object.values(ROLES), {
      errorMap: () => ({ message: 'Role must be student, instructor, or admin' }),
    })
    .optional()
    .default(ROLES.STUDENT),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email'),

  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

/**
 * Validate request body with a Zod schema.
 * Returns { data } on success or { errors } on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = result.data; // use sanitised/coerced data
  return next();
};

module.exports = { registerSchema, loginSchema, validate };
