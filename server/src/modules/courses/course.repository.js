const Course = require('./course.model');
const { PAGINATION, COURSE_STATUS } = require('../../common/constants');

/**
 * Create a new course document
 */
const createCourse = async (data) => {
  const course = await Course.create(data);
  return course.toObject();
};

/**
 * Find a single course by ID.
 * Optionally populate instructor details.
 */
const findById = async (id, populate = false) => {
  let query = Course.findById(id);
  if (populate) {
    query = query.populate('instructorId', 'name email avatar');
  }
  return query.lean();
};

/**
 * Find all courses with filtering, searching, and pagination
 */
const findAll = async ({ page = 1, limit = 10, difficulty, topic, search, status, instructorId, _ids }) => {
  const filter = {};

  // Default: only show published courses unless a specific status is requested
  if (status) {
    filter.status = status;
  } else if (!_ids) {
    // If fetching by IDs (enrolled courses), skip default status filter
    filter.status = COURSE_STATUS.PUBLISHED;
  }

  if (difficulty) filter.difficulty = difficulty;
  if (topic) filter.topic = new RegExp(topic, 'i');
  if (instructorId) filter.instructorId = instructorId;
  if (_ids) filter._id = { $in: _ids };

  // Full-text search on title, description, topic
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('instructorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Find courses created by a specific instructor
 */
const findByInstructor = async (instructorId, { page = 1, limit = PAGINATION.DEFAULT_LIMIT } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { instructorId };

  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);

  return {
    courses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update a course by ID
 */
const updateById = async (id, data) => {
  return Course.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
};

/**
 * Delete a course by ID
 */
const deleteById = async (id) => {
  return Course.findByIdAndDelete(id).lean();
};

/**
 * Publish a course (set status to published)
 */
const publishById = async (id) => {
  return Course.findByIdAndUpdate(
    id,
    { $set: { status: COURSE_STATUS.PUBLISHED } },
    { new: true }
  ).lean();
};

/**
 * Increment enrolledStudents counter atomically
 */
const incrementEnrollment = async (id) => {
  return Course.findByIdAndUpdate(id, { $inc: { enrolledStudents: 1 } }, { new: true }).lean();
};

module.exports = {
  createCourse,
  findById,
  findAll,
  findByInstructor,
  updateById,
  deleteById,
  publishById,
  incrementEnrollment,
};
