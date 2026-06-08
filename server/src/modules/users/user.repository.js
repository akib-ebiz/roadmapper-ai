const User = require('./user.model');

/**
 * Find a user by ID
 */
const findById = async (id) => {
  return User.findById(id).lean();
};

/**
 * Check whether a student is already enrolled in a course
 */
const isEnrolled = async (userId, courseId) => {
  const count = await User.countDocuments({
    _id: userId,
    'enrolledCourses.courseId': courseId,
  });
  return count > 0;
};

/**
 * Add a course to a student's enrolledCourses array
 */
const enrollCourse = async (userId, courseId) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $push: {
        enrolledCourses: { courseId, progress: 0, completedModules: [] },
      },
    },
    { new: true }
  ).lean();
};

/**
 * Get enrolled course IDs for a student
 */
const getEnrolledCourseIds = async (userId) => {
  const user = await User.findById(userId).select('enrolledCourses').lean();
  if (!user) return [];
  return user.enrolledCourses.map((e) => e.courseId);
};

module.exports = { findById, isEnrolled, enrollCourse, getEnrolledCourseIds };
