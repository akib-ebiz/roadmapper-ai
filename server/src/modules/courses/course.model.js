const mongoose = require('mongoose');
const { DIFFICULTY, COURSE_STATUS } = require('../../common/constants');

// Modules are embedded in courses (per database design doc - faster reads, fewer collections)
const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [200, 'Module title must not exceed 200 characters'],
    },
    objectives: [{ type: String, trim: true }],
    videoUrl: { type: String, default: '' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [100, 'Topic must not exceed 100 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: Object.values(DIFFICULTY),
        message: 'Difficulty must be beginner, intermediate, or advanced',
      },
    },
    durationWeeks: {
      type: Number,
      required: [true, 'Duration in weeks is required'],
      min: [1, 'Duration must be at least 1 week'],
      max: [52, 'Duration must not exceed 52 weeks'],
    },
    thumbnail: { type: String, default: '' },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    modules: [moduleSchema],
    enrolledStudents: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: { values: Object.values(COURSE_STATUS), message: 'Invalid course status' },
      default: COURSE_STATUS.DRAFT,
    },
    // Flag for AI-generated courses (used in Phase 04+)
    isAiGenerated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes per database design doc
courseSchema.index({ title: 'text', description: 'text', topic: 'text' });
courseSchema.index({ topic: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
