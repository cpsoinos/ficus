import { describe, it, expect } from 'vitest';

import { validateThemes, DEFAULT_THEME } from './themes';

describe('validateThemes', () => {
	it('returns valid themes when both light and dark themes are valid', () => {
		const themes = { light: 'github-light', dark: 'github-dark' };
		expect(validateThemes(themes)).toEqual(themes);
	});

	it('returns default themes when input is not an object', () => {
		expect(validateThemes(null)).toEqual({
			light: DEFAULT_THEME,
			dark: DEFAULT_THEME
		});
	});

	it('returns default themes when required properties are missing', () => {
		expect(validateThemes({})).toEqual({
			light: DEFAULT_THEME,
			dark: DEFAULT_THEME
		});
	});

	it('preserves valid light theme and defaults dark theme when dark is invalid', () => {
		const themes = { light: 'github-light', dark: 'invalid-theme' };
		expect(validateThemes(themes)).toEqual({
			light: 'github-light',
			dark: DEFAULT_THEME
		});
	});

	it('preserves valid dark theme and defaults light theme when light is invalid', () => {
		const themes = { light: 'invalid-theme', dark: 'github-dark' };
		expect(validateThemes(themes)).toEqual({
			light: DEFAULT_THEME,
			dark: 'github-dark'
		});
	});

	it('returns default themes when both themes are invalid', () => {
		const themes = { light: 'invalid-light', dark: 'invalid-dark' };
		expect(validateThemes(themes)).toEqual({
			light: DEFAULT_THEME,
			dark: DEFAULT_THEME
		});
	});
});
