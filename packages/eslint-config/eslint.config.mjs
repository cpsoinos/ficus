import { config as baseConfig } from './src/configs/base.mjs';
import { config as importConfig } from './src/configs/import.mjs';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [...baseConfig, ...importConfig];
