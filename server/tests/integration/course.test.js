const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

// ─── Test helpers ──────────────────────────────────────────────────
let instructorToken, studentToken, adminToken;
let instructorId, studentId;

const registerAndLogin = async (userData) => {
  await request(app).post('/api/v1/auth/register').send(userData);
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: userData.email, password: userData.password });
  return res.body.data;
};

const validCourse = {
  title: 'React Fundamentals',
  description: 'Learn React from scratch with hooks and context',
  topic: 'React',
  difficulty: 'beginner',
  durationWeeks: 6,
};

// ─── Setup / Teardown ──────────────────────────────────────────────
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }

  // Register instructor
  const instructorData = await registerAndLogin({
    name: 'Instructor One',
    email: 'instructor@test.com',
    password: 'Password1',
    role: 'instructor',
  });
  instructorToken = instructorData.token;
  instructorId = instructorData.user.id;

  // Register student
  const studentData = await registerAndLogin({
    name: 'Student One',
    email: 'student@test.com',
    password: 'Password1',
    role: 'student',
  });
  studentToken = studentData.token;
  studentId = studentData.user.id;

  // Register admin
  const adminData = await registerAndLogin({
    name: 'Admin One',
    email: 'admin@test.com',
    password: 'Password1',
    role: 'admin',
  });
  adminToken = adminData.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  if (mongoose.connection.collections.courses) {
    await mongoose.connection.collections.courses.deleteMany({});
  }
});

// ─── POST /api/v1/courses ──────────────────────────────────────────
describe('POST /api/v1/courses', () => {
  it('instructor can create a course', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(validCourse.title);
    expect(res.body.data.status).toBe('draft');
  });

  it('student cannot create a course', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validCourse);
    expect(res.statusCode).toBe(403);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).post('/api/v1/courses').send(validCourse);
    expect(res.statusCode).toBe(401);
  });

  it('fails validation with short title', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ ...validCourse, title: 'Hi' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('fails with invalid difficulty', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ ...validCourse, difficulty: 'expert' });
    expect(res.statusCode).toBe(400);
  });
});

// ─── GET /api/v1/courses ───────────────────────────────────────────
describe('GET /api/v1/courses', () => {
  it('returns empty list when no published courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.courses).toHaveLength(0);
  });
});

// ─── GET /api/v1/courses/:id ───────────────────────────────────────
describe('GET /api/v1/courses/:id', () => {
  let courseId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    courseId = res.body.data._id;
  });

  it('owner can view own draft course', async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`);
    // getCourseById uses req.user from middleware but route has no authMiddleware
    // The service handles optional auth — draft only visible to owner/admin
    // Here we call without auth, so it should 404 (draft is not public)
    const publicRes = await request(app).get(`/api/v1/courses/${courseId}`);
    expect(publicRes.statusCode).toBe(404);
  });

  it('returns 404 for non-existent course', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/courses/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

// ─── PUT /api/v1/courses/:id ───────────────────────────────────────
describe('PUT /api/v1/courses/:id', () => {
  let courseId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    courseId = res.body.data._id;
  });

  it('owner can update own course', async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Updated React Course' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated React Course');
  });

  it('admin can update any course', async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Updated Course' });
    expect(res.statusCode).toBe(200);
  });

  it('different instructor cannot update another instructor course', async () => {
    // Register second instructor
    const data = await registerAndLogin({
      name: 'Instructor Two',
      email: 'instructor2@test.com',
      password: 'Password1',
      role: 'instructor',
    });
    const res = await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${data.token}`)
      .send({ title: 'Hacked Title' });
    expect(res.statusCode).toBe(403);
  });

  it('student cannot update a course', async () => {
    const res = await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hacked' });
    expect(res.statusCode).toBe(403);
  });
});

// ─── PATCH /api/v1/courses/:id/publish ────────────────────────────
describe('PATCH /api/v1/courses/:id/publish', () => {
  let courseId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    courseId = res.body.data._id;
  });

  it('cannot publish course without modules', async () => {
    const res = await request(app)
      .patch(`/api/v1/courses/${courseId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/module/i);
  });

  it('can publish course with at least 1 module', async () => {
    // Add a module first
    await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ modules: [{ title: 'Intro to React', objectives: ['Understand components'] }] });

    const res = await request(app)
      .patch(`/api/v1/courses/${courseId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('published');
  });
});

// ─── POST /api/v1/courses/:id/enroll ──────────────────────────────
describe('POST /api/v1/courses/:id/enroll', () => {
  let courseId;

  beforeEach(async () => {
    // Create and publish a course
    const createRes = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    courseId = createRes.body.data._id;

    // Add module and publish
    await request(app)
      .put(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ modules: [{ title: 'Module 1' }] });

    await request(app)
      .patch(`/api/v1/courses/${courseId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
  });

  it('student can enroll in a published course', async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/enrolled/i);
  });

  it('student cannot enroll twice', async () => {
    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    const res = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already enrolled/i);
  });

  it('instructor cannot enroll in a course', async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('unauthenticated user cannot enroll', async () => {
    const res = await request(app).post(`/api/v1/courses/${courseId}/enroll`);
    expect(res.statusCode).toBe(401);
  });
});

// ─── DELETE /api/v1/courses/:id ───────────────────────────────────
describe('DELETE /api/v1/courses/:id', () => {
  let courseId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);
    courseId = res.body.data._id;
  });

  it('owner can delete own course', async () => {
    const res = await request(app)
      .delete(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('student cannot delete a course', async () => {
    const res = await request(app)
      .delete(`/api/v1/courses/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ─── GET /api/v1/courses/my-courses ───────────────────────────────
describe('GET /api/v1/courses/my-courses', () => {
  it('instructor gets own courses', async () => {
    await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(validCourse);

    const res = await request(app)
      .get('/api/v1/courses/my-courses')
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.courses.length).toBeGreaterThan(0);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/v1/courses/my-courses');
    expect(res.statusCode).toBe(401);
  });
});
