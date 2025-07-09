#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const appName = process.argv[2] || 'my-express-app';
const appPath = path.join(process.cwd(), appName);
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, 'templates');

if (fs.existsSync(appPath)) {
  console.error(`Folder ${appName} already exists. Aborting.`);
  process.exit(1);
}

console.log(`🔧 Creating project in ${appPath}...`);
fs.mkdirSync(appPath);
process.chdir(appPath);


console.log('📦 Initializing npm project...');
execSync('npm init -y', { stdio: 'inherit' });

console.log('📦 Installing dependencies...');
execSync('npm install express cors dotenv zod http-status-codes jsonwebtoken mongoose', { stdio: 'inherit' });
console.log('📦 Installing dev dependencies...');
execSync('npm install -D typescript eslint @eslint/js typescript-eslint @types/cors @types/dotenv @types/express @types/jsonwebtoken ts-node-dev', { stdio: 'inherit' });


// Copy single file
const copyTemplate = (filename) => {
  const srcFile = path.join(templatePath, filename);
  const destFile = path.join('.', filename);
  fs.copyFileSync(srcFile, destFile);
  console.log(`✅ Copied ${filename}`);
};

// Copy directories recursively
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

// Copy the entire src directory
console.log('📂 Copying src directory...');
if (fs.existsSync(path.join(templatePath, 'src'))) {
  copyRecursiveSync(path.join(templatePath, 'src'), './src');
  console.log('✅ Copied entire src directory');
} else {
  console.error('❌ Templates src directory not found!');
  process.exit(1);
}

// Copy config files to root
console.log('📄 Copying config files...');
copyTemplate('tsconfig.json');
copyTemplate('eslint.config.mjs');
copyTemplate('.env');
copyTemplate('.env.example');


console.log('🛠️ Updating package.json scripts...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.scripts = {
  start: "node dist/server.js",
  build: "tsc",
  dev: "ts-node-dev --respawn --transpile-only src/server.ts",
  lint: "npx eslint ./src",
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

console.log('');
console.log('🎉 Express TypeScript app created successfully!');
console.log('');
console.log('📦 Next steps:');
console.log(`   cd ${appName}`);
console.log('   npm run dev');
console.log('');
console.log('🚀 Your app will be available at: http://localhost:5000');