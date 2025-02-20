import { config as baseConfig } from '@ficus/eslint-config/configs/base';
import { config as importConfig } from '@ficus/eslint-config/configs/import';
import { config as drizzleConfig } from '@ficus/eslint-config/configs/drizzle';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [...baseConfig, ...importConfig, ...drizzleConfig];
