const { Router } = require('express');
const authMiddleware = require('../auth/auth.middleware');
const roleMiddleware = require('../auth/role.middleware');
const { exportReport } = require('./report.controller');

const router = Router();

router.get(
  '/export',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  exportReport
);

module.exports = router;
