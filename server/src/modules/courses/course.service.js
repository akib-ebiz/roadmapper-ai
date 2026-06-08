const courseRepository = require('./course.repository');
const userRepository = require('../users/user.repository');
const { AppError } = require('../../common/errors');
const { ROLES, COURSE_STATUS } = require('../../common/constants');
const logger = require('../../common/logger');

/**
 * Create a new course. Only instructors may call this.
 */
const createCourse = async (data, instructorId) => {
  const course = await courseRepository.createCourse({ ...data, instructorId });
  logger.info(`Course created: "${course.title}" by instructor ${instructorId}`);
  return course;
};

/**
 * Get paginated/filtered course list.
 * Public endpoint — only shows published courses by default.
 */
const getCourses = async (query) => {
  return courseRepository.findAll(query);
};

/**
 * Get a single course by ID with instructor details populated.
 * Published courses are public; draft/archived require ownership or admin.
 */
const getCourseById = async (courseId, requestingUser = null) => {
  const course = await courseRepository.findById(courseId, true);
  if (!course) throw new AppError('Course not found', 404);

  // Non-published courses are only visible to their owner or admins
  if (course.status !== COURSE_STATUS.PUBLISHED) {
    if (!requestingUser) throw new AppError('Course not found', 404);

    const isOwner = course.instructorId._id.toString() === requestingUser.userId;
    const isAdmin = requestingUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) throw new AppError('Course not found', 404);
  }

  return course;
};

/**
 * Update a course. Enforces ownership: only the course owner or admin may update.
 */
const updateCourse = async (courseId, data, requestingUser) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  _assertOwnerOrAdmin(course, requestingUser);

  const updated = await courseRepository.updateById(courseId, data);
  logger.info(`Course updated: ${courseId} by ${requestingUser.userId}`);
  return updated;
};

/**
 * Delete a course. Only owner or admin.
 */
const deleteCourse = async (courseId, requestingUser) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  _assertOwnerOrAdmin(course, requestingUser);

  await courseRepository.deleteById(courseId);
  logger.info(`Course deleted: ${courseId} by ${requestingUser.userId}`);
};

/**
 * Publish a course. Only owner or admin.
 * Course must have title, description, and at least 1 module.
 */
const publishCourse = async (courseId, requestingUser) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  _assertOwnerOrAdmin(course, requestingUser);

  if (course.status === COURSE_STATUS.PUBLISHED) {
    throw new AppError('Course is already published', 400);
  }

  if (!course.modules || course.modules.length === 0) {
    throw new AppError('Course must have at least one module before publishing', 400);
  }

  const published = await courseRepository.publishById(courseId);
  logger.info(`Course published: ${courseId} by ${requestingUser.userId}`);
  return published;
};

/**
 * Enroll a student in a course.
 * - Only students can enroll
 * - Course must be published
 * - Prevents duplicate enrollment
 */
const enrollCourse = async (courseId, requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Only students can enroll in courses', 403);
  }

  const course = await courseRepository.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  if (course.status !== COURSE_STATUS.PUBLISHED) {
    throw new AppError('Cannot enroll in an unpublished course', 400);
  }

  // Prevent duplicate enrollment
  const alreadyEnrolled = await userRepository.isEnrolled(requestingUser.userId, courseId);
  if (alreadyEnrolled) throw new AppError('Already enrolled in this course', 400);

  // Atomically update both user and course
  await Promise.all([
    userRepository.enrollCourse(requestingUser.userId, courseId),
    courseRepository.incrementEnrollment(courseId),
  ]);

  logger.info(`Student ${requestingUser.userId} enrolled in course ${courseId}`);
  return { message: 'Enrolled successfully' };
};

/**
 * Get courses for the requesting user:
 * - Instructor: returns their created courses
 * - Student: returns their enrolled courses
 */
const getMyCourses = async (requestingUser, query) => {
  if (requestingUser.role === ROLES.INSTRUCTOR || requestingUser.role === ROLES.ADMIN) {
    return courseRepository.findByInstructor(requestingUser.userId, query);
  }

  // Student: look up enrolled course IDs then fetch those courses
  const enrolledIds = await userRepository.getEnrolledCourseIds(requestingUser.userId);
  if (enrolledIds.length === 0) {
    return { courses: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  return courseRepository.findAll({ ...query, status: undefined, _ids: enrolledIds });
};

// ─── Private helpers ──────────────────────────────────────────────

/**
 * Assert the requesting user is the course owner or an admin.
 * Throws 403 otherwise.
 */
const _assertOwnerOrAdmin = (course, requestingUser) => {
  const isOwner = course.instructorId.toString() === requestingUser.userId;
  const isAdmin = requestingUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to perform this action', 403);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
  getMyCourses,
};
