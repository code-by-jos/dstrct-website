# DSTRCT Website

## Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [React Aria Components](https://react-spectrum.adobe.com/react-aria/) (accessible)
- **Build Tool**: [Vite](https://vite.dev)

## Prerequisites

- Node.js 22+
- pnpm 9+

## Getting Started

### 1. Install dependencies

From the workspace root:

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your values. For local development, the defaults work out of the box.

### 3. Start the development server

```bash
pnpm --filter @code-by-jos/demo dev
```

The app will be available at http://localhost:3000.

## Scripts

| Script     | Description                  |
| ---------- | ---------------------------- |
| `dev`      | Start the development server |
| `build`    | Build for production         |
| `preview`  | Preview the production build |
| `lint`     | Run ESLint                   |
| `lint:fix` | Run ESLint with auto-fix     |
| `format`   | Format code with Prettier    |
