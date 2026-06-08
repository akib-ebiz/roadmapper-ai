const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { apiLimiter } = require('./common/middleware/rateLimiter');
const errorHandler = require('./common/middleware/errorHandler');
const notFound = require('./common/middleware/notFound');
const logger = require('./common/logger');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Request Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ─────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));

// ─── 404 Handler ──────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
