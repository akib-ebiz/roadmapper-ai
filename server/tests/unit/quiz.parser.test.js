const { parseQuizResponse } = require('../../src/ai/parsers/quiz.parser');

const SAMPLE = [
  {
    text: 'What is useState?',
    options: ['Hook', 'Class', 'Library', 'Framework'],
    correctOption: 0,
    explanation: 'useState is a React Hook',
  },
];

describe('AI Quiz Parser', () => {
  it('parses clean JSON array', () => {
    const result = parseQuizResponse(JSON.stringify(SAMPLE));
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('What is useState?');
  });

  it('strips markdown code block wrapper', () => {
    const input = `\`\`\`json\n${JSON.stringify(SAMPLE)}\n\`\`\``;
    const result = parseQuizResponse(input);
    expect(result).toHaveLength(1);
  });

  it('throws on empty input', () => {
    expect(() => parseQuizResponse('')).toThrow('empty or invalid');
  });

  it('throws when no JSON array found', () => {
    expect(() => parseQuizResponse('plain text only')).toThrow('valid JSON array');
  });

  it('throws on malformed JSON', () => {
    expect(() => parseQuizResponse('[ invalid json ]')).toThrow('JSON parse failed');
  });
});
