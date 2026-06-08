// User roles
const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

// Course status
const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Course difficulty
const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Quiz
const QUIZ_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const QUIZ = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  AI_GENERATED_COUNT: 5,
  OPTIONS_PER_QUESTION: 4,
  PASS_THRESHOLD: 70,
};

module.exports = {
  ROLES,
  COURSE_STATUS,
  DIFFICULTY,
  PAGINATION,
  QUIZ_DIFFICULTY,
  QUIZ,
};
