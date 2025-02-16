import { config as baseConfig } from './src/configs/base.mjs';
import { config as importConfig } from './src/configs/import.mjs';

export default [...baseConfig, ...importConfig];
