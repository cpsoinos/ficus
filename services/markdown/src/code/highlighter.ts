import darkPlus from '@shikijs/themes/dark-plus';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine, loadWasm } from 'shiki/engine/oniguruma';

import { loadLanguageData } from './load-languages';

import type { ThemeName } from './themes';

await loadWasm(import('shiki/onig.wasm'));

export async function createHighlighter({
	// themes,
	langs
}: {
	themes: ThemeName[];
	langs: string[];
}) {
	const { languages, aliasMap } = await loadLanguageData(langs);

	return createHighlighterCore({
		themes: [darkPlus],
		// themes: themes.map((theme) => import(`@shikijs/themes/${theme}`)),
		langs: languages,
		langAlias: aliasMap,
		engine: createOnigurumaEngine(import('shiki/onig.wasm'))
	});
}
