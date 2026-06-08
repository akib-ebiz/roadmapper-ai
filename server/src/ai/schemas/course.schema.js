const { z } = require('zod');

/**
 * Zod schema to validate AI-generated course structure.
 * Per security guidelines: all AI output is untrusted and must be validated.
 */
const aiModuleSchema = z.object({
  title: z.string().trim().min(1, 'Module title is required').max(200),
  objectives: z
    .array(z.string().trim().min(1))
    .min(1, 'Each module needs at least 1 objective'),
  videoSuggestion: z.string().trim().optional().default(''),
});

const aiCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Generated course title must be at least 5 characters')
    .max(200),
  description: z
    .string()
    .trim()
    .min(10, 'Generated course description must be at least 10 characters')
    .max(5000),
  modules: z
    .array(aiModuleSchema)
    .min(4, 'Generated course must have at least 4 modules')
    .max(8, 'Generated course must have at most 8 modules'),
});

/**
 * Validate parsed AI course output against schema
 * @param {object} data - parsed JSON from AI
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
const validateAiCourse = (data) => {
  const result = aiCourseSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `AI response validation failed: ${messages}` };
  }
  return { success: true, data: result.data };
};

module.exports = { aiCourseSchema, validateAiCourse };
