// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { fixupPluginRules } from '@eslint/compat';
import drizzle from 'eslint-plugin-drizzle';

export const pluginDrizzle = fixupPluginRules(drizzle);
export { default as pluginImportAlias } from '@dword-design/eslint-plugin-import-alias';
