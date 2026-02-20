# Freelance Task Manager PRO - Phase 1

A full-stack task management application designed for freelancers. Built with a clean **Mint Green** aesthetic and strict user isolation.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **ORM**: Prisma + PostgreSQL
- **Auth**: JWT (Access + Refresh) + Bcrypt
- **Validation**: Zod (Backend) + React Hook Form (Frontend)
- **Deployment**: Docker + Docker Compose

## Local Development

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (version 18+)

### 2. Environment Setup
Create a `.env` file in the root based on `.env.example`:
```bash
cp .env.example .env
```

### 3. Spin up with Docker
```bash
docker-compose up --build
```
This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Postgres**: localhost:5432

### 4. Database Migrations (Manual)
If you need to run migrations manually from the `backend` folder:
```bash
cd backend
npx prisma migrate dev --name init # For development
npm run prisma:deploy              # For production
```

## Deployment on VPS (EasyPanel - Docker)

1. **Host on Github**: Push this repository to your private/public Github repo.
2. **EasyPanel Setup**:
   - Create a new Project in EasyPanel.
   - Add a **PostgreSQL** service and copy the connection string.
   - Add a **Service** from Github.
   - Select the repository.
   - Select **Docker Compose** as the deployment type (EasyPanel supports this).
3. **Environment Variables**:
   Set the following variables in EasyPanel:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A long random string.
   - `JWT_REFRESH_SECRET`: Another long random string.
   - `APP_URL`: Your production URL (e.g., https://tasks.yourdomain.com).
   - `PORT_BACKEND`: 4000
   - `PORT_FRONTEND`: 80 (The frontend Dockerfile uses Nginx on port 80).

> [!NOTE]
> The backend is configured to automatically run `prisma migrate deploy` upon startup in the production container. No manual migration step is required in EasyPanel.

## Authentication Workflow (Production)
Upon deployment:
1. **Domains**: Ensure `APP_URL` (Backend CORS) and `VITE_API_URL` (Frontend API) are correctly set.
2. **Persistence**:
   - **Access Token**: Stored in `localStorage` for rapid client-side access.
   - **Refresh Token**: Stored in a **secure, httpOnly cookie**. This prevents XSS attacks from stealing the long-lived token.
3. **Domain Security**: In production, the cookie is marked as `Secure` (HTTPS only) and `SameSite=Strict`.

## Technical Features

### Healthchecks
Both **Backend** and **Frontend** services include Docker healthchecks:
- **Backend**: Verifies the `/health` endpoint is reachable.
- **Frontend**: Confirms the Nginx/Vite server is serving the application.
- Status can be checked via `docker compose ps`.

### Security
The application includes several security layers:
- **Helmet**: Secures the app by setting various HTTP headers.
- **Express Rate Limit**: 
  - Strict limit on `/auth` (10 requests/min) to prevent brute force.
  - General limit on all other routes (100 requests/15 mins).
- **Prisma Studio**: Only intended for development. It is not exposed to the public web in the production Docker configuration.

### Demo Data (Seeding)
You can populate your local database with demo data (User, Client, Project, Tasks):
1. Ensure the database is running.
2. Run the seed command from the `backend` folder:
```bash
cd backend
npm run prisma:seed
```
> [!IMPORTANT]
> The seed script uses `upsert` for the user but creates new clients/projects. Running it multiple times will create duplicate records for clients/projects.

## Project Structure
- `/frontend`: React client code, Tailwind config, components, and pages.
- `/backend`: Express server, Prisma schema, auth logic, and CRUD controllers.
- `docker-compose.yml`: Local orchestration.
