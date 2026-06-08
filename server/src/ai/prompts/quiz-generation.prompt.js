/**
 * Quiz Generation Prompt Template v1
 */

/**
 * @param {{ moduleTitle: string, difficulty: string }} params
 * @returns {string}
 */
const buildQuizGenerationPrompt = ({ moduleTitle, difficulty }) => {
  return `You are an expert educator. Generate a multiple-choice quiz for the following module.

Module Title: ${moduleTitle}
Difficulty: ${difficulty}

Requirements:
- Generate exactly 5 questions
- Each question must have exactly 4 answer options
- Each question must have one correct answer (index 0-3)
- Each question must include a brief explanation

Return ONLY valid JSON with NO markdown, NO code blocks, NO explanation text.
The response must start with [ and end with ].

Use this exact structure:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": 0,
    "explanation": "Why this answer is correct"
  }
]`;
};

module.exports = { buildQuizGenerationPrompt };
