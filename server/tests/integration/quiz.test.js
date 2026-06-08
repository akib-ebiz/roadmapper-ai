jest.mock('../../src/ai/providers/groq.provider');
jest.mock('../../src/ai/providers/gemini.provider');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const groqProvider = require('../../src/ai/providers/groq.provider');

const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

const MOCK_QUESTIONS = Array.from({ length: 5 }, (_, i) => ({
  text: `Question ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'],
  correctOption: 0,
  explanation: 'Explanation here',
}));

let instructorToken;
let studentToken;
let courseId;
let moduleId;
let module2Id;

const registerAndLogin = async (userData) => {
  await request(app).post('/api/v1/auth/register').send(userData);
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: userData.email, password: userData.password });
  return res.body.data;
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }

  const instructor = await registerAndLogin({
    name: 'Quiz Instructor',
    email: 'quiz.instructor@test.com',
    password: 'Password1',
    role: 'instructor',
  });
  instructorToken = instructor.token;

  const student = await registerAndLogin({
    name: 'Quiz Student',
    email: 'quiz.student@test.com',
    password: 'Password1',
    role: 'student',
  });
  studentToken = student.token;

  const courseRes = await request(app)
    .post('/api/v1/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      title: 'Quiz Test Course',
      description: 'A course for testing quiz generation flow',
      topic: 'Testing',
      difficulty: 'beginner',
      durationWeeks: 4,
      modules: [
        { title: 'Module One', objectives: ['Learn basics'], videoUrl: '' },
        { title: 'Module Two', objectives: ['Learn more'], videoUrl: '' },
      ],
    });

  courseId = courseRes.body.data._id;
  moduleId = courseRes.body.data.modules[0]._id;
  module2Id = courseRes.body.data.modules[1]._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();
  groqProvider.generateQuiz.mockResolvedValue(JSON.stringify(MOCK_QUESTIONS));
});

describe('POST /api/v1/quizzes/generate/:moduleId', () => {
  it('instructor can generate quiz preview', async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/generate/${moduleId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ difficulty: 'medium' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toHaveLength(5);
    expect(res.body.data.provider).toBe('groq');
  });

  it('student cannot generate quiz', async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/generate/${moduleId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ difficulty: 'medium' });

    expect(res.statusCode).toBe(403);
  });

  it('generated quiz is not saved automatically', async () => {
    await request(app)
      .post(`/api/v1/quizzes/generate/${moduleId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ difficulty: 'easy' });

    const Quiz = mongoose.model('Quiz');
    const count = await Quiz.countDocuments({ moduleId });
    expect(count).toBe(0);
  });
});

describe('POST /api/v1/quizzes', () => {
  it('instructor can save quiz and attach to module', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId,
        moduleId,
        difficulty: 'medium',
        questions: MOCK_QUESTIONS,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.quiz.questions).toHaveLength(5);

    const Course = mongoose.model('Course');
    const course = await Course.findById(courseId).lean();
    const mod = course.modules.find((m) => m._id.toString() === moduleId);
    expect(mod.quizId).toBeTruthy();
  });

  it('rejects duplicate quiz for same module', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId,
        moduleId,
        difficulty: 'hard',
        questions: MOCK_QUESTIONS,
      });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/v1/quizzes/:quizId', () => {
  it('instructor can fetch saved quiz', async () => {
    const createRes = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId,
        moduleId: module2Id,
        difficulty: 'easy',
        questions: MOCK_QUESTIONS,
      });

    expect(createRes.statusCode).toBe(201);
    const quizId = createRes.body.data.quiz._id;

    const getRes = await request(app)
      .get(`/api/v1/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.data.quiz.questions).toHaveLength(5);
  });
});
