/**
 * Unit tests for course generation service.
 * Per AI testing rules: NEVER use live Gemini API — use mocks.
 */

jest.mock('../../src/ai/providers/gemini.provider');

const geminiProvider = require('../../src/ai/providers/gemini.provider');
const { generateCourse } = require('../../src/ai/services/course-generation.service');

const VALID_AI_RESPONSE = JSON.stringify({
  title: 'React Fundamentals',
  description: 'A complete guide to learning React hooks and patterns.',
  modules: [
    { title: 'Intro to React', objectives: ['Understand JSX', 'Create components'], videoSuggestion: 'React intro' },
    { title: 'useState Hook', objectives: ['Manage state', 'Handle events'], videoSuggestion: 'useState tutorial' },
    { title: 'useEffect Hook', objectives: ['Side effects', 'Cleanup'], videoSuggestion: 'useEffect tutorial' },
    { title: 'Context API', objectives: ['Share state', 'Avoid prop drilling'], videoSuggestion: 'React context' },
  ],
});

describe('Course Generation Service', () => {
  const params = {
    topic: 'React',
    targetAudience: 'Frontend developers',
    difficulty: 'beginner',
    durationWeeks: 6,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validated course on successful generation', async () => {
    geminiProvider.generateCourse.mockResolvedValue(VALID_AI_RESPONSE);

    const result = await generateCourse(params);

    expect(result.title).toBe('React Fundamentals');
    expect(result.modules).toHaveLength(4);
    expect(result.modules[0].objectives.length).toBeGreaterThan(0);
  });

  it('throws when provider fails', async () => {
    geminiProvider.generateCourse.mockRejectedValue(new Error('Provider unavailable'));

    await expect(generateCourse(params)).rejects.toThrow('Course generation failed');
  });

  it('throws when AI returns invalid JSON', async () => {
    geminiProvider.generateCourse.mockResolvedValue('This is not JSON at all');

    await expect(generateCourse(params)).rejects.toThrow('invalid response format');
  });

  it('throws when AI returns JSON that fails schema validation', async () => {
    // Only 2 modules — below minimum of 4
    const tooFewModules = JSON.stringify({
      title: 'React',
      description: 'Short desc',
      modules: [
        { title: 'M1', objectives: ['obj'], videoSuggestion: '' },
        { title: 'M2', objectives: ['obj'], videoSuggestion: '' },
      ],
    });
    geminiProvider.generateCourse.mockResolvedValue(tooFewModules);

    await expect(generateCourse(params)).rejects.toThrow('incomplete course content');
  });

  it('strips markdown from AI response before parsing', async () => {
    const markdownWrapped = `\`\`\`json\n${VALID_AI_RESPONSE}\n\`\`\``;
    geminiProvider.generateCourse.mockResolvedValue(markdownWrapped);

    const result = await generateCourse(params);
    expect(result.title).toBe('React Fundamentals');
  });
});
