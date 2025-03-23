import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../src/worker-configuration.d.ts');

function updateWorkerConfiguration() {
	// Read the file
	const content = readFileSync(filePath, 'utf8');

	// Find the content inside Cloudflare.Env interface
	const cloudflareEnvMatch = content.match(/interface Env \{([^}]+)\}/);
	if (!cloudflareEnvMatch) {
		console.error('Could not find Cloudflare.Env interface');
		return;
	}

	// Extract the interface content
	const envContent = cloudflareEnvMatch[1].trim();

	// Find the empty Env interface
	const emptyEnvRegex = /interface Env extends Cloudflare\.Env \{\}/;

	// Replace it with the new content
	const updatedContent = content.replace(
		emptyEnvRegex,
		`interface Env extends Cloudflare.Env {\n${envContent}\n}`
	);

	// Write back to file
	writeFileSync(filePath, updatedContent);
	console.log('Successfully updated worker-configuration.d.ts');
}

updateWorkerConfiguration();
