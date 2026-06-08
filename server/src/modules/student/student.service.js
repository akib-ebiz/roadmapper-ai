const progressRepository = require('../progress/progress.repository');
const progressService = require('../progress/progress.service');
const courseRepository = require('../courses/course.repository');
const quizAttemptRepository = require('../quizzes/quizAttempt.repository');
const quizRepository = require('../quizzes/quiz.repository');
const { AppError } = require('../../common/errors');
const { ROLES } = require('../../common/constants');

const getStudentCourses = async (requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Student courses endpoint is for students only', 403);
  }

  const enrollments = await progressRepository.getEnrollments(requestingUser.userId);
  if (enrollments.length === 0) {
    return { courses: [] };
  }

  const courseIds = enrollments.map((e) => e.courseId);
  const { courses } = await courseRepository.findAll({
    _ids: courseIds,
    status: undefined,
    page: 1,
    limit: 100,
  });

  const enrollmentMap = new Map(
    enrollments.map((e) => [e.courseId.toString(), e])
  );

  const enriched = await Promise.all(
    courses.map(async (course) => {
      const enrollment = enrollmentMap.get(course._id.toString());
      const completedIds = enrollment?.completedModules || [];
      const moduleStatuses = progressService.buildModuleStatuses(
        course.modules || [],
        completedIds
      );

      const modulesWithQuiz = await Promise.all(
        moduleStatuses.map(async (mod) => {
          let quizStatus = 'none';
          if (mod.quizId) {
            const attempt = await quizAttemptRepository.findByStudentAndQuiz(
              requestingUser.userId,
              mod.quizId.toString()
            );
            if (attempt?.passed) quizStatus = 'passed';
            else if (attempt) quizStatus = 'attempted';
            else quizStatus = 'available';
          }
          return { ...mod, quizStatus };
        })
      );

      return {
        ...course,
        progress: enrollment?.progress || 0,
        completedModules: completedIds.length,
        totalModules: course.modules?.length || 0,
        isCompleted: (enrollment?.progress || 0) >= 100,
        modules: modulesWithQuiz,
      };
    })
  );

  return { courses: enriched };
};

const getLearningPath = async (courseId, requestingUser) => {
  if (requestingUser.role !== ROLES.STUDENT) {
    throw new AppError('Learning path is for students only', 403);
  }

  const enrollment = await progressRepository.getEnrollment(requestingUser.userId, courseId);
  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  const course = await courseRepository.findById(courseId, true);
  if (!course) throw new AppError('Course not found', 404);

  const completedIds = enrollment.completedModules || [];
  const moduleStatuses = progressService.buildModuleStatuses(course.modules || [], completedIds);

  const modules = await Promise.all(
    moduleStatuses.map(async (mod) => {
      let quiz = null;
      let lastAttempt = null;

      if (mod.quizId) {
        quiz = await quizRepository.findById(mod.quizId.toString());
        lastAttempt = await quizAttemptRepository.findByStudentAndQuiz(
          requestingUser.userId,
          mod.quizId.toString()
        );
      }

      return {
        _id: mod._id,
        title: mod.title,
        objectives: mod.objectives,
        videoUrl: mod.videoUrl,
        quizId: mod.quizId,
        status: mod.status,
        isCompleted: mod.isCompleted,
        isUnlocked: mod.isUnlocked,
        quizPassed: lastAttempt?.passed || false,
        lastScore: lastAttempt?.score ?? null,
        hasQuiz: !!mod.quizId,
      };
    })
  );

  return {
    course: {
      _id: course._id,
      title: course.title,
      description: course.description,
      topic: course.topic,
      difficulty: course.difficulty,
      durationWeeks: course.durationWeeks,
      instructor: course.instructorId,
    },
    progress: enrollment.progress,
    completedModules: completedIds.length,
    totalModules: course.modules?.length || 0,
    isCompleted: enrollment.progress >= 100,
    modules,
  };
};

module.exports = { getStudentCourses, getLearningPath };
