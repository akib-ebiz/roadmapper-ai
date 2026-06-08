const { validateAiCourse } = require('../../src/ai/schemas/course.schema');

const validCourse = {
  title: 'React Fundamentals',
  description: 'A complete course on React hooks and patterns for beginners.',
  modules: [
    { title: 'Module 1', objectives: ['Understand JSX', 'Learn components'], videoSuggestion: 'React intro' },
    { title: 'Module 2', objectives: ['Learn useState'], videoSuggestion: 'React hooks' },
    { title: 'Module 3', objectives: ['Learn useEffect'], videoSuggestion: 'useEffect tutorial' },
    { title: 'Module 4', objectives: ['Learn context'], videoSuggestion: 'React context' },
  ],
};

describe('AI Course Validator', () => {
  it('accepts valid course structure', () => {
    const result = validateAiCourse(validCourse);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('React Fundamentals');
  });

  it('rejects course with fewer than 4 modules', () => {
    const result = validateAiCourse({ ...validCourse, modules: validCourse.modules.slice(0, 3) });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/4 modules/);
  });

  it('rejects course with more than 8 modules', () => {
    const manyModules = Array(9).fill({ title: 'M', objectives: ['obj'], videoSuggestion: '' });
    const result = validateAiCourse({ ...validCourse, modules: manyModules });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/8 modules/);
  });

  it('rejects course without title', () => {
    const result = validateAiCourse({ ...validCourse, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects course without description', () => {
    const result = validateAiCourse({ ...validCourse, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects module without title', () => {
    const badModule = { title: '', objectives: ['obj'], videoSuggestion: '' };
    const result = validateAiCourse({ ...validCourse, modules: [badModule, ...validCourse.modules.slice(1)] });
    expect(result.success).toBe(false);
  });

  it('accepts modules without videoSuggestion (optional)', () => {
    const modulesWithoutVideo = validCourse.modules.map(({ title, objectives }) => ({ title, objectives }));
    const result = validateAiCourse({ ...validCourse, modules: modulesWithoutVideo });
    expect(result.success).toBe(true);
  });
});
