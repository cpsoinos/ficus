import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import toml from 'toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wranglerConfigFilePath = join(__dirname, '../wrangler.toml');
const declarationFilePath = join(__dirname, '../src/worker-configuration.d.ts');

const wranglerConfig = toml.parse(readFileSync(wranglerConfigFilePath, 'utf8'));

// for each durable object binding, add a new property to the Cloudflare.Env interface
const durableObjects = wranglerConfig.durable_objects.bindings.reduce((acc, binding) => {
	const { name, class_name, script_name } = binding;
	const importPath = `${script_name.replace('ficus-', '@ficus/')}/src/index`;

	return {
		...acc,
		[name]: `DurableObjectNamespace<import('${importPath}').${class_name}>;`
	};
}, {});

// for each service binding, add a new property to the Cloudflare.Env interface
const services = wranglerConfig.services.reduce((acc, serviceBinding) => {
	const { binding, service, entrypoint } = serviceBinding;
	if (!entrypoint) {
		return {
			...acc,
			[binding]: 'Fetcher;'
		};
	}
	const importPath = `${service.replace('ficus-', '@ficus/')}/src/index`;
	return {
		...acc,
		[binding]: `Fetcher<import('${importPath}').${entrypoint}>;`
	};
}, {});

function fixWorkerEnvironmentTypes() {
	// Read the file
	const content = readFileSync(declarationFilePath, 'utf8');

	// Find the content inside Cloudflare.Env interface
	const cloudflareEnvMatch = content.match(/interface Env \{([^}]+)\}/);
	if (!cloudflareEnvMatch) {
		console.error('Could not find Cloudflare.Env interface');
		return;
	}

	// Extract the interface content
	const envContent = cloudflareEnvMatch[1].trim();

	// for each line in the envContent, if it begins with a key in either `durableObjects` or `services`, replace it with the key and value from the respective object
	const updatedEnvContent = envContent
		.split('\n')
		.map((line) => {
			const key = line.split(':')[0].trim();
			if (durableObjects[key]) {
				return `${key}: ${durableObjects[key]}`;
			}
			if (services[key]) {
				return `${key}: ${services[key]}`;
			}
			return line;
		})
		.join('\n');

	// Find the empty Env interface
	const emptyEnvRegex = /interface Env extends Cloudflare\.Env \{\}/;

	// Replace it with the new content
	const updatedContent = content
		.replace(emptyEnvRegex, `interface Env extends Cloudflare.Env {\n${updatedEnvContent}\n}`)
		.replace(envContent, updatedEnvContent);

	// Write back to file
	writeFileSync(declarationFilePath, updatedContent);
	console.log('Successfully updated worker-configuration.d.ts');
}

fixWorkerEnvironmentTypes();

// run prettier on the file
execSync(`pnpm -w prettier --write ${declarationFilePath}`);
