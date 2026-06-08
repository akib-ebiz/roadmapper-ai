const User = require('../users/user.model');

const getEnrollment = async (userId, courseId) => {
  const user = await User.findById(userId).select('enrolledCourses').lean();
  if (!user) return null;
  return user.enrolledCourses.find((e) => e.courseId.toString() === courseId.toString()) || null;
};

const getEnrollments = async (userId) => {
  const user = await User.findById(userId).select('enrolledCourses').lean();
  return user?.enrolledCourses || [];
};

const updateEnrollmentProgress = async (userId, courseId, { progress, completedModules }) => {
  return User.findOneAndUpdate(
    { _id: userId, 'enrolledCourses.courseId': courseId },
    {
      $set: {
        'enrolledCourses.$.progress': progress,
        'enrolledCourses.$.completedModules': completedModules,
      },
    },
    { new: true }
  ).lean();
};

const markModuleComplete = async (userId, courseId, moduleId, progress) => {
  const enrollment = await getEnrollment(userId, courseId);
  if (!enrollment) return null;

  const moduleIdStr = moduleId.toString();
  const completed = enrollment.completedModules.map((id) => id.toString());
  if (!completed.includes(moduleIdStr)) {
    completed.push(moduleIdStr);
  }

  return updateEnrollmentProgress(userId, courseId, {
    progress,
    completedModules: completed,
  });
};

module.exports = {
  getEnrollment,
  getEnrollments,
  updateEnrollmentProgress,
  markModuleComplete,
};
