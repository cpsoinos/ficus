import { Bindings } from '../lib/bindings';

import type { LanguageInput } from 'shiki/core';

export async function loadLanguageData(langs: string[]) {
	const aliasMap = await (
		await Bindings.ASSETS.fetch('http://internal/grammars/_aliases.json')
	).json<Record<string, string>>();

	const langAliases = langs.map((lang) => aliasMap[lang] ?? lang);
	const langsRequests = langAliases.map((lang) => {
		return Bindings.ASSETS.fetch(`http://internal/grammars/${lang}.json`);
	});
	const languageResponses = await Promise.all(langsRequests);

	const languages = await Promise.all(
		languageResponses.map((response) => response.json<LanguageInput>())
	);

	return {
		languages,
		aliasMap
	};
}
