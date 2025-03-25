import { exec } from 'child_process';

const authToken = process.env.SENTRY_AUTH_TOKEN;
const projectName = process.env.SENTRY_PROJECT;
const orgName = process.env.SENTRY_ORG;

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
await execAsync(
	`pnpm sentry-cli sourcemaps inject --org ${orgName} --project ${projectName} ./dist`
);

// upload sourcemaps to sentry
await execAsync(
	`pnpm sentry-cli sourcemaps upload --org ${orgName} --project ${projectName} --auth-token ${authToken} ./dist`
);

// generate a release version
const version = await execAsync('pnpm sentry-cli releases propose-version');

console.log(`Setting release version: ${version}`);

// create a new release with sentry-cli
await execAsync(
	`pnpm sentry-cli --auth-token ${authToken} --org ${orgName} --project ${projectName} releases new ${version}`
);

// set commits on the release
await execAsync(
	`pnpm sentry-cli --auth-token ${authToken} --org ${orgName} --project ${projectName} releases set-commits --auto ${version}`
);
