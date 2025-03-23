import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Bindings } from '../lib/bindings';

import { loadLanguageData } from './load-languages';

vi.mock('../lib/bindings', () => ({
	Bindings: {
		ASSETS: { fetch: vi.fn() }
	}
}));

describe('loadLanguageData', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should load language data and alias map', async () => {
		const mockAliasMap = { js: 'javascript', py: 'python' };
		const mockLanguage1 = { id: 'javascript', scopeName: 'source.js' };
		const mockLanguage2 = { id: 'python', scopeName: 'source.python' };

		const mockFetch = vi.spyOn(Bindings.ASSETS, 'fetch');
		mockFetch
			.mockResolvedValueOnce({ json: () => Promise.resolve(mockAliasMap) } as Response)
			.mockResolvedValueOnce({ json: () => Promise.resolve(mockLanguage1) } as Response)
			.mockResolvedValueOnce({ json: () => Promise.resolve(mockLanguage2) } as Response);

		const result = await loadLanguageData(['js', 'py']);

		expect(mockFetch).toHaveBeenCalledTimes(3);
		expect(mockFetch).toHaveBeenCalledWith('http://internal/grammars/_aliases.json');
		expect(mockFetch).toHaveBeenCalledWith('http://internal/grammars/javascript.json');
		expect(mockFetch).toHaveBeenCalledWith('http://internal/grammars/python.json');

		expect(result).toEqual({
			languages: [mockLanguage1, mockLanguage2],
			aliasMap: mockAliasMap
		});
	});

	it('should use original language name if no alias exists', async () => {
		const mockAliasMap = { js: 'javascript' };
		const mockLanguage = { id: 'rust', scopeName: 'source.rust' };

		const mockFetch = vi.spyOn(Bindings.ASSETS, 'fetch');
		mockFetch
			.mockResolvedValueOnce({ json: () => Promise.resolve(mockAliasMap) } as unknown as Response)
			.mockResolvedValueOnce({ json: () => Promise.resolve(mockLanguage) } as unknown as Response);

		const result = await loadLanguageData(['rust']);

		expect(mockFetch).toHaveBeenCalledWith('http://internal/grammars/rust.json');
		expect(result.languages).toEqual([mockLanguage]);
	});
});
