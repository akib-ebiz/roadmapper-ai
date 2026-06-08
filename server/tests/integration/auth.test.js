const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');

// Use dedicated test database
const TEST_DB = 'mongodb://127.0.0.1:27017/roadmapper_test';

beforeAll(async () => {
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  // Clean users collection between tests
  const collections = mongoose.connection.collections;
  if (collections.users) {
    await collections.users.deleteMany({});
  }
});

describe('POST /api/v1/auth/register', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password1',
    role: 'student',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/registered/i);
  });

  it('should block duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail with missing name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, name: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with weak password (no uppercase)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, password: 'password1' });
    expect(res.statusCode).toBe(400);
  });

  it('should fail with invalid role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, role: 'superuser' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'Password1',
      role: 'student',
    });
  });

  it('should login successfully and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('login@example.com');
    expect(res.body.data.user.role).toBe('student');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(401);
  });

  it('should not expose password in response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'Password1' });
    expect(res.body.data.user.password).toBeUndefined();
  });
});

describe('GET /api/v1/auth/me', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Me Test',
      email: 'me@example.com',
      password: 'Password1',
      role: 'instructor',
    });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'me@example.com', password: 'Password1' });
    token = loginRes.body.data.token;
  });

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('me@example.com');
    expect(res.body.data.role).toBe('instructor');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
  });
});

describe('Role Middleware', () => {
  it('should allow admin access to admin routes', async () => {
    // Register admin user
    await request(app).post('/api/v1/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1',
      role: 'admin',
    });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'Password1' });
    const adminToken = loginRes.body.data.token;

    // /me should work for admin
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.role).toBe('admin');
  });
});
