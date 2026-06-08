const { z } = require('zod');
const { ROLES } = require('../../common/constants');

/**
 * Schema for suspending a user
 */
const suspendUserSchema = z.object({
  reason: z
    .string({ required_error: 'Reason is required' })
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

/**
 * Schema for activating a user
 */
const activateUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
});

/**
 * Schema for deleting a user
 */
const deleteUserSchema = z.object({
  reason: z
    .string({ required_error: 'Reason is required' })
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

/**
 * Schema for updating user role
 */
const updateRoleSchema = z.object({
  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: 'Role must be student, instructor, or admin' }),
  }),
  reason: z
    .string({ required_error: 'Reason is required' })
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

/**
 * Schema for user filters
 */
const userFiltersSchema = z.object({
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema for audit log filters
 */
const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  userId: z.string().optional(),
  adminId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  req.body = result.data;
  return next();
};

/**
 * Validate query parameters with a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.query = result.data;
  return next();
};

module.exports = {
  suspendUserSchema,
  activateUserSchema,
  deleteUserSchema,
  updateRoleSchema,
  userFiltersSchema,
  auditLogFiltersSchema,
  validate,
  validateQuery,
};
