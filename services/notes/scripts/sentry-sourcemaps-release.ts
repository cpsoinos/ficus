import { exec } from 'child_process';

console.log('🚀 Creating new release on Sentry...');
console.log(`Org: ${process.env.SENTRY_ORG}`);
console.log(`Project: ${process.env.SENTRY_PROJECT}`);

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

// login to the sentry cli
await execAsync(`pnpm sentry-cli login --auth-token $SENTRY_AUTH_TOKEN`);

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
