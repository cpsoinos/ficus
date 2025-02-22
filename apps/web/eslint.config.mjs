import { config as baseConfig } from '@ficus/eslint-config/configs/base';
import { config as svelteConfig } from '@ficus/eslint-config/configs/svelte';
import { config as importConfig } from '@ficus/eslint-config/configs/import';
import { config as drizzleConfig } from '@ficus/eslint-config/configs/drizzle';

export default [...baseConfig, ...svelteConfig, ...importConfig, ...drizzleConfig];
