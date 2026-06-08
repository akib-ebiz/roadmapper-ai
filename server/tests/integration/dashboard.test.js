const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

let instructorToken;
let studentToken;
let adminToken;

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
    name: 'Dash Instructor',
    email: 'dash.instructor@test.com',
    password: 'Password1',
    role: 'instructor',
  });
  instructorToken = instructor.token;

  const student = await registerAndLogin({
    name: 'Dash Student',
    email: 'dash.student@test.com',
    password: 'Password1',
    role: 'student',
  });
  studentToken = student.token;

  const admin = await registerAndLogin({
    name: 'Dash Admin',
    email: 'dash.admin@test.com',
    password: 'Password1',
    role: 'admin',
  });
  adminToken = admin.token;

  await request(app)
    .post('/api/v1/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      title: 'Analytics Test Course',
      description: 'Course for dashboard analytics testing purposes',
      topic: 'Analytics',
      difficulty: 'beginner',
      durationWeeks: 4,
      modules: [{ title: 'Mod 1', objectives: ['Learn'], videoUrl: '' }],
    });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Dashboard Analytics APIs', () => {
  it('GET /dashboard/instructor returns instructor stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/instructor')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalCourses).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty('averageCompletionRate');
    expect(res.body.data).toHaveProperty('quizStats');
  });

  it('student cannot access instructor dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/instructor')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('GET /dashboard/instructor/courses returns course analytics', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/instructor/courses')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.courses)).toBe(true);
  });

  it('GET /dashboard/instructor/quizzes returns quiz stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/instructor/quizzes')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('totalAttempts');
    expect(res.body.data).toHaveProperty('passRate');
  });

  it('GET /dashboard/admin returns platform stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
    expect(res.body.data).toHaveProperty('growth');
    expect(res.body.data).toHaveProperty('aiUsage');
  });

  it('instructor cannot access admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('GET /reports/export returns JSON for instructor', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?format=json&type=courses')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('student cannot export reports', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
  });
});
