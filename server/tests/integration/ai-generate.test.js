/**
 * Integration tests for POST /api/v1/courses/generate
 * Per AI testing rules: mock the Gemini provider — never use live API.
 */

jest.mock('../../src/ai/providers/gemini.provider');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const geminiProvider = require('../../src/ai/providers/gemini.provider');

const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

const MOCK_AI_RESPONSE = JSON.stringify({
  title: 'Complete React Course',
  description: 'Master React from zero to hero with hands-on projects and real examples.',
  modules: [
    { title: 'React Basics', objectives: ['JSX', 'Components'], videoSuggestion: 'React basics' },
    { title: 'State Management', objectives: ['useState', 'useReducer'], videoSuggestion: 'React state' },
    { title: 'Side Effects', objectives: ['useEffect', 'Cleanup'], videoSuggestion: 'useEffect' },
    { title: 'Advanced Patterns', objectives: ['Context', 'Custom hooks'], videoSuggestion: 'React patterns' },
  ],
});

let instructorToken, studentToken;

const registerAndLogin = async (userData) => {
  await request(app).post('/api/v1/auth/register').send(userData);
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: userData.email, password: userData.password });
  return res.body.data.token;
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }

  instructorToken = await registerAndLogin({
    name: 'AI Instructor',
    email: 'ai.instructor@test.com',
    password: 'Password1',
    role: 'instructor',
  });

  studentToken = await registerAndLogin({
    name: 'AI Student',
    email: 'ai.student@test.com',
    password: 'Password1',
    role: 'student',
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();
  geminiProvider.generateCourse.mockResolvedValue(MOCK_AI_RESPONSE);
});

const validPayload = {
  topic: 'React',
  targetAudience: 'Frontend Developers',
  difficulty: 'beginner',
  durationWeeks: 6,
};

describe('POST /api/v1/courses/generate', () => {
  it('instructor can generate a course', async () => {
    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Complete React Course');
    expect(res.body.data.modules).toHaveLength(4);
  });

  it('student cannot generate a course', async () => {
    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(403);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).post('/api/v1/courses/generate').send(validPayload);
    expect(res.statusCode).toBe(401);
  });

  it('fails validation with missing topic', async () => {
    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ ...validPayload, topic: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('fails validation with invalid difficulty', async () => {
    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ ...validPayload, difficulty: 'expert' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 503 when Gemini provider fails', async () => {
    geminiProvider.generateCourse.mockRejectedValue(new Error('Provider down'));

    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(503);
    expect(res.body.success).toBe(false);
  });

  it('returns 502 when AI returns invalid JSON', async () => {
    geminiProvider.generateCourse.mockResolvedValue('not json at all');

    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(502);
  });

  it('returns 502 when AI response fails schema validation', async () => {
    geminiProvider.generateCourse.mockResolvedValue(
      JSON.stringify({ title: 'Short', description: 'A short course', modules: [{ title: 'M1', objectives: ['o'] }] })
    );

    const res = await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(502);
  });

  it('generated content is NOT saved to DB automatically', async () => {
    await request(app)
      .post('/api/v1/courses/generate')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validPayload);

    // Verify no course was created
    const Course = mongoose.model('Course');
    const count = await Course.countDocuments({ title: 'Complete React Course' });
    expect(count).toBe(0);
  });
});
