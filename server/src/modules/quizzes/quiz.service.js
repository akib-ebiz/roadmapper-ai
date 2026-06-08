const quizRepository = require('./quiz.repository');
const quizAttemptRepository = require('./quizAttempt.repository');
const quizGenerationService = require('../../ai/services/quiz-generation.service');
const progressRepository = require('../progress/progress.repository');
const progressService = require('../progress/progress.service');
const userRepository = require('../users/user.repository');
const courseRepository = require('../courses/course.repository');
const { AppError } = require('../../common/errors');
const { ROLES } = require('../../common/constants');
const logger = require('../../common/logger');

const _assertOwnerOrAdmin = (course, requestingUser) => {
  const isOwner = course.instructorId.toString() === requestingUser.userId;
  const isAdmin = requestingUser.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to perform this action', 403);
  }
};

const _assertStudentEnrolled = async (userId, courseId) => {
  const enrolled = await userRepository.isEnrolled(userId, courseId);
  if (!enrolled) {
    throw new AppError('You must be enrolled in this course to access this quiz', 403);
  }
};

const _getModuleContext = async (moduleId, requestingUser) => {
  const course = await quizRepository.findCourseByModuleId(moduleId);
  if (!course) throw new AppError('Module not found', 404);

  _assertOwnerOrAdmin(course, requestingUser);

  const module = course.modules.find((m) => m._id.toString() === moduleId);
  if (!module) throw new AppError('Module not found', 404);

  return { course, module };
};

const generateQuiz = async (moduleId, { difficulty }, requestingUser) => {
  const { module } = await _getModuleContext(moduleId, requestingUser);

  const result = await quizGenerationService.generateQuiz({
    moduleTitle: module.title,
    difficulty,
  });

  return {
    questions: result.questions,
    provider: result.provider,
    moduleTitle: module.title,
  };
};

const saveQuiz = async (data, requestingUser) => {
  const { courseId, moduleId, difficulty, questions } = data;

  const course = await quizRepository.findCourseByModuleId(moduleId);
  if (!course || course._id.toString() !== courseId) {
    throw new AppError('Module does not belong to the specified course', 400);
  }

  _assertOwnerOrAdmin(course, requestingUser);

  const existing = await quizRepository.findByModuleId(moduleId);
  if (existing) {
    throw new AppError('This module already has a quiz. Update or delete it first.', 400);
  }

  const quiz = await quizRepository.createQuiz({
    courseId,
    moduleId,
    difficulty,
    questions,
    createdBy: requestingUser.userId,
  });

  await quizRepository.attachQuizToModule(courseId, moduleId, quiz._id);

  logger.info(`Quiz saved for module ${moduleId} by ${requestingUser.userId}`);

  return quiz;
};

const getQuizById = async (quizId, requestingUser) => {
  const quiz = await quizRepository.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  const course = await quizRepository.findCourseByModuleId(quiz.moduleId.toString());
  if (!course) throw new AppError('Quiz not found', 404);

  const isOwner =
    course.instructorId.toString() === requestingUser.userId ||
    requestingUser.role === ROLES.ADMIN;

  if (!isOwner && requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('You do not have permission to view this quiz', 403);
  }

  if (requestingUser.role === ROLES.STUDENT) {
    await _assertStudentEnrolled(requestingUser.userId, quiz.courseId.toString());
  }

  return quiz;
};

/**
 * Get quiz for taking — strips correct answers for students.
 */
const getQuizForTaking = async (quizId, requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Only students can take quizzes', 403);
  }

  const quiz = await quizRepository.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  await _assertStudentEnrolled(requestingUser.userId, quiz.courseId.toString());

  const course = await courseRepository.findById(quiz.courseId.toString());
  const enrollment = await progressRepository.getEnrollment(
    requestingUser.userId,
    quiz.courseId.toString()
  );

  const moduleIndex = course.modules.findIndex(
    (m) => m._id.toString() === quiz.moduleId.toString()
  );
  if (moduleIndex === -1) throw new AppError('Module not found', 404);

  const completedIds = enrollment?.completedModules || [];
  const moduleIds = course.modules.map((m) => m._id);

  if (!progressService.isModuleUnlocked(moduleIndex, completedIds, moduleIds)) {
    throw new AppError('Complete previous modules before taking this quiz', 403);
  }

  const safeQuestions = quiz.questions.map((q, index) => ({
    questionId: index,
    text: q.text,
    options: q.options,
  }));

  return {
    _id: quiz._id,
    courseId: quiz.courseId,
    moduleId: quiz.moduleId,
    difficulty: quiz.difficulty,
    questions: safeQuestions,
  };
};

