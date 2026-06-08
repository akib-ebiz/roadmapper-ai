const analyticsRepository = require('./analytics.repository');
const progressRepository = require('../progress/progress.repository');
const quizAttemptRepository = require('../quizzes/quizAttempt.repository');
const { AppError } = require('../../common/errors');
const { ROLES } = require('../../common/constants');
const logger = require('../../common/logger');

const generateStudentDashboard = async (requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Student dashboard is for students only', 403);
  }

  const userId = requestingUser.userId;
  const enrollments = await progressRepository.getEnrollments(userId);
  const attempts = await quizAttemptRepository.findByStudent(userId);

  let completedModules = 0;
  let completedCourses = 0;
  let totalProgress = 0;

  for (const enrollment of enrollments) {
    completedModules += enrollment.completedModules?.length || 0;
    if (enrollment.progress >= 100) completedCourses += 1;
    totalProgress += enrollment.progress || 0;
  }

  const enrolledCourses = enrollments.length;
  const averageScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;
  const overallProgress =
    enrolledCourses > 0 ? Math.round(totalProgress / enrolledCourses) : 0;

  const [scoreChart, progressChart] = await Promise.all([
    analyticsRepository.getStudentScoreTrend(userId),
    analyticsRepository.getStudentProgressByCourse(userId),
  ]);

  logger.info(`Student dashboard loaded: user=${userId}`);

  return {
    enrolledCourses,
    completedCourses,
    completedModules,
    averageScore,
    progress: overallProgress,
    overallProgress,
    scoreChart,
    progressChart,
    recentAttempts: attempts.slice(0, 5).map((a) => ({
      attemptId: a._id,
      quizId: a.quizId,
      courseId: a.courseId,
      score: a.score,
      passed: a.passed,
      completedAt: a.completedAt,
    })),
  };
};

const generateInstructorDashboard = async (requestingUser) => {
  if (requestingUser.role !== ROLES.INSTRUCTOR && requestingUser.role !== ROLES.ADMIN) {
    throw new AppError('Instructor dashboard is for instructors only', 403);
  }

  const instructorId = requestingUser.userId;
  const [courseCounts, totalEnrollments, averageCompletionRate, quizStats, coursePerformance] =
    await Promise.all([
      analyticsRepository.getCourseCounts(instructorId),
      analyticsRepository.getTotalEnrollments(instructorId),
      analyticsRepository.getAverageCompletionRate(instructorId),
      analyticsRepository.getQuizStats(instructorId),
      analyticsRepository.getCoursePerformance(instructorId),
    ]);

  const topCourses = [...coursePerformance]
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  logger.info(`Instructor dashboard loaded: user=${instructorId}`);

  return {
    totalCourses: courseCounts.total,
    publishedCourses: courseCounts.published,
    totalStudents: totalEnrollments,
    totalEnrollments,
    averageCompletionRate,
    aiGeneratedCourses: courseCounts.aiGenerated,
    quizStats,
    topCourses,
    enrollmentChart: coursePerformance.map((c) => ({
      name: c.title.length > 20 ? `${c.title.slice(0, 20)}…` : c.title,
      enrollments: c.enrollments,
      completionRate: c.completionRate,
    })),
  };
};

const getInstructorCourseAnalytics = async (requestingUser) => {
  if (requestingUser.role !== ROLES.INSTRUCTOR && requestingUser.role !== ROLES.ADMIN) {
    throw new AppError('Forbidden', 403);
  }
  return analyticsRepository.getCoursePerformance(requestingUser.userId);
};

const getInstructorQuizAnalytics = async (requestingUser) => {
  if (requestingUser.role !== ROLES.INSTRUCTOR && requestingUser.role !== ROLES.ADMIN) {
    throw new AppError('Forbidden', 403);
  }
  return analyticsRepository.getQuizStats(requestingUser.userId);
};

const generateAdminDashboard = async (requestingUser) => {
  if (requestingUser.role !== ROLES.ADMIN) {
    throw new AppError('Admin dashboard is for admins only', 403);
  }

  const [userCounts, courseCounts, totalEnrollments, quizStats, growth, aiUsage] =
    await Promise.all([
      analyticsRepository.getUserCountsByRole(),
      analyticsRepository.getCourseCounts(),
      analyticsRepository.getTotalEnrollments(),
      analyticsRepository.getQuizStats(),
      analyticsRepository.getGrowthMetrics(30),
      analyticsRepository.getAiContentMetrics(),
    ]);

  logger.info(`Admin dashboard loaded: user=${requestingUser.userId}`);

  return {
    ...userCounts,
    totalCourses: courseCounts.total,
    publishedCourses: courseCounts.published,
    totalEnrollments,
    quizStats,
    growth,
    aiUsage,
    growthChart: growth.users.map((d) => ({
      date: d._id,
      users: d.count,
      courses: growth.courses.find((c) => c._id === d._id)?.count || 0,
      attempts: growth.quizAttempts.find((a) => a._id === d._id)?.count || 0,
    })),
  };
};

module.exports = {
  generateStudentDashboard,
  generateInstructorDashboard,
  getInstructorCourseAnalytics,
  getInstructorQuizAnalytics,
  generateAdminDashboard,
};
