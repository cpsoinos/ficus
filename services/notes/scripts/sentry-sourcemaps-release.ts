import { exec } from 'child_process';

async function execAsync(command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(command, (err, stdout) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout.trim());
			}
		});
	});
}

// inject markers into sourcemaps
await execAsync(`pnpm sentry-cli sourcemaps inject ./dist`);

// upload sourcemaps to sentry
await execAsync(`pnpm sentry-cli sourcemaps upload ./dist`);

// generate a release version
const version = await execAsync('pnpm sentry-cli releases propose-version');

console.log(`Setting release version: ${version}`);

// create a new release with sentry-cli
await execAsync(`pnpm sentry-cli  releases new ${version}`);

// set commits on the release
await execAsync(`pnpm sentry-cli releases set-commits --auto ${version} --ignore-missing`);
