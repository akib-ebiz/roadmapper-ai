const { QUIZ } = require('../../common/constants');

/**
 * Calculate quiz score from answers against quiz questions.
 * @param {Array} questions - quiz questions with correctOption
 * @param {Array<{ questionId: number, selectedOption: number }>} answers
 * @returns {{ score: number, gradedAnswers: Array, passed: boolean }}
 */
const calculateScore = (questions, answers) => {
  const gradedAnswers = answers.map((answer) => {
    const question = questions[answer.questionId];
    if (!question) {
      return { ...answer, isCorrect: false };
    }
    const isCorrect = question.correctOption === answer.selectedOption;
    return {
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
    };
  });

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= QUIZ.PASS_THRESHOLD;

  return { score, gradedAnswers, passed };
};

/**
 * Course progress = completed modules / total modules × 100
 */
const calculateCourseProgress = (completedModuleIds, totalModules) => {
  if (!totalModules || totalModules === 0) return 0;
  return Math.round((completedModuleIds.length / totalModules) * 100);
};

/**
 * Determine if a module is unlocked (sequential learning path).
 * Module 0 always unlocked; module N unlocked when N-1 is completed.
 */
const isModuleUnlocked = (moduleIndex, completedModuleIds, moduleIds) => {
  if (moduleIndex === 0) return true;
  const prevModuleId = moduleIds[moduleIndex - 1]?.toString();
  return completedModuleIds.some((id) => id.toString() === prevModuleId);
};

/**
 * Build module status list for learning roadmap.
 */
const buildModuleStatuses = (modules, completedModuleIds) => {
  const completedSet = new Set(completedModuleIds.map((id) => id.toString()));
  const moduleIds = modules.map((m) => m._id);

  return modules.map((mod, index) => {
    const modId = mod._id.toString();
    const isCompleted = completedSet.has(modId);
    const unlocked = isModuleUnlocked(index, completedModuleIds, moduleIds);

    let status = 'locked';
    if (isCompleted) status = 'completed';
    else if (unlocked) status = 'current';

    return {
      ...mod,
      status,
      isCompleted,
      isUnlocked: unlocked,
    };
  });
};

module.exports = {
  calculateScore,
  calculateCourseProgress,
  isModuleUnlocked,
  buildModuleStatuses,
};
