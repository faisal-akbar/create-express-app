#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const appName = process.argv[2] || 'my-express-app';
const appPath = path.join(process.cwd(), appName);

if (fs.existsSync(appPath)) {
  console.error(`Folder ${appName} already exists. Aborting.`);
  process.exit(1);
}

fs.mkdirSync(appPath);
process.chdir(appPath);

console.log(`🔧 Creating project in ${appPath}...`);

execSync('npm init -y', { stdio: 'inherit' });

console.log('📦 Installing dependencies...');
execSync('npm install express cors dotenv zod http-status-codes jsonwebtoken mongoose', { stdio: 'inherit' });
console.log('📦 Installing dev dependencies...');
execSync('npm install -D typescript eslint @eslint/js typescript-eslint @types/cors @types/dotenv @types/express @types/jsonwebtoken ts-node-dev', { stdio: 'inherit' });

console.log('📝 Writing tsconfig.json...');
fs.writeFileSync('tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: "es2016",
    module: "CommonJS",
    rootDir: "./src",
    outDir: "./dist",
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,  
    strict: true,
    skipLibCheck: true,
  }
}, null, 2));

console.log('🧹 Writing eslint.config.mjs...');
fs.writeFileSync('eslint.config.mjs', `// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  //   tseslint.configs.recommended
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules : {
        "no-console" : "warn"
    }
  }
);
`);

console.log('🧹 Writing .env...');
fs.writeFileSync('.env', `PORT=5000
DB_URL=mongodb+srv://<db_user>:<db_password>@cluster0.4pnfxkm.mongodb.net/library?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
`);

console.log('🧹 Writing .env.example...');
fs.writeFileSync('.env.example', `PORT=5000
DB_URL=mongodb+srv://<db_user>:<db_password>@cluster0.4pnfxkm.mongodb.net/library?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
`);

console.log('📁 Creating folder structure...');

// Create the necessary folders
const folders = [
  'src',
  'src/app/config',
  'src/app/errorHelpers',
  'src/app/middlewares',
  'src/app/modules',
  'src/app/routes',
  'src/app/utils',
];

console.log('📂 Creating folders:', folders.join(', '));
folders.forEach(folder => fs.mkdirSync(folder, { recursive: true }));

console.log('📄 Creating starter files...');
fs.writeFileSync('src/app.ts', `import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Express Backend",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
`);

fs.writeFileSync('src/server.ts', `/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)

        console.log("Connected to DB!!");

        server = app.listen(envVars.PORT, () => {
            console.log(\`Server is listening to port \${envVars.PORT}\`);
        });
    } catch (error) {
        console.log(error);
    }
}

startServer()

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received... Server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

process.on("SIGINT", () => {
    console.log("SIGINT signal received... Server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})


process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected... Server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

// Unhandier rejection error
// Promise.reject(new Error("I forgot to catch this promise"))

// Uncaught Exception Error
// throw new Error("I forgot to handle this local error")


/**
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 */
`);

fs.writeFileSync('src/app/config/env.ts', `import dotenv from "dotenv";

dotenv.config()

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production"
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "NODE_ENV"];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(\`Missing required environment variable: \${key}\`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development" | "production"
    }
}

export const envVars = loadEnvVariables()
`);

fs.writeFileSync('src/app/errorHelpers/AppError.ts', `class AppError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string, stack = '') {
        super(message) // throw new Error("Something went wrong")
        this.statusCode = statusCode

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default AppError
`);

fs.writeFileSync('src/app/middlewares/globalErrorHandler.ts', `/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = 500
    let message = "Something Went Wrong!!"

    if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}
`);

fs.writeFileSync('src/app/middlewares/notFound.ts', `import { Request, Response } from "express";
import httpStatus from "http-status-codes";


const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Route Not Found"
    })
}

export default notFound
`);

fs.writeFileSync('src/app/routes/index.ts', `import { Router } from "express"
// import { UserRoutes } from "../modules/user/user.route"

export const router = Router()

const moduleRoutes = [
    // {
    //     path: "/user",
    //     route: UserRoutes
    // },
    // {
    //     path: "/tour",
    //     route: TourRoutes
    // },
]

moduleRoutes.forEach((route) => {
    // router.use(route.path, route.route)
})

// router.use("/user", UserRoutes)
// router.use("/tour", TourRoutes)
// router.use("/division", DivisionRoutes)
// router.use("/booking", BookingRoutes)
// router.use("/user", UserRoutes)
`);

fs.writeFileSync('src/app/utils/catchAsync.ts', `import { NextFunction, Request, Response } from "express";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const catchAsync = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
        console.log(err);
        next(err)
    })
}
`);

fs.writeFileSync('src/app/utils/sendResponse.ts', `import { Response } from "express";

interface TMeta {
    total: number
}


interface TResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data
    })
}
`);

console.log('🛠️ Updating package.json scripts...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.scripts = {
  start: "node dist/server.js",
  build: "tsc",
  dev: "ts-node-dev --respawn --transpile-only src/server.ts",
  lint: "npx eslint ./src",
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

console.log(`✅ Done! cd into ${appName} and run: npm run dev`);
