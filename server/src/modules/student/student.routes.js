const { Router } = require('express');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');
const { getStudentCourses, getLearningPath } = require('./student.controller');

const router = Router();

router.get('/courses', authMiddleware, roleMiddleware('student', 'admin'), getStudentCourses);
router.get(
  '/courses/:courseId/learn',
  authMiddleware,
  roleMiddleware('student', 'admin'),
  getLearningPath
);

module.exports = router;
