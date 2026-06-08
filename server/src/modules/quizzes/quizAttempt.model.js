const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true, min: 0 },
    selectedOption: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ studentId: 1, quizId: 1 });
quizAttemptSchema.index({ studentId: 1, courseId: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;
