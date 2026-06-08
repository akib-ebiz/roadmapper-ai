const {
  suspendUserSchema,
  activateUserSchema,
  deleteUserSchema,
  updateRoleSchema,
  userFiltersSchema,
  auditLogFiltersSchema,
} = require('../../src/modules/admin/admin.validator');
const { ROLES } = require('../../src/common/constants');

describe('Admin Validator Schemas', () => {
  describe('suspendUserSchema', () => {
    it('should validate valid suspend user data', () => {
      const data = { reason: 'User violated terms of service' };
      const result = suspendUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing reason', () => {
      const data = {};
      const result = suspendUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject reason shorter than 10 characters', () => {
      const data = { reason: 'Short' };
      const result = suspendUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject reason longer than 500 characters', () => {
      const data = { reason: 'a'.repeat(501) };
      const result = suspendUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('activateUserSchema', () => {
    it('should validate valid activate user data with reason', () => {
      const data = { reason: 'Account reinstated after review' };
      const result = activateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate activate user data without reason (optional)', () => {
      const data = {};
      const result = activateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteUserSchema', () => {
    it('should validate valid delete user data', () => {
      const data = { reason: 'User requested account deletion' };
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing reason', () => {
      const data = {};
      const result = deleteUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateRoleSchema', () => {
    it('should validate valid role update data', () => {
      const data = { role: ROLES.INSTRUCTOR, reason: 'Promoted to instructor' };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const data = { role: 'invalid_role', reason: 'Test' };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing reason', () => {
      const data = { role: ROLES.INSTRUCTOR };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('userFiltersSchema', () => {
    it('should validate valid user filters', () => {
      const data = {
        role: ROLES.STUDENT,
        status: 'active',
        search: 'john',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const result = userFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should apply default values for pagination', () => {
      const data = {};
      const result = userFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
    });

    it('should reject invalid status', () => {
      const data = { status: 'invalid' };
      const result = userFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject limit greater than 100', () => {
      const data = { limit: 101 };
      const result = userFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('auditLogFiltersSchema', () => {
    it('should validate valid audit log filters', () => {
      const data = {
        action: 'SUSPEND_USER',
        userId: '507f1f77bcf86cd799439011',
        adminId: '507f1f77bcf86cd799439012',
        page: 1,
        limit: 20,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should apply default values for pagination', () => {
      const data = {};
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });
  });
});
