/**
 * Parse JSON array from AI quiz responses.
 */

/**
 * @param {string} rawText
 * @returns {unknown[]}
 */
const parseQuizResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI returned empty or invalid response');
  }

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1 || firstBracket > lastBracket) {
    throw new Error('AI response does not contain valid JSON array');
  }

  cleaned = cleaned.slice(firstBracket, lastBracket + 1);

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not a JSON array');
    }
    return parsed;
  } catch (err) {
    throw new Error(`AI response JSON parse failed: ${err.message}`);
  }
};

module.exports = { parseQuizResponse };
