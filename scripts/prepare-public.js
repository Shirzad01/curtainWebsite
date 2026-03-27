const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const filesToCopy = [
  'index.html',
  'zebra-collection.html',
  'cart.html',
  'wishlist.html',
  'gemini.html',
  'login.html',
  'admin/index.html',
  'admin/login.html',
  'style.css',
  'saved-pages.css',
  'saved-pages.js',
  'catalog-data.js'
];

const directoriesToCopy = [
  ['portal-7f3a9c', 'portal-7f3a9c'],
  ['admin/panel', 'admin/panel']
];

const ensureParentDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const file of filesToCopy) {
  const source = path.join(rootDir, file);
  if (!fs.existsSync(source)) continue;
  const target = path.join(publicDir, file);
  ensureParentDir(target);
  fs.copyFileSync(source, target);
}

for (const [sourceRelative, targetRelative] of directoriesToCopy) {
  const source = path.join(rootDir, sourceRelative);
  if (!fs.existsSync(source)) continue;
  const target = path.join(publicDir, targetRelative);
  ensureParentDir(target);
  fs.cpSync(source, target, { recursive: true });
}

const faviconSourceCandidates = [
  path.join(publicDir, 'admin', 'panel', 'favicon.ico'),
  path.join(rootDir, 'admin', 'panel', 'favicon.ico'),
  path.join(rootDir, 'admin', 'tailadmin-free-tailwind-dashboard-template-main', 'src', 'images', 'favicon.ico')
];

const faviconTarget = path.join(publicDir, 'favicon.ico');
const faviconSource = faviconSourceCandidates.find((candidate) => fs.existsSync(candidate));

if (faviconSource) {
  fs.copyFileSync(faviconSource, faviconTarget);
}

console.log(`Public site prepared at ${publicDir}`);
