import { DEFAULT_HIGHLIGHTER_THEME } from '@ficus/common/markdown/constants';
import { themeNames } from '@shikijs/themes';
import { z } from 'zod';

import { Bindings } from '../lib/bindings';

import type { ThemeRegistration } from 'shiki/core';

// Define the theme schema using `z.enum`
const themeSchema = z.enum(themeNames as [string, ...string[]]);

export type ThemeName = z.infer<typeof themeSchema>;

// Function to validate theme with a fallback to the default theme
export const validateTheme = (
	theme: unknown,
	fallback: ThemeName = DEFAULT_HIGHLIGHTER_THEME
): ThemeName => {
	const result = themeSchema.safeParse(theme);
	return result.success ? result.data : fallback;
};

/**
 * Validates and processes theme settings for light and dark modes
 *
 * @param themes - The theme configuration object to validate
 * @returns An object containing validated light and dark theme names
 *
 * @remarks
 * This function performs the following:
 * - Validates the input against a schema requiring both light and dark theme names
 * - If validation fails with non-enum errors, returns default themes for both modes
 * - For invalid enum values, attempts to preserve valid theme while defaulting invalid ones
 * - Returns the validated theme configuration if all validations pass
 *
 * @example
 * ```typescript
 * const themes = { light: 'github', dark: 'dracula' };
 * const validatedThemes = validateThemes(themes);
 * ```
 */
export const validateThemes = (themes: unknown): { light: ThemeName; dark: ThemeName } => {
	const result = z
		.object({
			light: themeSchema,
			dark: themeSchema
		})
		.safeParse(themes);
	if (!result.success) {
		const issues = result.error.issues;
		if (issues[0].code !== 'invalid_enum_value') {
			return { light: DEFAULT_HIGHLIGHTER_THEME, dark: DEFAULT_HIGHLIGHTER_THEME };
		}
		const light = validateTheme((themes as { light: string; dark: string }).light);
		const dark = validateTheme((themes as { light: string; dark: string }).dark);

		return { light, dark };
	}
	return result.data;
};

export type HighlighterThemeOptions =
	| {
			theme?: ThemeName;
			themes?: never;
	  }
	| {
			theme?: never;
			themes?: { light: ThemeName; dark: ThemeName };
	  };

export async function loadTheme(themeName: ThemeName): Promise<ThemeRegistration> {
	const rawTheme = await Bindings.ASSETS.fetch(`http://internal/themes/${themeName}.json`);
	const theme = await rawTheme.json<ThemeRegistration>();
	return theme;
}