const submitQuiz = async (quizId, { answers }, requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Only students can submit quizzes', 403);
  }

  const quiz = await quizRepository.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  await _assertStudentEnrolled(requestingUser.userId, quiz.courseId.toString());

  if (answers.length !== quiz.questions.length) {
    throw new AppError('You must answer all questions', 400);
  }

  const { score, gradedAnswers, passed } = progressService.calculateScore(
    quiz.questions,
    answers
  );

  const attempt = await quizAttemptRepository.createAttempt({
    studentId: requestingUser.userId,
    quizId: quiz._id,
    courseId: quiz.courseId,
    moduleId: quiz.moduleId,
    answers: gradedAnswers,
    score,
    passed,
    completedAt: new Date(),
  });

  logger.info(
    `Quiz submitted: student=${requestingUser.userId}, quiz=${quizId}, score=${score}, passed=${passed}`
  );

  let moduleCompleted = false;
  let courseProgress = 0;

  if (passed) {
    const course = await courseRepository.findById(quiz.courseId.toString());
    const enrollment = await progressRepository.getEnrollment(
      requestingUser.userId,
      quiz.courseId.toString()
    );
    const completedIds = (enrollment?.completedModules || []).map((id) => id.toString());
    const moduleIdStr = quiz.moduleId.toString();

    if (!completedIds.includes(moduleIdStr)) {
      completedIds.push(moduleIdStr);
      courseProgress = progressService.calculateCourseProgress(
        completedIds,
        course.modules.length
      );
      await progressRepository.updateEnrollmentProgress(requestingUser.userId, quiz.courseId, {
        progress: courseProgress,
        completedModules: completedIds,
      });
      moduleCompleted = true;

      if (courseProgress === 100) {
        logger.info(
          `Course completed: student=${requestingUser.userId}, course=${quiz.courseId}`
        );
      }
    } else {
      courseProgress = enrollment.progress;
    }
  } else {
    const enrollment = await progressRepository.getEnrollment(
      requestingUser.userId,
      quiz.courseId.toString()
    );
    courseProgress = enrollment?.progress || 0;
  }

  const results = quiz.questions.map((q, index) => {
    const graded = gradedAnswers.find((a) => a.questionId === index);
    return {
      questionId: index,
      text: q.text,
      options: q.options,
      selectedOption: graded?.selectedOption,
      correctOption: q.correctOption,
      isCorrect: graded?.isCorrect ?? false,
      explanation: q.explanation,
    };
  });

  return {
    attemptId: attempt._id,
    score,
    passed,
    moduleCompleted,
    courseProgress,
    results,
  };
};

const getAttemptById = async (attemptId, requestingUser) => {
  const attempt = await quizAttemptRepository.findById(attemptId);
  if (!attempt) throw new AppError('Quiz attempt not found', 404);

  if (attempt.studentId.toString() !== requestingUser.userId) {
    throw new AppError('You do not have permission to view this attempt', 403);
  }

  const quiz = await quizRepository.findById(attempt.quizId.toString());
  if (!quiz) throw new AppError('Quiz not found', 404);

  const results = quiz.questions.map((q, index) => {
    const graded = attempt.answers.find((a) => a.questionId === index);
    return {
      questionId: index,
      text: q.text,
      options: q.options,
      selectedOption: graded?.selectedOption,
      correctOption: q.correctOption,
      isCorrect: graded?.isCorrect ?? false,
      explanation: q.explanation,
    };
  });

  return {
    _id: attempt._id,
    score: attempt.score,
    passed: attempt.passed,
    completedAt: attempt.completedAt,
    quizId: attempt.quizId,
    courseId: attempt.courseId,
    results,
  };
};

const updateQuiz = async (quizId, data, requestingUser) => {
  const quiz = await quizRepository.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  const course = await quizRepository.findCourseByModuleId(quiz.moduleId.toString());
  _assertOwnerOrAdmin(course, requestingUser);

  const updated = await quizRepository.updateById(quizId, data);
  logger.info(`Quiz updated: ${quizId} by ${requestingUser.userId}`);
  return updated;
};

const deleteQuiz = async (quizId, requestingUser) => {
  const quiz = await quizRepository.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  const course = await quizRepository.findCourseByModuleId(quiz.moduleId.toString());
  _assertOwnerOrAdmin(course, requestingUser);

  await quizRepository.attachQuizToModule(
    quiz.courseId.toString(),
    quiz.moduleId.toString(),
    null
  );
  await quizRepository.deleteById(quizId);

  logger.info(`Quiz deleted: ${quizId} by ${requestingUser.userId}`);
};

module.exports = {
  generateQuiz,
  saveQuiz,
  getQuizById,
  getQuizForTaking,
  submitQuiz,
  getAttemptById,
  updateQuiz,
  deleteQuiz,
};
