const { spawnSync } = require('node:child_process');

function getTarget() {
  const serviceName = process.env.RENDER_SERVICE_NAME || process.env.npm_config_service || '';

  if (serviceName.includes('api')) return '@thethreadsutra/api';
  if (serviceName.includes('web')) return '@thethreadsutra/web';

  throw new Error('Unable to detect Render service. Set RENDER_SERVICE_NAME to a value containing "api" or "web".');
}

const target = getTarget();
console.log(`Building ${target} for Render...`);

const result = spawnSync('npm', ['run', 'build', '-w', target], {
  stdio: 'inherit',
  shell: true
});

process.exit(result.status ?? 1);
