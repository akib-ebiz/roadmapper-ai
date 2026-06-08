const mongoose = require('mongoose');
const QuizAttempt = require('./quizAttempt.model');

const createAttempt = async (data) => {
  const attempt = await QuizAttempt.create(data);
  return attempt.toObject();
};

const findById = async (id) => QuizAttempt.findById(id).lean();

const findByStudentAndQuiz = async (studentId, quizId) =>
  QuizAttempt.findOne({ studentId, quizId }).sort({ completedAt: -1 }).lean();

const findByStudent = async (studentId) =>
  QuizAttempt.find({ studentId }).sort({ completedAt: -1 }).lean();

const getAverageScoreForStudent = async (studentId) => {
  const result = await QuizAttempt.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
    { $group: { _id: null, avgScore: { $avg: '$score' } } },
  ]);
  return result[0]?.avgScore ?? 0;
};

const countPassedByStudent = async (studentId) =>
  QuizAttempt.countDocuments({ studentId, passed: true });

module.exports = {
  createAttempt,
  findById,
  findByStudentAndQuiz,
  findByStudent,
  getAverageScoreForStudent,
  countPassedByStudent,
};
