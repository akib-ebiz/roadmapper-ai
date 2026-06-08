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
  // Clean collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Admin User Management API', () => {
  let adminToken;
  let adminId;
  let studentId;

  beforeEach(async () => {
    // Create admin user
    await request(app).post('/api/v1/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1',
      role: 'admin',
    });
    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'Password1',
    });
    adminToken = adminLoginRes.body.token;
    adminId = adminLoginRes.body.user.id;

    // Create student user
    const studentRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Student User',
      email: 'student@example.com',
      password: 'Password1',
      role: 'student',
    });
    studentId = studentRes.body.user.id;
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users with admin token', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter users by status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.statusCode).toBe(401);
    });

    it('should return 403 with non-admin token', async () => {
      const studentLoginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'student@example.com',
        password: 'Password1',
      });
      const studentToken = studentLoginRes.body.token;

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('should get user details by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(studentId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/v1/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/suspend', () => {
    it('should suspend user account', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Account violation' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should not allow self-suspension', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/activate', () => {
    it('should activate suspended user account', async () => {
      // First suspend the user
      await request(app)
        .patch(`/api/v1/admin/users/${studentId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Account violation' });

      // Then activate
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Account reviewed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(true);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should update user role', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'instructor', reason: 'Promoted to instructor' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('instructor');
    });

    it('should not allow self-role change', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'student', reason: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete user account', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'User requested deletion' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not allow self-deletion', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/audit-logs', () => {
    it('should get audit logs', async () => {
      // Perform an action to create an audit log
      await request(app)
        .patch(`/api/v1/admin/users/${studentId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Account violation' });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toBeDefined();
    });

    it('should filter audit logs by action', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs?action=SUSPEND_USER')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
