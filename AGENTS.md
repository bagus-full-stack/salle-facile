# SalleFacile AI Agent Guide

This guide outlines the architecture, workflows, and conventions for the SalleFacile project, a platform for booking rooms and spaces.

## 1. Project Structure & Architecture

**Monorepo Structure:**
- `backend/`: NestJS (v11) API server.
- `frontend/`: Angular (v21) standalone application.
- `sallefacile-data/`: Local PostgreSQL data storage (ensure this directory structure is respected if managing DB containers).

**Backend (NestJS):**
- **Architecture**: Modular monolith. Feature modules (`UsersModule`, `RoomsModule`, `AuthModule`) encapsulate domain logic.
- **Database**: PostgreSQL accessed via **Prisma ORM**.
  - **Schema**: `backend/prisma/schema.prisma` is the source of truth for data models.
  - **Service**: `PrismaService` is provided globally via `SharedModule`.
- **Authentication**: JWT-based (Passport). Supports Google/LinkedIn OAuth via strategies.
  - **Important**: Ensure `AuthModule` is imported in `AppModule` to activate auth routes.
- **Templating**: Handlebars (`.hbs`) used for emails (located in `backend/src/templates`).

**Frontend (Angular):**
- **Architecture**: Standalone Components (no `AppModule`).
- **State Management**: **Signals** are the primary reactive primitive (e.g., `currentUser = signal(...)` in `AuthService`).
- **Styling**: TailwindCSS configured via `tailwind.config.js`.
- **Routing**: Defined in `app.routes.ts`, protected by functional guards (`authGuard`, `adminGuard`).

## 2. critical Developer Workflows

### Backend
- **Start Dev Server**: `npm run start:dev` (Runs on port 3000).
- **Database Migrations**:
  - `npx prisma migrate dev`: Apply schema changes interactively.
  - `npx prisma studio`: GUI for browsing data.
- **Testing**: `npm run test` (Jest) or `npm run test:e2e`.

### Frontend
- **Start Dev Server**: `npm start` (Runs on `http://localhost:4200`).
- **Code Generation**: Use Angular CLI `ng generate component features/<feature-name>/<component-name>` to maintain directory structure.

## 3. Conventions & Patterns

**Data Flow & API:**
- **Endpoint Pattern**: Frontend services (`core/auth/auth.service.ts`) hardcode `http://localhost:3000`.
- **Auth Flow**:
  1. Login/Register -> Returns JWT `access_token`.
  2. Frontend stores token in `localStorage`.
  3. OAuth callbacks redirect to `/oauth/callback?token=...`.
  4. Services must check `isPlatformBrowser` before accessing `localStorage` (SSR compatibility).

**Backend Module Registration:**
- **Explicit Imports**: All feature modules must be imported in `backend/src/app.module.ts`.
  - *Note*: Verify `AuthModule` is present in `imports` array if auth routes return 404.

**Frontend Signals:**
- Prefer `signal()`, `computed()`, and `effect()` over RxJS `BehaviorSubject` for local component state.
- Use `inject()` for dependency injection instead of constructor arguments.

## 4. Key Files
- **Data Model**: `backend/prisma/schema.prisma`
- **Main Module**: `backend/src/app.module.ts`
- **Frontend Routes**: `frontend/src/app/app.routes.ts`
- **Auth Service**: `frontend/src/app/core/auth/auth.service.ts`
- **Styling Config**: `frontend/tailwind.config.js`

