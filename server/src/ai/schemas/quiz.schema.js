const { z } = require('zod');
const { QUIZ } = require('../../common/constants');

const aiQuestionSchema = z
  .object({
    text: z.string().trim().min(5, 'Question text is required'),
    options: z
      .array(z.string().trim().min(1))
      .length(QUIZ.OPTIONS_PER_QUESTION, `Each question must have exactly ${QUIZ.OPTIONS_PER_QUESTION} options`),
    correctOption: z.number().int().min(0).max(3).optional(),
    correct: z.number().int().min(0).max(3).optional(),
    explanation: z.string().trim().min(5, 'Explanation is required'),
  })
  .transform((q) => ({
    text: q.text,
    options: q.options,
    correctOption: q.correctOption ?? q.correct,
    explanation: q.explanation,
  }))
  .refine((q) => q.correctOption !== undefined, {
    message: 'Correct answer index is required',
    path: ['correctOption'],
  });

const aiQuizSchema = z
  .array(aiQuestionSchema)
  .length(QUIZ.AI_GENERATED_COUNT, `Generated quiz must have exactly ${QUIZ.AI_GENERATED_COUNT} questions`);

/**
 * @param {unknown} data
 * @returns {{ success: true, data: object[] } | { success: false, error: string }}
 */
const validateAiQuiz = (data) => {
  const result = aiQuizSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `AI response validation failed: ${messages}` };
  }
  return { success: true, data: result.data };
};

module.exports = { aiQuizSchema, validateAiQuiz };
