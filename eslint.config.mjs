import { config as baseConfig } from './packages/eslint-config/src/configs/base.mjs';
import { config as importConfig } from './packages/eslint-config/src/configs/import.mjs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [...baseConfig, ...importConfig];
