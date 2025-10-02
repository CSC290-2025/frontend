# Contributing Guidelines

## Requirements & Setup

### Prerequisites

- **Node.js:** >=20.19.0
- **pnpm:** 10.17.1 (exact version)

> [!IMPORTANT]
> Use the exact pnpm version to avoid dependency conflicts across teams.

### Installing pnpm

```bash
# Using corepack (recommended)
corepack enable
corepack use pnpm@10.17.1

# Or install pnpm globally
npm install -g pnpm@10.17.1

```

### Verify installation

```bash
pnpm --version  # Should show 10.17.1
node --version  # Should show >=20.19.0
```

## Daily Workflow

> [!TIP]
> Follow this workflow every day to stay in sync and maintain code quality.

### Start of Day

1. **Pull latest changes**

   ```bash
   git pull origin main
   ```

2. **Install/update dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

### During Development

#### Creating a Feature Branch

```bash
git checkout -b feature/[feature-name]
# or
git checkout -b fix/[bug-fix]
```

#### Staying in Sync (Do this frequently!)

**Merge workflow:**

```bash
# Fetch latest main and merge into your branch
git fetch origin main
git merge origin/main
```

**When to sync:**

- Before starting work each day
- Before creating a PR
- When main has important updates
- If your branch is getting behind

#### Before Committing

> [!NOTE]
> These checks are enforced by pre-commit hooks, but run them manually to catch issues early.

1. **Run linting and formatting**

   ```bash
   pnpm check
   ```

2. **Run tests** (If tests are available for specific features)

   ```bash
   pnpm test
   ```

#### Committing Changes

```bash
git add .
git commit -m "type: concise description of changes"
# (e.g. git commit -m "feat: add new user dashboard")
```

> [!NOTE]
> **Commit message format:** (If possible, please use [Conventional Commits](https://www.conventionalcommits.org/))
>
> - `feat:` - new feature
> - `fix:` - bug fix
> - `refactor:` - code refactoring
> - `docs:` - documentation changes
> - `test:` - adding or updating tests
> - `chore:` - housekeeping tasks (no new fn or feats)

### End of Day

1. **Push your branch**

   ```bash
   git push origin [your-branch-name]
   ```

2. **Create pull request** (if feature is complete)

## Tech Stack

### React & Vite

- **React 19** with TypeScript
- **Vite** for fast development and bundling
- **React Router** via @generouted/react-router for file-based routing

### State Management & Data Fetching

- **TanStack Query** for server state management
- **Axios** for HTTP requests
- **Orval** for auto-generating API client from OpenAPI spec

### Styling

- **Tailwind CSS v4** for utility-first styling
- **Prettier Plugin** for automatic Tailwind class sorting

### Code Quality

> [!TIP]
> Code quality is automatically enforced, but understanding the tools helps debug issues.

- **Pre-commit hooks** are configured with Husky and lint-staged
- **ESLint** and **Prettier** will auto-fix on commits

> [!NOTE]
> Ping @psst on discord if any error shows up

- **TypeScript** only for consistency across frontend & backend

## Dev Commands (Can omit `run`)

| Command                 | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `pnpm run dev`          | Start development server with hot reload |
| `pnpm run build`        | Build for production                     |
| `pnpm run preview`      | Preview production build locally         |
| `pnpm run lint`         | Lint code                                |
| `pnpm run lint:fix`     | Lint and auto-fix issues                 |
| `pnpm run format`       | Format code with Prettier                |
| `pnpm run check`        | Run both linting and format checking     |
| `pnpm run test`         | Run tests                                |
| `pnpm run api:generate` | Generate API client from running backend |
| `pnpm run api:types`    | Regenerate API types from OpenAPI spec   |

## API Client Generation

> [!IMPORTANT]
> When backend API changes, regenerate the API client to stay in sync.

### Generate API client from running backend

```bash
# Make sure backend is running on localhost:3000
pnpm api:generate
```

This will:

1. Fetch the OpenAPI spec from the backend
2. Generate TypeScript types and hooks via Orval

### Regenerate types only

If you already have the OpenAPI spec and just need to regenerate:

```bash
pnpm api:types
```

## Pull Request Process

1. Make sure code quality checks succeed
2. Update documentation if needed
3. Request review from team members & the Leads
4. Let the Leads review & handle the merging process

## Getting Help

> [!TIP]
> When stuck, follow this order for quick resolution.

- Check documentation first
- Ask questions in team chat
- Tag relevant team members in PRs for domain-specific changes
