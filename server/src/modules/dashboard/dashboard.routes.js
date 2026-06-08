const { Router } = require('express');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');
const {
  getStudentDashboard,
  getInstructorDashboard,
  getInstructorCourses,
  getInstructorQuizzes,
  getAdminDashboard,
} = require('./dashboard.controller');

const router = Router();

router.get('/student', authMiddleware, roleMiddleware('student', 'admin'), getStudentDashboard);
router.get(
  '/instructor/courses',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorCourses
);
router.get(
  '/instructor/quizzes',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorQuizzes
);
router.get(
  '/instructor',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorDashboard
);
router.get('/admin', authMiddleware, roleMiddleware('admin'), getAdminDashboard);

module.exports = router;
