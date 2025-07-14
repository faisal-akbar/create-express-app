#!/usr/bin/env node
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import inquirer from "inquirer";
import { consola } from "consola";

const getUserInput = async () => {
  const cmdLineAppName = process.argv[2];

  let appName;
  if (cmdLineAppName) {
    appName = cmdLineAppName;
  } else {
    const { inputAppName } = await inquirer.prompt([
      {
        name: "inputAppName",
        type: "input",
        message: "📝 Enter your app name:",
        default: "my-express-app",
        validate: (input) => {
          if (!input.trim()) {
            return "App name is required";
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input.trim())) {
            return "App name can only contain letters, numbers, hyphens, and underscores";
          }
          return true;
        },
      },
    ]);
    appName = inputAppName.trim();
  }

  const { databaseTemplate } = await inquirer.prompt([
    {
      name: "databaseTemplate",
      type: "list",
      message: "💾 Which database template do you want?",
      choices: [
        { name: "Mongoose (MongoDB)", value: "mongoose" },
        { name: "Prisma (PostgreSQL/MySQL/SQLite)", value: "prisma" },
      ],
      default: "mongoose",
    },
  ]);

  return { appName, databaseTemplate };
};

const { appName, databaseTemplate } = await getUserInput();

// const appName = await getAppName();
const appPath = path.join(process.cwd(), appName);
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "templates", databaseTemplate);

if (fs.existsSync(appPath)) {
  consola.error(`Folder ${appName} already exists. Aborting.`);
  process.exit(1);
}

consola.start(`🔧 Creating project in ${appPath}...`);
fs.mkdirSync(appPath);
process.chdir(appPath);

// Function to read dependencies from text file
const readDependencies = (filename) => {
  const filePath = path.join(
    __dirname,
    "dependencies",
    databaseTemplate,
    filename
  );
  if (fs.existsSync(filePath)) {
    return fs
      .readFileSync(filePath, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")); // Filter empty lines and comments
  }
  return [];
};

consola.start("📦 Initializing npm project...");
execSync("npm init -y", { stdio: "inherit" });
consola.success("📦 npm project initialized");

// Read dependencies from text files
const dependencies = readDependencies("dependencies.txt");
const devDependencies = readDependencies("devDependencies.txt");

if (dependencies.length > 0) {
  consola.start("📦 Installing dependencies...");
  consola.info(`   ${dependencies.join(" ")}`);
  execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
  consola.success("📦 Dependencies installed");
}

if (devDependencies.length > 0) {
  consola.start("📦 Installing dev dependencies...");
  consola.info(`   ${devDependencies.join(" ")}`);
  execSync(`npm install -D ${devDependencies.join(" ")}`, { stdio: "inherit" });
  consola.success("📦 Dev dependencies installed");
}

// Copy single file with error handling
const copyTemplate = (filename) => {
  const srcFile = path.join(templatePath, filename);
  const destFile = path.join(".", filename);

  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    consola.success(`Copied ${filename}`);
  } else {
    consola.warn(`⚠️  ${filename} not found in ${databaseTemplate} template`);
  }
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

// Conditional file copying based on template choice

// Copy the entire src directory
consola.start("📂 Copying src directory...");
if (fs.existsSync(path.join(templatePath, "src"))) {
  copyRecursiveSync(path.join(templatePath, "src"), "./src");
  consola.success("📂 Copied entire src directory");
} else {
  consola.error(`❌ ${databaseTemplate} templates src directory not found!`);
  process.exit(1);
}

// Copy config files to root
consola.start("📄 Copying config files...");
copyTemplate("tsconfig.json");
copyTemplate("eslint.config.mjs");
// copyTemplate(".env");
copyTemplate(".env.example");
copyTemplate("README.md");
// copyTemplate(".gitignore");
consola.success("📄 Config files copied");

consola.start("🛠️ Updating package.json scripts...");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
pkg.scripts = {
  start: "node dist/server.js",
  build: "tsc",
  dev: "ts-node-dev --respawn --transpile-only src/server.ts",
  lint: "npx eslint ./src",
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
consola.success("🛠️ Updated package.json scripts");

consola.log("");
consola.success("🎉 Express TypeScript app created successfully!");
consola.log("");
consola.log("📦 Next steps:");
consola.log(`   cd ${appName}`);
consola.log("   npm install");
consola.log("   npm run dev");
consola.log("");
consola.log("🚀 Your app will be available at: http://localhost:5000");
consola.log("");
consola.info("You can also use the Module Generator to create modules:");
consola.log(`  npx make-express-module`);
