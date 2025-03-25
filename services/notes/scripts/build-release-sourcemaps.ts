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

// generate a release version
const version = await execAsync('pnpm sentry-cli releases propose-version');

// create a new release with sentry-cli
console.log('🚀 Creating new release on Sentry...');
await execAsync(`pnpm sentry-cli releases new ${version}`);
console.log('✅ Created new release on Sentry!');

// build the project
console.log('🏗️ Building project...');
await execAsync('pnpm build');
console.log('✅ Project built!');

// inject markers into sourcemaps
await execAsync(`pnpm sentry-cli sourcemaps inject ./dist`);

// upload sourcemaps to sentry
console.log('⬆️ Uploading sourcemaps to Sentry...');
await execAsync(`pnpm sentry-cli sourcemaps upload ./dist`);
console.log('✅ Uploaded sourcemaps to Sentry!');

// set commits on the release
console.log('🔗 Setting commits on the release...');
await execAsync(`pnpm sentry-cli releases set-commits --auto ${version} --ignore-missing`);
console.log('✅ Set commits on the release!');

// finalize the release
console.log('🎉 Finalizing release...');
await execAsync(`pnpm sentry-cli releases finalize ${version}`);
console.log('✅ Finalized release!');
