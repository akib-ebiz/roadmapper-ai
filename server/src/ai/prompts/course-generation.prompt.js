/**
 * Course Generation Prompt Template v1
 *
 * Per AI integration spec: prompts must be deterministic, structured,
 * request JSON only, and define strict output format.
 */

/**
 * Build the course generation prompt for Gemini
 * @param {{ topic: string, targetAudience: string, difficulty: string, durationWeeks: number }} params
 * @returns {string} prompt string
 */
const buildCourseGenerationPrompt = ({ topic, targetAudience, difficulty, durationWeeks }) => {
  return `You are an expert curriculum designer. Generate a complete course outline.

Topic: ${topic}
Target Audience: ${targetAudience}
Difficulty Level: ${difficulty}
Duration: ${durationWeeks} weeks

Requirements:
- Generate between 4 and 8 modules
- Each module must have 2-4 learning objectives
- Each module should include a video suggestion keyword for YouTube search
- Course description should be 2-3 sentences

Return ONLY valid JSON with NO markdown, NO code blocks, NO explanation text.
The response must start with { and end with }.

Use this exact structure:
{
  "title": "Course title here",
  "description": "Course description here",
  "modules": [
    {
      "title": "Module title",
      "objectives": ["Objective 1", "Objective 2"],
      "videoSuggestion": "search keyword for YouTube"
    }
  ]
}`;
};

module.exports = { buildCourseGenerationPrompt };
