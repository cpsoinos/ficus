import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export const extractCodeLanguages = (markdown: string): string[] => {
	const tree = unified().use(remarkParse).parse(markdown);
	const languages: string[] = [];

	visit(tree, 'code', (node) => {
		if (node.lang) {
			languages.push(node.lang);
		}
	});

	return languages;
};
