import { spawnSync } from 'node:child_process';
import console from 'node:console';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const environment = process.argv[2] ?? 'staging';
if (!['staging', 'production'].includes(environment)) {
  console.error('Deployment environment must be staging or production.');
  process.exit(1);
}

// The Cloudflare Vite plugin selects its Worker configuration at build time.
// Keep that selection identical for the build and Wrangler deployment.
const env = { ...process.env, CLOUDFLARE_ENV: environment };
const require = createRequire(import.meta.url);
const commands = [
  [resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), 'build'],
  [resolve(dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js'), 'deploy', '--env', environment],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
