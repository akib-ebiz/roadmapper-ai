const analyticsService = require('../analytics/analytics.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/response');

const getStudentDashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.generateStudentDashboard(req.user);
  return sendSuccess(res, stats);
});

const getInstructorDashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.generateInstructorDashboard(req.user);
  return sendSuccess(res, stats);
});

const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await analyticsService.getInstructorCourseAnalytics(req.user);
  return sendSuccess(res, { courses });
});

const getInstructorQuizzes = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getInstructorQuizAnalytics(req.user);
  return sendSuccess(res, stats);
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.generateAdminDashboard(req.user);
  return sendSuccess(res, stats);
});

module.exports = {
  getStudentDashboard,
  getInstructorDashboard,
  getInstructorCourses,
  getInstructorQuizzes,
  getAdminDashboard,
};
