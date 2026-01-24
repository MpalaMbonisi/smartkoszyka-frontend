# SmartKoszyka Frontend

A modern Angular shopping list management application with product catalog browsing, list creation, and an optimized shopping mode interface.

## Live Demo

**Production:** [https://smartkoszyka.com](https://d1gb8dxpe17qcc.cloudfront.net)

## Tech Stack

- **Framework:** Angular 21
- **Language:** TypeScript 5.9
- **Styling:** SCSS with CSS Custom Properties
- **Testing:** Jasmine + Karma
- **Build Tool:** Angular CLI
- **Package Manager:** npm 10.9.4

## Features

- 🔐 JWT-based authentication
- 📱 Responsive design (mobile-first for shopping mode)
- 🌓 Dark/Light theme toggle with system preference detection
- 🛒 Product catalog with category filtering and search
- 📝 Shopping list CRUD operations
- ✅ Shopping mode with item checking
- 🎨 Boxy, modern UI design
- ♿ Accessibility-focused components

## Architecture

### Project Structure
```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors (JWT, loading)
│   │   ├── models/              # TypeScript interfaces
│   │   └── services/            # Business logic services
│   ├── features/                # Feature modules
│   │   ├── auth/                # Login, Register
│   │   ├── dashboard/           # Main dashboard
│   │   ├── products/            # Product catalog
│   │   └── shopping-lists/      # List management & shopping mode
│   └── shared/                  # Reusable components
│       └── components/
├── styles/                      # Global styles and variables
└── environments/                # Environment configurations
```

### Key Design Patterns
- **Signals-based state management** for reactive UI updates
- **Standalone components** (no NgModules)
- **Lazy loading** for feature routes
- **HTTP interceptors** for JWT injection and error handling
- **Route guards** for authentication protection

## Testing Approach

This project follows **Test-Driven Development (TDD)** principles:

- ✅ **80%+ code coverage** requirement
- 🔄 Write tests before implementation
- 🎯 Comprehensive unit tests for all components and services
- 🧩 Integration tests for user flows

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Headless mode for CI
npm run test:headless

# Open coverage report
npm run coverage:open
```

## Build & Deployment

### Build for Production
```bash
npm run build -- --configuration production
```

Output: `dist/smartkoszyka-frontend/`

### Deployment Architecture

**Hosting:** AWS S3 + CloudFront

- S3 bucket hosts static files
- CloudFront CDN for global distribution
- HTTPS enabled via CloudFront
- Cache optimization for performance

## CI/CD Pipeline

### Workflow Explanation

The project uses **GitHub Actions** for automated deployment:
```yaml
Trigger: Push to main branch or Pull Request

Jobs:
  1. Build and Test
     ├─ Checkout code
     ├─ Setup Node.js 20.x
     ├─ Install dependencies (npm ci)
     ├─ Run linting
     ├─ Check code formatting
     ├─ Run unit tests with coverage
     ├─ Upload coverage to Codecov
     └─ Build production bundle

  2. Security Audit
     ├─ npm audit (moderate threshold)
     └─ Snyk security scan

  3. Deploy to S3 (main branch only)
     ├─ Build production bundle
     ├─ Configure AWS credentials
     ├─ Sync files to S3 bucket
     │  ├─ Static assets: 1-year cache
     │  └─ index.html: no cache
     └─ Invalidate CloudFront cache
```

### Quality Gates
- All tests must pass
- Linting errors block deployment
- Code formatting enforced
- Security vulnerabilities reported (non-blocking)

### Pre-commit Hooks (Husky)
```bash
# Runs on git commit
- Lint staged files
- Format with Prettier

# Runs on git push
- Full linting
- All tests
- Production build
```

## Available Scripts
```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
npm run test:ci        # Tests for CI (headless)
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

## Theme System

Supports three modes:
- **Auto:** Follows system preference
- **Light:** Manual light mode
- **Dark:** Manual dark mode

Theme preference persisted in `localStorage`.

## Backend Integration

**Backend Repository:** [SmartKoszyka Backend](https://github.com/MpalaMbonisi/smartkoszyka-api)

### API Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /api/products` - Fetch products
- `GET /api/categories` - Fetch categories
- `POST /api/shopping-lists` - Create list
- `GET /api/shopping-lists/active` - Get active lists
- Full endpoint documentation in backend README

## Author

**Mbonisi Mpala**
