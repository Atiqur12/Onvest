# Onvest

Digital KYC and investor onboarding platform for European fund managers.

## Stack

- **Backend:** NestJS + TypeORM + MySQL 8
- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui
- **Auth:** Clerk
- **Storage:** AWS S3
- **AI:** Anthropic Claude API (Opus 4.7)
- **Email:** Resend

## Monorepo layout

```
apps/
  api/        NestJS backend
  web/        Next.js frontend (added in a later phase)
packages/
  shared/     Shared TS types/enums
```

## Local setup

1. Install dependencies (from repo root):

   ```bash
   npm install
   ```

2. Start MySQL (requires Docker Desktop running):

   ```bash
   npm run db:up
   ```

   Adminer is available at <http://localhost:8080> (server `mysql`, user `onvest`, password `onvest_pw`).

3. Copy env and fill in keys as you wire each integration:

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

4. Run migrations (after they exist):

   ```bash
   npm run api:migration:run
   ```

5. Start the API in dev mode:

   ```bash
   npm run api:dev
   ```

## Useful root scripts

| script | purpose |
| --- | --- |
| `npm run db:up` / `db:down` / `db:logs` | manage MySQL container |
| `npm run api:dev` / `api:build` | NestJS dev / build |
| `npm run api:migration:run` | run pending TypeORM migrations |
| `npm run shared:build` | build the `@onvest/shared` package |
