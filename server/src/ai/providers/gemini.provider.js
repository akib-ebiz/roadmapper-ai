const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const logger = require('../../common/logger');
const { AppError } = require('../../common/errors');

const MODEL_NAME = 'gemini-1.5-flash'; // cost-optimised model for course generation

const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000; // 15 seconds per AI integration spec
const BASE_RETRY_DELAY_MS = 1000; // exponential backoff: 1s, 2s, 4s

let _client = null;

const _getClient = () => {
  if (!_client) {
    if (!config.ai.geminiApiKey) {
      throw new AppError('Gemini API key is not configured', 500);
    }
    _client = new GoogleGenerativeAI(config.ai.geminiApiKey);
  }
  return _client;
};

/**
 * Call Gemini with a prompt, retrying on transient failures.
 * Uses exponential backoff per AI integration spec.
 * @param {string} prompt
 * @returns {Promise<string>} raw text response
 */
const callWithRetry = async (prompt) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    try {
      const client = _getClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });

      // Enforce timeout using Promise.race
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), TIMEOUT_MS)
        ),
      ]);

      const text = result.response.text();
      const durationMs = Date.now() - startTime;

      // Log every AI call (per AI integration spec - never log API key)
      logger.info(`Gemini call success`, {
        model: MODEL_NAME,
        durationMs,
        attempt,
      });

      return text;
    } catch (err) {
      lastError = err;
      const durationMs = Date.now() - startTime;

      logger.warn(`Gemini call failed (attempt ${attempt}/${MAX_RETRIES})`, {
        model: MODEL_NAME,
        durationMs,
        error: err.message,
      });

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  logger.error(`Gemini failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
  throw new AppError(`AI provider unavailable: ${lastError.message}`, 503);
};

/**
 * Generate course content using Gemini
 * @param {string} prompt - fully built prompt string
 * @returns {Promise<string>} raw text response
 */
const generateCourse = async (prompt) => callWithRetry(prompt);

const generateQuiz = async (prompt) => callWithRetry(prompt);

/**
 * Health check — verify Gemini is reachable and responding
 * @returns {Promise<{ healthy: boolean, model: string }>}
 */
const healthCheck = async () => {
  try {
    const client = _getClient();
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    await Promise.race([
      model.generateContent('Reply with the single word: OK'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
    return { healthy: true, model: MODEL_NAME };
  } catch (err) {
    return { healthy: false, model: MODEL_NAME, error: err.message };
  }
};

module.exports = { generateCourse, generateQuiz, healthCheck };
