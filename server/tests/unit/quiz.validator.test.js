const { validateAiQuiz } = require('../../src/ai/schemas/quiz.schema');

const validQuestion = {
  text: 'What is JSX?',
  options: ['Syntax extension', 'Library', 'Framework', 'Database'],
  correctOption: 0,
  explanation: 'JSX is a syntax extension for JavaScript',
};

const buildQuiz = (count = 5) => Array.from({ length: count }, (_, i) => ({
  ...validQuestion,
  text: `Question ${i + 1}?`,
}));

describe('AI Quiz Validator', () => {
  it('accepts valid quiz with 5 questions', () => {
    const result = validateAiQuiz(buildQuiz(5));
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
  });

  it('normalizes correct field to correctOption', () => {
    const questions = buildQuiz(5).map((q) => {
      const { correctOption, ...rest } = q;
      return { ...rest, correct: 1 };
    });
    const result = validateAiQuiz(questions);
    expect(result.success).toBe(true);
    expect(result.data[0].correctOption).toBe(1);
  });

  it('rejects fewer than 5 questions', () => {
    const result = validateAiQuiz(buildQuiz(3));
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 questions for AI output', () => {
    const result = validateAiQuiz(buildQuiz(6));
    expect(result.success).toBe(false);
  });

  it('rejects wrong option count', () => {
    const questions = buildQuiz(5);
    questions[0].options = ['A', 'B'];
    const result = validateAiQuiz(questions);
    expect(result.success).toBe(false);
  });
});
