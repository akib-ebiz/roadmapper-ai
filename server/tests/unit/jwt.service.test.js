const { generateToken, verifyToken, decodeToken } = require('../../src/modules/auth/jwt.service');

describe('JWT Service', () => {
  const payload = { userId: 'user123', email: 'test@example.com', role: 'student' };

  it('should generate a valid JWT token', () => {
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should verify a valid token and return payload', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  it('should decode token without verification', () => {
    const token = generateToken(payload);
    const decoded = decodeToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });
});
