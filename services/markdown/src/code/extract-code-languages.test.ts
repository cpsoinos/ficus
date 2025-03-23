import { describe, it, expect } from 'vitest';

import { extractCodeLanguages } from './extract-code-languages';

describe('extractCodeLanguages', () => {
	it('extracts language from a single code block', () => {
		const markdown = '```javascript\nconst x = 1;\n```';
		expect(extractCodeLanguages(markdown)).toEqual(['javascript']);
	});

	it('extracts languages from multiple code blocks', () => {
		const markdown = '```typescript\nlet x: number;\n```\n\n```python\nprint("hello")\n```';
		expect(extractCodeLanguages(markdown)).toEqual(['typescript', 'python']);
	});

	it('ignores code blocks without language specification', () => {
		const markdown = '```\nplain text\n```';
		expect(extractCodeLanguages(markdown)).toEqual([]);
	});

	it('returns empty array for markdown without code blocks', () => {
		const markdown = '# Header\nJust some text';
		expect(extractCodeLanguages(markdown)).toEqual([]);
	});
});
