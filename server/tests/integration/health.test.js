const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/health', () => {
  it('should return 200 with success true', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server running');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /api/v1/unknown-route', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
