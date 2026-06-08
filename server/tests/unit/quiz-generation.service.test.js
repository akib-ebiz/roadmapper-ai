jest.mock('../../src/ai/providers/groq.provider');
jest.mock('../../src/ai/providers/gemini.provider');

const groqProvider = require('../../src/ai/providers/groq.provider');
const geminiProvider = require('../../src/ai/providers/gemini.provider');
const { generateQuiz } = require('../../src/ai/services/quiz-generation.service');

const VALID_QUESTIONS = Array.from({ length: 5 }, (_, i) => ({
  text: `Question ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'],
  correctOption: 0,
  explanation: 'Because it is correct',
}));

const VALID_RESPONSE = JSON.stringify(VALID_QUESTIONS);
const params = { moduleTitle: 'React Hooks', difficulty: 'medium' };

describe('Quiz Generation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groqProvider.generateQuiz.mockResolvedValue(VALID_RESPONSE);
  });

  it('returns validated questions from Groq', async () => {
    const result = await generateQuiz(params);
    expect(result.questions).toHaveLength(5);
    expect(result.provider).toBe('groq');
    expect(geminiProvider.generateQuiz).not.toHaveBeenCalled();
  });

  it('falls back to Gemini when Groq fails', async () => {
    groqProvider.generateQuiz.mockRejectedValue(new Error('Groq down'));
    geminiProvider.generateQuiz.mockResolvedValue(VALID_RESPONSE);

    const result = await generateQuiz(params);
    expect(result.provider).toBe('gemini');
    expect(geminiProvider.generateQuiz).toHaveBeenCalled();
  });

  it('throws when both providers fail', async () => {
    groqProvider.generateQuiz.mockRejectedValue(new Error('Groq down'));
    geminiProvider.generateQuiz.mockRejectedValue(new Error('Gemini down'));

    await expect(generateQuiz(params)).rejects.toThrow('Quiz generation failed');
  });

  it('throws on invalid JSON', async () => {
    groqProvider.generateQuiz.mockResolvedValue('not json');
    await expect(generateQuiz(params)).rejects.toThrow('invalid response format');
  });

  it('throws on validation failure', async () => {
    groqProvider.generateQuiz.mockResolvedValue(JSON.stringify(VALID_QUESTIONS.slice(0, 2)));
    await expect(generateQuiz(params)).rejects.toThrow('incomplete quiz content');
  });
});
