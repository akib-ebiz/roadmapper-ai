const mongoose = require('mongoose');
const { QUIZ_DIFFICULTY } = require('../../common/constants');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: 'Each question must have exactly 4 options',
      },
    },
    correctOption: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(QUIZ_DIFFICULTY),
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 5 && v.length <= 20,
        message: 'Quiz must have between 5 and 20 questions',
      },
    },
  },
  { timestamps: true }
);

quizSchema.index({ courseId: 1, moduleId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
