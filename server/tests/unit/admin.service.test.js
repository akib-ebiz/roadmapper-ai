const adminService = require('../../src/modules/admin/admin.service');
const adminRepository = require('../../src/modules/admin/admin.repository');
const auditService = require('../../src/modules/admin/audit.service');

// Mock dependencies
jest.mock('../../src/modules/admin/admin.repository');
jest.mock('../../src/modules/admin/audit.service');
jest.mock('../../src/common/logger');

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserList', () => {
    it('should return users with pagination', async () => {
      const mockResult = {
        users: [{ _id: '1', name: 'John Doe', email: 'john@example.com' }],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      };
      adminRepository.getAllUsers.mockResolvedValue(mockResult);

      const result = await adminService.getUserList({}, {});

      expect(result).toEqual(mockResult);
      expect(adminRepository.getAllUsers).toHaveBeenCalledWith({}, {});
    });
  });

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      const result = await adminService.getUserDetails('1');

      expect(result).toEqual(mockUser);
      expect(adminRepository.getUserById).toHaveBeenCalledWith('1');
    });

    it('should throw error if user not found', async () => {
      adminRepository.getUserById.mockResolvedValue(null);

      await expect(adminService.getUserDetails('1')).rejects.toThrow('User not found');
    });
  });

  describe('suspendUserAccount', () => {
    it('should suspend user account successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: true };
      const mockUpdatedUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: false };
      adminRepository.getUserById.mockResolvedValue(mockUser);
      adminRepository.suspendUser.mockResolvedValue(mockUpdatedUser);
      auditService.logAction.mockResolvedValue({});

      const result = await adminService.suspendUserAccount('1', 'admin123', 'Violation of terms', '127.0.0.1');

      expect(result).toEqual(mockUpdatedUser);
      expect(adminRepository.getUserById).toHaveBeenCalledWith('1');
      expect(adminRepository.suspendUser).toHaveBeenCalledWith('1');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'admin123',
        'SUSPEND_USER',
        '1',
        'USER',
        'Violation of terms',
        { previousStatus: true, newStatus: false },
        '127.0.0.1'
      );
    });

    it('should throw error if user not found', async () => {
      adminRepository.getUserById.mockResolvedValue(null);

      await expect(adminService.suspendUserAccount('1', 'admin123', 'Reason', '127.0.0.1')).rejects.toThrow('User not found');
    });

    it('should throw error if trying to suspend own account', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: true };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.suspendUserAccount('1', '1', 'Reason', '127.0.0.1')).rejects.toThrow('Cannot suspend your own account');
    });

    it('should throw error if user already suspended', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: false };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.suspendUserAccount('1', 'admin123', 'Reason', '127.0.0.1')).rejects.toThrow('User is already suspended');
    });
  });

  describe('activateUserAccount', () => {
    it('should activate user account successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: false };
      const mockUpdatedUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: true };
      adminRepository.getUserById.mockResolvedValue(mockUser);
      adminRepository.activateUser.mockResolvedValue(mockUpdatedUser);
      auditService.logAction.mockResolvedValue({});

      const result = await adminService.activateUserAccount('1', 'admin123', 'Account reviewed', '127.0.0.1');

      expect(result).toEqual(mockUpdatedUser);
      expect(adminRepository.getUserById).toHaveBeenCalledWith('1');
      expect(adminRepository.activateUser).toHaveBeenCalledWith('1');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'admin123',
        'ACTIVATE_USER',
        '1',
        'USER',
        'Account reviewed',
        { previousStatus: false, newStatus: true },
        '127.0.0.1'
      );
    });

    it('should throw error if user already active', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', isActive: true };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.activateUserAccount('1', 'admin123', 'Reason', '127.0.0.1')).rejects.toThrow('User is already active');
    });
  });

  describe('deleteUserAccount', () => {
    it('should delete user account successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      adminRepository.getUserById.mockResolvedValue(mockUser);
      adminRepository.deleteUser.mockResolvedValue(mockUser);
      auditService.logAction.mockResolvedValue({});

      const result = await adminService.deleteUserAccount('1', 'admin123', 'User requested deletion', '127.0.0.1');

      expect(result).toEqual(mockUser);
      expect(adminRepository.getUserById).toHaveBeenCalledWith('1');
      expect(adminRepository.deleteUser).toHaveBeenCalledWith('1');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'admin123',
        'DELETE_USER',
        '1',
        'USER',
        'User requested deletion',
        { userEmail: 'john@example.com', userRole: mockUser.role },
        '127.0.0.1'
      );
    });

    it('should throw error if trying to delete own account', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.deleteUserAccount('1', '1', 'Reason', '127.0.0.1')).rejects.toThrow('Cannot delete your own account');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'student' };
      const mockUpdatedUser = { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'instructor' };
      adminRepository.getUserById.mockResolvedValue(mockUser);
      adminRepository.updateUserRole.mockResolvedValue(mockUpdatedUser);
      auditService.logAction.mockResolvedValue({});

      const result = await adminService.updateUserRole('1', 'instructor', 'admin123', 'Promoted to instructor', '127.0.0.1');

      expect(result).toEqual(mockUpdatedUser);
      expect(adminRepository.getUserById).toHaveBeenCalledWith('1');
      expect(adminRepository.updateUserRole).toHaveBeenCalledWith('1', 'instructor');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'admin123',
        'UPDATE_ROLE',
        '1',
        'USER',
        'Promoted to instructor',
        { previousRole: 'student', newRole: 'instructor' },
        '127.0.0.1'
      );
    });

    it('should throw error if trying to change own role', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'student' };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.updateUserRole('1', 'instructor', '1', 'Reason', '127.0.0.1')).rejects.toThrow('Cannot change your own role');
    });

    it('should throw error if role is the same', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'instructor' };
      adminRepository.getUserById.mockResolvedValue(mockUser);

      await expect(adminService.updateUserRole('1', 'instructor', 'admin123', 'Reason', '127.0.0.1')).rejects.toThrow('User already has this role');
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const mockUsers = [{ _id: '1', name: 'John Doe', email: 'john@example.com' }];
      adminRepository.searchUsers.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers('john', {});

      expect(result).toEqual(mockUsers);
      expect(adminRepository.searchUsers).toHaveBeenCalledWith('john', {});
    });
  });
});
