const analyticsService = require('../analytics/analytics.service');
const analyticsRepository = require('../analytics/analytics.repository');
const { AppError } = require('../../common/errors');
const { ROLES } = require('../../common/constants');
const logger = require('../../common/logger');

const generateExport = async (requestingUser, { format = 'json', type = 'courses' }) => {
  if (!['json', 'csv'].includes(format)) {
    throw new AppError('Format must be json or csv', 400);
  }

  let data;
  let filename;

  if (requestingUser.role === ROLES.INSTRUCTOR || requestingUser.role === ROLES.ADMIN) {
    if (type === 'courses') {
      const instructorId =
        requestingUser.role === ROLES.ADMIN ? null : requestingUser.userId;
      data = await analyticsRepository.getCoursePerformance(instructorId);
      filename = 'courses-report';
    } else if (type === 'quizzes') {
      data = await analyticsRepository.getQuizStats(
        requestingUser.role === ROLES.ADMIN ? null : requestingUser.userId
      );
      filename = 'quiz-stats-report';
    } else {
      throw new AppError('Invalid report type', 400);
    }
  } else {
    throw new AppError('Only instructors and admins can export reports', 403);
  }

  logger.info(`Report export: user=${requestingUser.userId}, format=${format}, type=${type}`);

  if (format === 'csv') {
    const csv = _toCsv(Array.isArray(data) ? data : [data]);
    return { content: csv, contentType: 'text/csv', filename: `${filename}.csv` };
  }

  return {
    content: JSON.stringify(data, null, 2),
    contentType: 'application/json',
    filename: `${filename}.json`,
  };
};

const _toCsv = (rows) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ];
  return lines.join('\n');
};

module.exports = { generateExport };
