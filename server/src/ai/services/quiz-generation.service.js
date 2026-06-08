const groqProvider = require('../providers/groq.provider');
const geminiProvider = require('../providers/gemini.provider');
const { buildQuizGenerationPrompt } = require('../prompts/quiz-generation.prompt');
const { parseQuizResponse } = require('../parsers/quiz.parser');
const { validateAiQuiz } = require('../schemas/quiz.schema');
const { AppError } = require('../../common/errors');
const logger = require('../../common/logger');

/**
 * @param {{ moduleTitle: string, difficulty: string }} params
 * @returns {Promise<{ questions: object[], provider: string }>}
 */
const generateQuiz = async ({ moduleTitle, difficulty }) => {
  logger.info(`Quiz generation requested: module="${moduleTitle}", difficulty=${difficulty}`);

  const prompt = buildQuizGenerationPrompt({ moduleTitle, difficulty });

  let rawText;
  let provider = 'groq';

  try {
    rawText = await groqProvider.generateQuiz(prompt);
  } catch (groqErr) {
    logger.warn('Groq quiz generation failed, falling back to Gemini', {
      error: groqErr.message,
    });
    provider = 'gemini';
    try {
      rawText = await geminiProvider.generateQuiz(prompt);
    } catch (geminiErr) {
      logger.error(`Quiz generation failed on all providers: ${geminiErr.message}`);
      throw new AppError('Quiz generation failed. Please try again.', 503);
    }
  }

  let parsed;
  try {
    parsed = parseQuizResponse(rawText);
  } catch (err) {
    logger.error(`Quiz generation parse failure: ${err.message}`);
    throw new AppError('AI returned an invalid response format. Please try again.', 502);
  }

  const validation = validateAiQuiz(parsed);
  if (!validation.success) {
    logger.error(`Quiz generation validation failure: ${validation.error}`);
    throw new AppError('AI generated incomplete quiz content. Please try again.', 502);
  }

  logger.info(`Quiz generation success via ${provider}: ${validation.data.length} questions`);

  return { questions: validation.data, provider };
};

module.exports = { generateQuiz };
