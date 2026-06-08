const { hashPassword, comparePassword } = require('../../src/modules/auth/password.service');

describe('Password Service', () => {
  const plainPassword = 'TestPassword1';

  it('should hash a password', async () => {
    const hash = await hashPassword(plainPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plainPassword);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('should produce different hashes for same password', async () => {
    const hash1 = await hashPassword(plainPassword);
    const hash2 = await hashPassword(plainPassword);
    expect(hash1).not.toBe(hash2);
  });

  it('should return true when comparing correct password', async () => {
    const hash = await hashPassword(plainPassword);
    const result = await comparePassword(plainPassword, hash);
    expect(result).toBe(true);
  });

  it('should return false when comparing wrong password', async () => {
    const hash = await hashPassword(plainPassword);
    const result = await comparePassword('WrongPassword1', hash);
    expect(result).toBe(false);
  });
});
