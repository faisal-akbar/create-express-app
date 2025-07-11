# Create Express App
This package allows you to quickly scaffold a new Express.js application with TypeScript support, including essential files, directories and packages

Generate Express TypeScript modules with boilerplate templates.

## How to run

```bash
npx create-express-kit
# OR
npx github:faisal-akbar/create-express-app

Enter your app name: sample-express-app
cd sample-express-app
npm install
npm run dev
```

## Features
- **TypeScript**: Full support for TypeScript
- **Mongoose**: Optional integration with Mongoose for MongoDB
- **Prisma**: Optional integration with Prisma for database management
- **ESLint**: Pre-configured ESLint for code quality
- **Prettier**: Pre-configured Prettier for code formatting
- **Modular Structure**: Organized directory structure for easy maintenance
- **Error Handling**: Built-in error handling middleware
- **Environment Configuration**: Easy management of environment variables
- **Global Error Handler**: Centralized error handling for the application
- **Not Found Middleware**: Handles 404 errors gracefully
- **Catch Async**: Utility for handling asynchronous requests
- **JWT Utility**: Helper functions for JSON Web Tokens
- **Response Utility**: Standardized response format for API responses
- **Validation Middleware**: Middleware for validating incoming requests
- Installation of dependencies based on the selected template (Mongoose or Prisma)
- Scripts for development, linting, and building the application


## Sample Project Structure
```
.
├── README.md
├── eslint.config.mjs
├── package-lock.json
├── package.json
├── .env.example
├── src
│   ├── app
│   │   ├── config
│   │   │   └── env.ts
│   │   ├── errorHelpers
│   │   │   └── AppError.ts
│   │   ├── interfaces
│   │   │   └── index.d.ts
│   │   ├── middlewares
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules
│   │   ├── routes
│   │   │   └── index.ts
│   │   └── utils
│   │       ├── catchAsync.ts
│   │       ├── jwt.ts
│   │       └── sendResponse.ts
│   ├── app.ts
│   └── server.ts
└── tsconfig.json
```