const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

const MOCK_QUESTIONS = Array.from({ length: 5 }, (_, i) => ({
  text: `Question ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'],
  correctOption: 0,
  explanation: 'Because A is correct',
}));

let instructorToken;
let studentToken;
let courseId;
let moduleId;
let quizId;

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
    name: 'Flow Instructor',
    email: 'flow.instructor@test.com',
    password: 'Password1',
    role: 'instructor',
  });
  instructorToken = instructor.token;

  const student = await registerAndLogin({
    name: 'Flow Student',
    email: 'flow.student@test.com',
    password: 'Password1',
    role: 'student',
  });
  studentToken = student.token;

  const courseRes = await request(app)
    .post('/api/v1/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      title: 'Student Flow Course',
      description: 'Course for testing student learning flow end to end',
      topic: 'Learning',
      difficulty: 'beginner',
      durationWeeks: 4,
      modules: [
        { title: 'Module One', objectives: ['Basics'], videoUrl: '' },
        { title: 'Module Two', objectives: ['Advanced'], videoUrl: '' },
      ],
    });

  courseId = courseRes.body.data._id;
  moduleId = courseRes.body.data.modules[0]._id;

  const quizRes = await request(app)
    .post('/api/v1/quizzes')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      courseId,
      moduleId,
      difficulty: 'medium',
      questions: MOCK_QUESTIONS,
    });

  quizId = quizRes.body.data.quiz._id;

  await request(app)
    .patch(`/api/v1/courses/${courseId}/publish`)
    .set('Authorization', `Bearer ${instructorToken}`);

  await request(app)
    .post(`/api/v1/courses/${courseId}/enroll`)
    .set('Authorization', `Bearer ${studentToken}`);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Student Learning Flow', () => {
  it('student can get quiz for taking without correct answers', async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes/${quizId}/take`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.quiz.questions[0].correctOption).toBeUndefined();
    expect(res.body.data.quiz.questions[0].explanation).toBeUndefined();
  });

  it('student can submit quiz and pass', async () => {
    const answers = MOCK_QUESTIONS.map((_, i) => ({
      questionId: i,
      selectedOption: 0,
    }));

    const res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.score).toBe(100);
    expect(res.body.data.passed).toBe(true);
    expect(res.body.data.moduleCompleted).toBe(true);
    expect(res.body.data.results).toHaveLength(5);
  });

  it('student can view attempt results', async () => {
    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: MOCK_QUESTIONS.map((_, i) => ({ questionId: i, selectedOption: 0 })),
      });

    const attemptId = submitRes.body.data.attemptId;

    const res = await request(app)
      .get(`/api/v1/quizzes/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.score).toBe(100);
    expect(res.body.data.results[0].explanation).toBeDefined();
  });

  it('student cannot view another students attempt', async () => {
    const other = await registerAndLogin({
      name: 'Other Student',
      email: 'other.student@test.com',
      password: 'Password1',
      role: 'student',
    });

    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: MOCK_QUESTIONS.map((_, i) => ({ questionId: i, selectedOption: 0 })),
      });

    const res = await request(app)
      .get(`/api/v1/quizzes/attempts/${submitRes.body.data.attemptId}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.statusCode).toBe(403);
  });

  it('GET /api/v1/dashboard/student returns stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/student')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.enrolledCourses).toBeGreaterThanOrEqual(1);
    expect(res.body.data.completedModules).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/student/courses returns enrolled courses with progress', async () => {
    const res = await request(app)
      .get('/api/v1/student/courses')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.courses[0].progress).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/v1/student/courses/:courseId/learn returns learning path', async () => {
    const res = await request(app)
      .get(`/api/v1/student/courses/${courseId}/learn`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.modules).toHaveLength(2);
    expect(res.body.data.modules[0].status).toBe('completed');
    expect(res.body.data.modules[1].status).toBe('current');
  });
});
