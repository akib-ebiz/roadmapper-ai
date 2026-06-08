const { parseAiResponse } = require('../../src/ai/parsers/course.parser');

describe('AI Course Parser', () => {
  it('parses clean JSON response', () => {
    const input = JSON.stringify({ title: 'Test', description: 'Desc', modules: [] });
    const result = parseAiResponse(input);
    expect(result.title).toBe('Test');
  });

  it('strips markdown code block wrapper', () => {
    const input = '```json\n{"title":"React","description":"Learn","modules":[]}\n```';
    const result = parseAiResponse(input);
    expect(result.title).toBe('React');
  });

  it('strips code block without language tag', () => {
    const input = '```\n{"title":"Node","description":"Learn Node","modules":[]}\n```';
    const result = parseAiResponse(input);
    expect(result.title).toBe('Node');
  });

  it('strips leading text before JSON', () => {
    const input = 'Here is the course:\n{"title":"Python","description":"Learn Python","modules":[]}';
    const result = parseAiResponse(input);
    expect(result.title).toBe('Python');
  });

  it('throws on empty input', () => {
    expect(() => parseAiResponse('')).toThrow('empty or invalid');
  });

  it('throws on null input', () => {
    expect(() => parseAiResponse(null)).toThrow();
  });

  it('throws when no JSON object found', () => {
    expect(() => parseAiResponse('This is just plain text with no JSON')).toThrow(
      'does not contain valid JSON'
    );
  });

  it('throws on malformed JSON', () => {
    expect(() => parseAiResponse('{ invalid json here }')).toThrow('JSON parse failed');
  });
});
