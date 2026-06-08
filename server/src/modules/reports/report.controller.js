const reportService = require('./report.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const exportReport = asyncHandler(async (req, res) => {
  const { format = 'json', type = 'courses' } = req.query;
  const result = await reportService.generateExport(req.user, { format, type });

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.send(result.content);
});

module.exports = { exportReport };
