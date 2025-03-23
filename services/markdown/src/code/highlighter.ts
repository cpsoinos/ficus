import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine, loadWasm } from 'shiki/engine/oniguruma';

import { loadLanguageData } from './load-languages';
import { loadTheme, type ThemeName } from './themes';

await loadWasm(import('shiki/onig.wasm'));

export async function createHighlighter({
	themes,
	langs
}: {
	themes: ThemeName[];
	langs: string[];
}) {
	const { languages, aliasMap } = await loadLanguageData(langs);
	const themeRegistrations = await Promise.all(
		themes.map((themeName) => {
			return loadTheme(themeName);
		})
	);

	return createHighlighterCore({
		themes: themeRegistrations,
		langs: languages,
		langAlias: aliasMap,
		engine: createOnigurumaEngine(import('shiki/onig.wasm'))
	});
}
