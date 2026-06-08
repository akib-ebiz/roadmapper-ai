const progressRepository = require('../progress/progress.repository');
const quizAttemptRepository = require('../quizzes/quizAttempt.repository');

/** @deprecated Use analytics.service.generateStudentDashboard */
const getStudentDashboard = async (requestingUser) => {
  const analyticsService = require('../analytics/analytics.service');
  return analyticsService.generateStudentDashboard(requestingUser);
};

module.exports = { getStudentDashboard };
