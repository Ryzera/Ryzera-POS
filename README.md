# Ryzera POS

[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.8.9-blueviolet.svg)](https://turborepo.dev/)

**A modern, full-stack Point of Sale (POS) system built with TypeScript monorepo architecture.**

Ryzera POS is a comprehensive point of sale solution designed for modern retail environments. Built on a scalable monorepo architecture using Turborepo, it provides a robust API backend powered by NestJS, an intuitive Next.js web application, and a shared Prisma database layer for consistent data management across the platform.

---

## 📋 Table of Contents

- [About](#about)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Development](#development)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## About

Ryzera POS is built to streamline retail operations with:

- **Modern Technology Stack**: Leveraging the latest TypeScript frameworks and tools
- **Monorepo Architecture**: Efficient code sharing and dependency management using Turborepo
- **Type Safety**: End-to-end type safety from database to frontend
- **Scalable Design**: Microservices-ready architecture for future growth
- **Developer Experience**: Hot module reloading, shared configurations, and powerful tooling

Whether you're building a single-store POS or a multi-location retail management system, Ryzera POS provides the foundation you need.

---

## Architecture

### Technology Stack

| Layer           | Technology            | Description                                             |
| --------------- | --------------------- | ------------------------------------------------------- |
| **Frontend**    | Next.js 16 + React 19 | Modern web application with server-side rendering       |
| **Backend**     | NestJS 11             | Enterprise-grade Node.js framework with TypeScript      |
| **Database**    | PostgreSQL + Prisma 7 | Type-safe database access with modern ORM               |
| **Monorepo**    | Turborepo + pnpm      | High-performance build system with workspace management |
| **Type System** | TypeScript 5.9        | Static typing across the entire stack                   |
| **Testing**     | Jest                  | Comprehensive unit and integration testing              |

### Monorepo Structure

```
ryzera-pos/
├── apps/
│   ├── pos-api-service/     # NestJS backend API
│   └── pos-web-app/         # Next.js frontend application
├── packages/
│   ├── pos-database/        # Shared Prisma database client
│   ├── pos-schema/          # Shared validation schemas
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
└── turbo.json               # Turborepo pipeline configuration
```

### Database Schema

The system uses PostgreSQL with Prisma ORM, featuring:

- **User Management**: Role-based authentication and authorization
- **Product Catalog**: Inventory tracking with real-time stock updates
- **Inventory Logging**: Comprehensive audit trail for stock changes
- **Sync Operations**: Built-in data synchronization capabilities

Key entities:

- `User`: User accounts with role-based access
- `Product`: Product catalog with pricing and stock quantities
- `InventoryLog`: Detailed history of inventory changes
- `SyncLog`: Synchronization audit trail

---

## Features

### 🔐 Authentication & Authorization

- Role-based access control (RBAC)
- Secure user management
- Session handling

### 📦 Inventory Management

- Real-time stock tracking
- Product catalog management
- Inventory change logging
- Low stock alerts capability

### 💰 Point of Sale Operations

- Fast checkout processing
- Product search and selection
- Transaction management

### 📊 Data Synchronization

- Multi-location data sync
- Audit trail for all operations
- Conflict resolution mechanisms

### 🛠️ Developer Features

- Hot module reloading (HMR)
- Type-safe API contracts
- Shared component library
- Automated type generation
- Comprehensive linting and formatting

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** 9.0.0 ([Install](https://pnpm.io/installation))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ryzera-pos
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create environment files for each application:

For the API service (`apps/pos-api-service/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ryzera_pos"
PORT=3001
```

For the database package (`packages/pos-database/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ryzera_pos"
```

4. **Initialize the database**

```bash
cd packages/pos-database
pnpm db:generate
pnpm db:push
```

5. **Start development servers**

From the root directory:

```bash
pnpm dev
```

This will start:

- API Service at `http://localhost:3001`
- Web App at `http://localhost:3000`

---

## Development

### Running Individual Apps

You can run specific applications using Turborepo filters:

```bash
# Run only the web app
pnpm dev --filter=@ryzera/pos-web-app

# Run only the API service
pnpm dev --filter=@ryzera/pos-api-service
```

### Building for Production

Build all apps and packages:

```bash
pnpm build
```

Build specific packages:

```bash
# Build the database package
pnpm build --filter=@ryzera/pos-database

# Build the API service
pnpm build --filter=@ryzera/pos-api-service
```

### Database Commands

```bash
# Generate Prisma Client
pnpm --filter=@ryzera/pos-database db:generate

# Run database migrations
pnpm --filter=@ryzera/pos-database db:migrate

# Push schema changes (development)
pnpm --filter=@ryzera/pos-database db:push

# Reset database
pnpm --filter=@ryzera/pos-database db:reset

# Open Prisma Studio
pnpm --filter=@ryzera/pos-database db:studio
```

### Linting and Formatting

```bash
# Run ESLint across all packages
pnpm lint

# Format code with Prettier
pnpm format

# Type checking
pnpm check-types
```

### Testing

```bash
# Run tests in the API service
pnpm --filter=@ryzera/pos-api-service test

# Run tests in watch mode
pnpm --filter=@ryzera/pos-api-service test:watch

# Generate coverage report
pnpm --filter=@ryzera/pos-api-service test:cov

# Run E2E tests
pnpm --filter=@ryzera/pos-api-service test:e2e
```

---

## Project Structure

### Apps

#### `pos-api-service`

The NestJS backend API providing RESTful endpoints for:

- User authentication and management
- Product catalog operations
- Inventory management
- Transaction processing

**Tech Stack**: NestJS, TypeScript, Jest

#### `pos-web-app`

The Next.js frontend application offering:

- Modern, responsive UI
- Server-side rendering for optimal performance
- Real-time updates
- Intuitive POS interface

**Tech Stack**: Next.js 16, React 19, TypeScript

### Packages

#### `pos-database`

Shared Prisma database client used across all applications.

- Centralized database schema
- Type-safe database access
- Migration management
- Prisma Client generation

#### `pos-schema`

Shared validation schemas and types for consistent data validation.

#### `eslint-config`

Shared ESLint configurations ensuring code quality and consistency.

#### `typescript-config`

Shared TypeScript configurations for unified type checking.

---

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start all apps in development mode |
| `pnpm build`       | Build all apps and packages        |
| `pnpm lint`        | Run ESLint on all packages         |
| `pnpm format`      | Format code with Prettier          |
| `pnpm check-types` | Run TypeScript type checking       |

### Turborepo Features

Turborepo provides:

- **Incremental Builds**: Only rebuilds what changed
- **Remote Caching**: Share build artifacts across machines
- **Task Pipelines**: Intelligent task scheduling and parallelization
- **Content-Aware Hashing**: Accurate change detection

Learn more about Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create your feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards
   - Run `pnpm lint` to ensure code quality
   - Run `pnpm check-types` to verify type safety
   - Write tests for new features

3. **Commit your changes** with descriptive messages

   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request** describing your changes

### Development Standards

- Follow TypeScript best practices
- Maintain type safety across the stack
- Write comprehensive tests for new features
- Update documentation for significant changes
- Follow the existing code style and patterns

---

## License

This project is **UNLICENSED** - All rights reserved.

---

## Support

For questions, issues, or contributions:

- 📧 Contact the development team
- 🐛 Report bugs through the issue tracker
- 💡 Suggest features or improvements

---

**Built with ❤️ using modern TypeScript technologies**
