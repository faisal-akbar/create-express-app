# Create Express App
This package allows you to quickly scaffold a new Express.js application with TypeScript support, including essential files, directories and packages

Generate Express TypeScript modules with boilerplate templates.

## How to run

```bash
npx express-app-kit
OR
npx github:faisal-akbar/create-express-app

Enter your app name: sample-express-app
cd sample-express-app
npm install
npm run dev
```

## Project Structure
.
├── README.md
├── bin
│   └── index.js
├── package-lock.json
├── package.json
└── script
    ├── create-express-app.js
    ├── dependencies
    │   ├── mongoose
    │   │   ├── dependencies.txt
    │   │   └── devDependencies.txt
    │   └── prisma
    │       ├── dependencies.txt
    │       └── devDependencies.txt
    └── templates
        ├── mongoose
        │   ├── eslint.config.mjs
        │   ├── src
        │   │   ├── app
        │   │   │   ├── config
        │   │   │   │   └── env.ts
        │   │   │   ├── errorHelpers
        │   │   │   │   └── AppError.ts
        │   │   │   ├── interfaces
        │   │   │   │   └── index.d.ts
        │   │   │   ├── middlewares
        │   │   │   │   ├── globalErrorHandler.ts
        │   │   │   │   ├── notFound.ts
        │   │   │   │   └── validateRequest.ts
        │   │   │   ├── modules
        │   │   │   ├── routes
        │   │   │   │   └── index.ts
        │   │   │   └── utils
        │   │   │       ├── catchAsync.ts
        │   │   │       ├── jwt.ts
        │   │   │       └── sendResponse.ts
        │   │   ├── app.ts
        │   │   └── server.ts
        │   └── tsconfig.json
        └── prisma
            ├── eslint.config.mjs
            ├── src
            │   ├── app
            │   │   ├── config
            │   │   └── modules
            │   ├── app.ts
            │   └── server.ts
            └── tsconfig.json