import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { extractCodeLanguages } from './code/extract-code-languages';
import { createHighlighter } from './code/highlighter';
import {
	validateTheme,
	validateThemes,
	type HighlighterThemeOptions,
	type ThemeName
} from './code/themes';

export type RenderOptions = HighlighterThemeOptions;

export async function render(raw: string, options?: RenderOptions): Promise<string> {
	const highlighterOptions: HighlighterThemeOptions = {};
	if (options?.themes) {
		highlighterOptions.themes = validateThemes(options.themes);
	} else {
		highlighterOptions.theme = validateTheme(options?.theme);
	}

	const themes = [
		highlighterOptions.theme,
		...Object.values(highlighterOptions.themes ?? {})
	].filter(Boolean) as ThemeName[];
	const langs = extractCodeLanguages(raw);
	const highlighter = await createHighlighter({ themes, langs });

	const file = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeSanitize)
		// @ts-expect-error - rehypeShikiFromHighlighter expects a HighlighterGeneric, but highlighter is a HighlighterCore
		.use(rehypeShikiFromHighlighter, highlighter, highlighterOptions)
		.use(rehypeStringify)
		.process(raw);

	return file.toString();
}
