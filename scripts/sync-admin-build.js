const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(
  rootDir,
  'admin',
  'tailadmin-free-tailwind-dashboard-template-main',
  'build'
);
const targetDir = path.join(rootDir, 'admin', 'panel');

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Admin build output not found at ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Admin build synced to ${targetDir}`);
