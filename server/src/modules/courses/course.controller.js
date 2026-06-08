const courseService = require('./course.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/response');

/**
 * POST /api/v1/courses
 * Instructor only
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.userId);
  return sendCreated(res, course, 'Course created successfully');
});

/**
 * GET /api/v1/courses
 * Public — returns published courses with filtering & pagination
 */
const getCourses = asyncHandler(async (req, res) => {
  const result = await courseService.getCourses(req.query);
  return sendSuccess(res, result, 'Courses retrieved');
});

/**
 * GET /api/v1/courses/my-courses
 * Authenticated — returns courses owned (instructor) or enrolled (student)
 */
const getMyCourses = asyncHandler(async (req, res) => {
  const result = await courseService.getMyCourses(req.user, req.query);
  return sendSuccess(res, result, 'My courses retrieved');
});

/**
 * GET /api/v1/courses/:id
 * Public (published only); owner/admin can see drafts
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user || null);
  return sendSuccess(res, course, 'Course retrieved');
});

/**
 * PUT /api/v1/courses/:id
 * Owner or admin only
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body, req.user);
  return sendSuccess(res, course, 'Course updated successfully');
});

/**
 * DELETE /api/v1/courses/:id
 * Owner or admin only
 */
const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);
  return sendSuccess(res, {}, 'Course deleted successfully');
});

/**
 * PATCH /api/v1/courses/:id/publish
 * Owner or admin only
 */
const publishCourse = asyncHandler(async (req, res) => {
  const course = await courseService.publishCourse(req.params.id, req.user);
  return sendSuccess(res, course, 'Course published successfully');
});

/**
 * POST /api/v1/courses/:id/enroll
 * Student only
 */
const enrollCourse = asyncHandler(async (req, res) => {
  const result = await courseService.enrollCourse(req.params.id, req.user);
  return sendSuccess(res, {}, result.message);
});

module.exports = {
  createCourse,
  getCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
};
