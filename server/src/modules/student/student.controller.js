const studentService = require('./student.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/response');

const getStudentCourses = asyncHandler(async (req, res) => {
  const data = await studentService.getStudentCourses(req.user);
  return sendSuccess(res, data);
});

const getLearningPath = asyncHandler(async (req, res) => {
  const data = await studentService.getLearningPath(req.params.courseId, req.user);
  return sendSuccess(res, data);
});

module.exports = { getStudentCourses, getLearningPath };
