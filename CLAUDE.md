# QnA App - Claude Code Guide

## Project Overview

A Question and Answer application built with **SvelteKit** for the web framework and **Capacitor** for native mobile deployment (iOS/Android).

## Tech Stack

- **Frontend Framework**: Svelte 5 + SvelteKit
- **Mobile Runtime**: Capacitor 6
- **Styling**: CSS/SCSS (or Tailwind CSS if configured)
- **Language**: TypeScript
- **Package Manager**: npm/pnpm

## Project Structure

```
├── src/
│   ├── lib/              # Shared components, utilities, stores
│   │   ├── components/   # Reusable Svelte components
│   │   ├── stores/       # Svelte stores for state management
│   │   ├── utils/        # Helper functions
│   │   └── types/        # TypeScript type definitions
│   ├── routes/           # SvelteKit file-based routing
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── api/          # API routes (server endpoints)
│   ├── app.html          # HTML template
│   └── app.d.ts          # App-level TypeScript declarations
├── static/               # Static assets (favicon, images)
├── android/              # Capacitor Android project
├── ios/                  # Capacitor iOS project
├── capacitor.config.ts   # Capacitor configuration
├── svelte.config.js      # SvelteKit configuration
├── vite.config.ts        # Vite bundler configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (web)
npm run build            # Build for production

# Capacitor (Mobile)
npx cap sync             # Sync web build to native projects
npx cap open android     # Open Android Studio
npx cap open ios         # Open Xcode
npx cap run android      # Build and run on Android device/emulator
npx cap run ios          # Build and run on iOS simulator

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run check            # Run svelte-check for type errors
```

## Development Guidelines

### Component Conventions

- Place reusable components in `src/lib/components/`
- Use PascalCase for component filenames: `QuestionCard.svelte`
- Keep components small and focused on a single responsibility

### State Management

- Use Svelte stores (`writable`, `readable`, `derived`) in `src/lib/stores/`
- For complex state, consider using `svelte/store` with custom stores

### Routing

- SvelteKit uses file-based routing in `src/routes/`
- Dynamic routes use `[param]` syntax: `routes/question/[id]/+page.svelte`
- API endpoints go in `routes/api/` as `+server.ts` files

### Mobile-Specific Code

- Use Capacitor plugins for native functionality
- Check platform before using native APIs:
  ```typescript
  import { Capacitor } from '@capacitor/core';
  if (Capacitor.isNativePlatform()) {
    // Native-only code
  }
  ```

### TypeScript

- Define types in `src/lib/types/`
- Use strict TypeScript settings
- Prefer interfaces for object shapes, types for unions/primitives

## API Patterns

### Server Endpoints

```typescript
// src/routes/api/questions/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  // Handle GET request
  return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  // Handle POST request
  return json({ success: true });
};
```

## Environment Variables

- Use `.env` for local development (not committed)
- Prefix public variables with `PUBLIC_` for client access
- Access via `$env/static/private` or `$env/static/public`

## Build & Deployment

### Web

```bash
npm run build
npm run preview  # Preview production build locally
```

### Mobile

1. Build the web app: `npm run build`
2. Sync to native: `npx cap sync`
3. Open IDE: `npx cap open android` or `npx cap open ios`
4. Build/run from the native IDE

## Troubleshooting

- **Capacitor sync issues**: Delete `node_modules`, reinstall, then `npx cap sync`
- **TypeScript errors**: Run `npm run check` for detailed type errors
- **Hot reload not working on mobile**: Use `npx cap run` with `--livereload`
