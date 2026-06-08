const courseGenerationService = require('../../ai/services/course-generation.service');
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/response');

/**
 * POST /api/v1/courses/generate
 * Instructor only.
 *
 * Calls AI service layer — controller NEVER calls provider directly.
 * Returns a preview of the generated course for the instructor to review/edit.
 * The course is NOT saved to the database here — saving happens via POST /courses.
 */
const generateCourse = asyncHandler(async (req, res) => {
  const { topic, targetAudience, difficulty, durationWeeks } = req.body;

  const generated = await courseGenerationService.generateCourse({
    topic,
    targetAudience,
    difficulty,
    durationWeeks,
  });

  return sendSuccess(res, generated, 'Course generated successfully');
});

module.exports = { generateCourse };
