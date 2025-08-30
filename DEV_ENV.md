# Development Environment Setup

## Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space
- **CPU**: Multi-core processor recommended

### Software Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **Git**: v2.0 or higher

## Initial Setup

### 1. Clone the Repository
```bash
git clone [repository-url]
cd web-proxy-api
```

### 2. Install Node.js Dependencies
```bash
# Install all dependencies
npm install

# Or install with clean slate
npm ci
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs

# Puppeteer Configuration
PUPPETEER_HEADLESS=true
PUPPETEER_DEVTOOLS=false
PUPPETEER_SLOW_MO=0
PUPPETEER_TIMEOUT=30000
PUPPETEER_EXECUTABLE_PATH=

# Browser Pool
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT=300000
CLEANUP_INTERVAL=60000

# API Configuration
API_PREFIX=/api
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=*
HELMET_ENABLED=true

# Performance
COMPRESSION_ENABLED=true
CACHE_TTL=3600
```

### 4. TypeScript Configuration

The `tsconfig.json` is already configured. Key settings:
- Target: ES2022
- Module: CommonJS
- Strict mode enabled
- Source maps enabled
- Output directory: `./dist`

### 5. ESLint Configuration

Create `.eslintrc.json`:
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

## Development Workflow

### Running the Application

#### Development Mode (with hot reload)
```bash
npm run dev
```
This uses nodemon to watch for file changes and automatically restart the server.

#### Production Mode
```bash
npm run build
npm start
```

#### Docker Development
```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Testing

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Generate Coverage Report
```bash
npm run test:coverage
```

### Code Quality

#### Linting
```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

#### Type Checking
```bash
npm run typecheck
```

## IDE Setup

### Visual Studio Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Docker
- GitLens
- REST Client (for testing APIs)

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### WebStorm / IntelliJ IDEA

1. Enable TypeScript service
2. Configure ESLint
3. Set up Node.js interpreter
4. Configure Docker integration

## Debugging

### Node.js Debugging

#### VS Code Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Chrome DevTools Debugging
```bash
# Start with inspect flag
node --inspect dist/index.js

# Or with nodemon
nodemon --inspect src/index.ts
```
Then open `chrome://inspect` in Chrome.

### Puppeteer Debugging

#### Visual Debugging
Set environment variable:
```bash
PUPPETEER_HEADLESS=false npm run dev
```

#### Slow Motion Mode
```bash
PUPPETEER_SLOW_MO=250 npm run dev
```

#### DevTools
```bash
PUPPETEER_DEVTOOLS=true npm run dev
```

## Troubleshooting

### Common Issues

#### 1. Puppeteer Installation Issues
```bash
# If Chrome doesn't download properly
npm install puppeteer --unsafe-perm=true --allow-root

# Or use system Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 3. Docker Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf dist/
npm run build
```

#### 5. Memory Issues with Puppeteer
Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## Performance Profiling

### Node.js Profiling
```bash
# Generate CPU profile
node --prof dist/index.js

# Process the profile
node --prof-process isolate-*.log > profile.txt
```

### Memory Profiling
```bash
# Start with heap snapshots
node --inspect dist/index.js

# Use Chrome DevTools Memory Profiler
```

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `test/` - Test additions/modifications

### Commit Messages
Follow conventional commits:
```
type(scope): description

[optional body]
[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

### Pre-commit Hooks
Install husky for pre-commit hooks:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
```

## Monitoring and Logging

### Local Log Files
Logs are stored in `./logs/` directory:
- `error.log` - Error logs
- `combined.log` - All logs
- `debug.log` - Debug information (development only)

### Viewing Logs
```bash
# Tail logs
tail -f logs/combined.log

# Search logs
grep "ERROR" logs/error.log

# Pretty print JSON logs
cat logs/combined.log | jq '.'
```

## Resources

### Documentation
- [Puppeteer Documentation](https://pptr.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [Insomnia](https://insomnia.rest/) - API testing
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)