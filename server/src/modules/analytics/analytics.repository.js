const mongoose = require('mongoose');
const User = require('../users/user.model');
const Course = require('../courses/course.model');
const Quiz = require('../quizzes/quiz.model');
const QuizAttempt = require('../quizzes/quizAttempt.model');
const { COURSE_STATUS, ROLES } = require('../../common/constants');

const getUserCountsByRole = async () => {
  const result = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);
  const counts = { students: 0, instructors: 0, admins: 0, totalUsers: 0 };
  result.forEach((r) => {
    counts.totalUsers += r.count;
    if (r._id === ROLES.STUDENT) counts.students = r.count;
    if (r._id === ROLES.INSTRUCTOR) counts.instructors = r.count;
    if (r._id === ROLES.ADMIN) counts.admins = r.count;
  });
  return counts;
};

const getCourseCounts = async (instructorId = null) => {
  const filter = instructorId ? { instructorId: new mongoose.Types.ObjectId(instructorId) } : {};
  const [total, published, aiGenerated] = await Promise.all([
    Course.countDocuments(filter),
    Course.countDocuments({ ...filter, status: COURSE_STATUS.PUBLISHED }),
    Course.countDocuments({ ...filter, isAiGenerated: true }),
  ]);
  return { total, published, aiGenerated };
};

const getTotalEnrollments = async (instructorId = null) => {
  if (!instructorId) {
    const result = await Course.aggregate([
      { $group: { _id: null, total: { $sum: '$enrolledStudents' } } },
    ]);
    return result[0]?.total || 0;
  }

  const result = await Course.aggregate([
    { $match: { instructorId: new mongoose.Types.ObjectId(instructorId) } },
    { $group: { _id: null, total: { $sum: '$enrolledStudents' } } },
  ]);
  return result[0]?.total || 0;
};

const getInstructorCourseIds = async (instructorId) => {
  const courses = await Course.find({ instructorId }).select('_id').lean();
  return courses.map((c) => c._id);
};

const getCoursePerformance = async (instructorId) => {
  const filter = instructorId ? { instructorId } : {};
  const courses = await Course.find(filter)
    .select('_id title enrolledStudents status modules')
    .lean();

  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c._id);

  const enrollmentStats = await User.aggregate([
    { $unwind: '$enrolledCourses' },
    { $match: { 'enrolledCourses.courseId': { $in: courseIds } } },
    {
      $group: {
        _id: '$enrolledCourses.courseId',
        enrollments: { $sum: 1 },
        completions: {
          $sum: { $cond: [{ $gte: ['$enrolledCourses.progress', 100] }, 1, 0] },
        },
        avgProgress: { $avg: '$enrolledCourses.progress' },
      },
    },
  ]);

  const quizIds = courses.flatMap((c) =>
    (c.modules || []).filter((m) => m.quizId).map((m) => m.quizId)
  );

  let scoreByCourse = {};
  if (quizIds.length > 0) {
    const scoreStats = await QuizAttempt.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      {
        $group: {
          _id: '$quiz.courseId',
          averageScore: { $avg: '$score' },
        },
      },
    ]);
    scoreByCourse = Object.fromEntries(
      scoreStats.map((s) => [s._id.toString(), Math.round(s.averageScore)])
    );
  }

  const statsMap = Object.fromEntries(
    enrollmentStats.map((s) => [s._id.toString(), s])
  );

  return courses.map((course) => {
    const stats = statsMap[course._id.toString()];
    const enrollments = stats?.enrollments || course.enrolledStudents || 0;
    const completionRate =
      enrollments > 0
        ? Math.round(((stats?.completions || 0) / enrollments) * 100)
        : 0;

    return {
      courseId: course._id,
      title: course.title,
      status: course.status,
      enrollments,
      completionRate,
      averageScore: scoreByCourse[course._id.toString()] || 0,
      avgProgress: stats ? Math.round(stats.avgProgress) : 0,
    };
  });
};

const getQuizStats = async (instructorId = null) => {
  let quizFilter = {};
  if (instructorId) {
    const courseIds = await getInstructorCourseIds(instructorId);
    if (courseIds.length === 0) {
      return { totalAttempts: 0, averageScore: 0, passRate: 0, totalQuizzes: 0 };
    }
    quizFilter = { courseId: { $in: courseIds } };
  }

  const quizzes = await Quiz.find(quizFilter).select('_id').lean();
  const quizIds = quizzes.map((q) => q._id);
  if (quizIds.length === 0) {
    return { totalAttempts: 0, averageScore: 0, passRate: 0, totalQuizzes: 0 };
  }

  const result = await QuizAttempt.aggregate([
    { $match: { quizId: { $in: quizIds } } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        passed: { $sum: { $cond: ['$passed', 1, 0] } },
      },
    },
  ]);

  const stats = result[0] || { totalAttempts: 0, averageScore: 0, passed: 0 };
  return {
    totalAttempts: stats.totalAttempts,
    averageScore: Math.round(stats.averageScore || 0),
    passRate:
      stats.totalAttempts > 0
        ? Math.round((stats.passed / stats.totalAttempts) * 100)
        : 0,
    totalQuizzes: quizIds.length,
  };
};

const getAverageCompletionRate = async (instructorId) => {
  const performance = await getCoursePerformance(instructorId);
  if (performance.length === 0) return 0;
  const total = performance.reduce((sum, c) => sum + c.completionRate, 0);
  return Math.round(total / performance.length);
};

const getGrowthMetrics = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [users, courses, attempts] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Course.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    period: `${days}d`,
    users,
    courses,
    quizAttempts: attempts,
  };
};

const getStudentScoreTrend = async (studentId, limit = 10) => {
  const attempts = await QuizAttempt.find({ studentId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('score passed completedAt')
    .lean();

  return attempts.reverse().map((a, i) => ({
    label: `Attempt ${i + 1}`,
    score: a.score,
    passed: a.passed,
    date: a.completedAt,
  }));
};

const getStudentProgressByCourse = async (studentId) => {
  const user = await User.findById(studentId).select('enrolledCourses').lean();
  if (!user?.enrolledCourses?.length) return [];

  const courseIds = user.enrolledCourses.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).select('title').lean();
  const titleMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c.title]));

  return user.enrolledCourses.map((e) => ({
    courseId: e.courseId,
    title: titleMap[e.courseId.toString()] || 'Course',
    progress: e.progress || 0,
  }));
};

const getAiContentMetrics = async () => {
  const [aiCourses, totalQuizzes] = await Promise.all([
    Course.countDocuments({ isAiGenerated: true }),
    Quiz.countDocuments(),
  ]);
  return {
    aiGeneratedCourses: aiCourses,
    totalQuizzesGenerated: totalQuizzes,
    geminiRequests: aiCourses,
    groqRequests: totalQuizzes,
    note: 'Request counts derived from AI-generated content; full request logging in future phase',
  };
};

module.exports = {
  getUserCountsByRole,
  getCourseCounts,
  getTotalEnrollments,
  getCoursePerformance,
  getQuizStats,
  getAverageCompletionRate,
  getGrowthMetrics,
  getStudentScoreTrend,
  getStudentProgressByCourse,
  getAiContentMetrics,
};
