const geminiProvider = require('../providers/gemini.provider');
const { buildCourseGenerationPrompt } = require('../prompts/course-generation.prompt');
const { parseAiResponse } = require('../parsers/course.parser');
const { validateAiCourse } = require('../schemas/course.schema');
const { AppError } = require('../../common/errors');
const logger = require('../../common/logger');

/**
 * Generate a course structure using Gemini AI.
 *
 * Flow (per architecture spec):
 *   Prompt → Provider → Parser → Validator → Return safe data
 *
 * Raw AI output is NEVER returned or saved without validation.
 *
 * @param {{ topic: string, targetAudience: string, difficulty: string, durationWeeks: number }} params
 * @returns {Promise<{ title: string, description: string, modules: Array }>}
 */
const generateCourse = async ({ topic, targetAudience, difficulty, durationWeeks }) => {
  logger.info(`Course generation requested: topic="${topic}", difficulty=${difficulty}, weeks=${durationWeeks}`);

  // 1. Build prompt
  const prompt = buildCourseGenerationPrompt({ topic, targetAudience, difficulty, durationWeeks });

  // 2. Call Gemini provider (handles retry + timeout internally)
  let rawText;
  try {
    rawText = await geminiProvider.generateCourse(prompt);
  } catch (err) {
    logger.error(`Course generation provider failure: ${err.message}`);
    throw new AppError('Course generation failed. Please try again.', 503);
  }

  // 3. Parse raw AI response (strip markdown, extract JSON)
  let parsed;
  try {
    parsed = parseAiResponse(rawText);
  } catch (err) {
    logger.error(`Course generation parse failure: ${err.message}`);
    throw new AppError('AI returned an invalid response format. Please try again.', 502);
  }

  // 4. Validate parsed JSON against schema (never save raw AI output)
  const validation = validateAiCourse(parsed);
  if (!validation.success) {
    logger.error(`Course generation validation failure: ${validation.error}`);
    throw new AppError('AI generated incomplete course content. Please try again.', 502);
  }

  logger.info(`Course generation success: "${validation.data.title}" (${validation.data.modules.length} modules)`);

  // 5. Return validated, safe data — not raw AI output
  return validation.data;
};

module.exports = { generateCourse };
