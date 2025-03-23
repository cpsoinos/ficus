import { config as baseConfig } from '@ficus/eslint-config/configs/base';
import { config as cloudflareConfig } from '@ficus/eslint-config/configs/cloudflare';
import { config as drizzleConfig } from '@ficus/eslint-config/configs/drizzle';
import { config as importConfig } from '@ficus/eslint-config/configs/import';

export default [...baseConfig, ...importConfig, ...drizzleConfig, ...cloudflareConfig];
