const { Router } = require('express');
const {
  createCourse,
  getCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
} = require('./course.controller');
const {
  validateBody,
  validateQuery,
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
} = require('./course.validator');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');

const router = Router();

// ─── Public routes ────────────────────────────────────────────────

/**
 * GET /api/v1/courses
 * Browse published courses (public)
 */
router.get('/', validateQuery(courseQuerySchema), getCourses);

// ─── Authenticated routes ─────────────────────────────────────────

/**
 * GET /api/v1/courses/my-courses
 * Must be BEFORE /:id to avoid "my-courses" being treated as an ID
 */
router.get('/my-courses', authMiddleware, getMyCourses);

/**
 * GET /api/v1/courses/:id
 * Public for published; owner/admin sees drafts
 */
router.get('/:id', getCourseById);

/**
 * POST /api/v1/courses
 * Create course — instructor only
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  validateBody(createCourseSchema),
  createCourse
);

/**
 * PUT /api/v1/courses/:id
 * Update course — owner or admin
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  validateBody(updateCourseSchema),
  updateCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Delete course — owner or admin
 */
router.delete('/:id', authMiddleware, roleMiddleware('instructor', 'admin'), deleteCourse);

/**
 * PATCH /api/v1/courses/:id/publish
 * Publish course — owner or admin
 */
router.patch('/:id/publish', authMiddleware, roleMiddleware('instructor', 'admin'), publishCourse);

/**
 * POST /api/v1/courses/:id/enroll
 * Enroll — student only
 */
router.post('/:id/enroll', authMiddleware, roleMiddleware('student'), enrollCourse);

module.exports = router;
