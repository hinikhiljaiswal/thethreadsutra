const { spawnSync } = require('node:child_process');

function getCommand() {
  const serviceName = process.env.RENDER_SERVICE_NAME || process.env.npm_config_service || '';

  if (serviceName.includes('api')) {
    return ['npm', ['run', 'start:prod', '-w', '@thethreadsutra/api']];
  }

  if (serviceName.includes('web')) {
    return ['npm', ['run', 'start:render', '-w', '@thethreadsutra/web']];
  }

  throw new Error('Unable to detect Render service. Set RENDER_SERVICE_NAME to a value containing "api" or "web".');
}

const [command, args] = getCommand();
console.log(`Starting Render service with: ${command} ${args.join(' ')}`);

const result = spawnSync(command, args, {
  stdio: 'inherit',
  shell: true
});

process.exit(result.status ?? 1);
