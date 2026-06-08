/**
 * AI Response Parser
 *
 * Gemini sometimes wraps JSON in markdown code blocks like:
 * ```json
 * { ... }
 * ```
 * This parser strips all that and returns clean JSON.
 */

/**
 * Extract and parse JSON from raw AI response text
 * @param {string} rawText - raw string from Gemini
 * @returns {object} parsed JSON object
 * @throws {Error} if JSON cannot be extracted or parsed
 */
const parseAiResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI returned empty or invalid response');
  }

  let cleaned = rawText.trim();

  // Remove markdown code block wrappers: ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  // Remove any leading/trailing non-JSON text before { or after }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    throw new Error('AI response does not contain valid JSON object');
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response JSON parse failed: ${err.message}`);
  }
};

module.exports = { parseAiResponse };
