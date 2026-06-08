const Groq = require('groq-sdk');
const config = require('../../config');
const logger = require('../../common/logger');
const { AppError } = require('../../common/errors');

const PRIMARY_MODEL = 'llama-3.1-8b-instant';
const FALLBACK_MODEL = 'llama-3.3-70b-versatile';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000;
const BASE_RETRY_DELAY_MS = 1000;

let _client = null;

const _getClient = () => {
  if (!_client) {
    if (!config.ai.groqApiKey) {
      throw new AppError('Groq API key is not configured', 500);
    }
    _client = new Groq({ apiKey: config.ai.groqApiKey });
  }
  return _client;
};

const _callModel = async (prompt, model) => {
  const client = _getClient();
  const completion = await Promise.race([
    client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), TIMEOUT_MS)
    ),
  ]);

  const text = completion.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq returned empty response');
  }
  return text;
};

/**
 * Call Groq with retry and optional model fallback.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const callWithRetry = async (prompt) => {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const startTime = Date.now();
      try {
        const text = await _callModel(prompt, model);
        logger.info('Groq call success', {
          model,
          durationMs: Date.now() - startTime,
          attempt,
        });
        return text;
      } catch (err) {
        lastError = err;
        logger.warn(`Groq call failed (model=${model}, attempt=${attempt}/${MAX_RETRIES})`, {
          durationMs: Date.now() - startTime,
          error: err.message,
        });

        if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  logger.error(`Groq failed after all retries: ${lastError.message}`);
  throw new AppError(`AI provider unavailable: ${lastError.message}`, 503);
};

const generateQuiz = async (prompt) => callWithRetry(prompt);

const healthCheck = async () => {
  try {
    await _callModel('Reply with the single word: OK', PRIMARY_MODEL);
    return { healthy: true, model: PRIMARY_MODEL };
  } catch (err) {
    return { healthy: false, model: PRIMARY_MODEL, error: err.message };
  }
};

module.exports = { generateQuiz, healthCheck };
