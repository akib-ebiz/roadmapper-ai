const {
  calculateScore,
  calculateCourseProgress,
  isModuleUnlocked,
  buildModuleStatuses,
} = require('../../src/modules/progress/progress.service');

describe('Progress Service', () => {
  const questions = [
    { text: 'Q1', options: ['A', 'B', 'C', 'D'], correctOption: 0, explanation: 'E1' },
    { text: 'Q2', options: ['A', 'B', 'C', 'D'], correctOption: 1, explanation: 'E2' },
    { text: 'Q3', options: ['A', 'B', 'C', 'D'], correctOption: 2, explanation: 'E3' },
    { text: 'Q4', options: ['A', 'B', 'C', 'D'], correctOption: 3, explanation: 'E4' },
    { text: 'Q5', options: ['A', 'B', 'C', 'D'], correctOption: 0, explanation: 'E5' },
  ];

  describe('calculateScore', () => {
    it('calculates 100% when all correct', () => {
      const answers = questions.map((q, i) => ({
        questionId: i,
        selectedOption: q.correctOption,
      }));
      const result = calculateScore(questions, answers);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.gradedAnswers.every((a) => a.isCorrect)).toBe(true);
    });

    it('calculates 40% and fails below threshold', () => {
      const answers = [
        { questionId: 0, selectedOption: 0 },
        { questionId: 1, selectedOption: 1 },
        { questionId: 2, selectedOption: 1 },
        { questionId: 3, selectedOption: 1 },
        { questionId: 4, selectedOption: 1 },
      ];
      const result = calculateScore(questions, answers);
      expect(result.score).toBe(40);
      expect(result.passed).toBe(false);
    });

    it('passes at exactly 70%', () => {
      const answers = [
        { questionId: 0, selectedOption: 0 },
        { questionId: 1, selectedOption: 1 },
        { questionId: 2, selectedOption: 2 },
        { questionId: 3, selectedOption: 3 },
        { questionId: 4, selectedOption: 1 },
      ];
      const result = calculateScore(questions, answers);
      expect(result.score).toBe(80);
      expect(result.passed).toBe(true);
    });
  });

  describe('calculateCourseProgress', () => {
    it('returns 50% for half completed', () => {
      expect(calculateCourseProgress(['a', 'b'], 4)).toBe(50);
    });

    it('returns 100% when all complete', () => {
      expect(calculateCourseProgress(['a', 'b', 'c', 'd'], 4)).toBe(100);
    });
  });

  describe('isModuleUnlocked', () => {
    const moduleIds = ['m1', 'm2', 'm3'];

    it('first module always unlocked', () => {
      expect(isModuleUnlocked(0, [], moduleIds)).toBe(true);
    });

    it('second module locked until first complete', () => {
      expect(isModuleUnlocked(1, [], moduleIds)).toBe(false);
      expect(isModuleUnlocked(1, ['m1'], moduleIds)).toBe(true);
    });
  });

  describe('buildModuleStatuses', () => {
    it('marks completed, current, and locked modules', () => {
      const modules = [{ _id: 'm1' }, { _id: 'm2' }, { _id: 'm3' }];
      const statuses = buildModuleStatuses(modules, ['m1']);
      expect(statuses[0].status).toBe('completed');
      expect(statuses[1].status).toBe('current');
      expect(statuses[2].status).toBe('locked');
    });
  });
});
