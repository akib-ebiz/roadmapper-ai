const Quiz = require('./quiz.model');
const Course = require('../courses/course.model');

const createQuiz = async (data) => {
  const quiz = await Quiz.create(data);
  return quiz.toObject();
};

const findById = async (id) => Quiz.findById(id).lean();

const findByModuleId = async (moduleId) => Quiz.findOne({ moduleId }).lean();

const updateById = async (id, data) =>
  Quiz.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();

const deleteById = async (id) => Quiz.findByIdAndDelete(id).lean();

const attachQuizToModule = async (courseId, moduleId, quizId) =>
  Course.findOneAndUpdate(
    { _id: courseId, 'modules._id': moduleId },
    { $set: { 'modules.$.quizId': quizId } },
    { new: true, runValidators: true }
  ).lean();

const findCourseByModuleId = async (moduleId) =>
  Course.findOne({ 'modules._id': moduleId }).lean();

module.exports = {
  createQuiz,
  findById,
  findByModuleId,
  updateById,
  deleteById,
  attachQuizToModule,
  findCourseByModuleId,
};
