const { calculateScore } = require('../../src/modules/progress/progress.service');

describe('Analytics scoring integration', () => {
  it('calculateScore produces pass rate compatible with dashboard metrics', () => {
    const questions = Array.from({ length: 5 }, (_, i) => ({
      correctOption: 0,
      text: `Q${i}`,
      options: ['A', 'B', 'C', 'D'],
      explanation: 'E',
    }));
    const answers = questions.map((_, i) => ({ questionId: i, selectedOption: 0 }));
    const { score, passed } = calculateScore(questions, answers);
    expect(score).toBe(100);
    expect(passed).toBe(true);
  });
});
