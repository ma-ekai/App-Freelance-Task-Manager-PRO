# Freelance Task Manager PRO
## Documentación completa del proyecto — Portfolio Marisa / maekai.es

---

## 🌐 URLs del Proyecto

- **App en producción:** https://app.taskmanager.maekai.es
- **API pública:** https://api.taskmanager.maekai.es
- **Repositorio GitHub:** https://github.com/ma-ekai/App-Freelance-Task-Manager-PRO

---

## 📋 Descripción

Freelance Task Manager PRO es una aplicación web fullstack diseñada específicamente para profesionales freelance que necesitan gestionar su negocio desde un único lugar. Permite organizar clientes, proyectos y tareas con un sistema de autenticación seguro y aislamiento total de datos por usuario.

La interfaz sigue una estética minimalista en tonos **Mint Green y Anthracite**.

---

## 🏗️ Arquitectura del Sistema

┌─────────────────────────────────────────────────────┐ │ INTERNET │ └──────────────────────┬──────────────────────────────┘ │ HTTPS ┌──────────────────────▼──────────────────────────────┐ │ EasyPanel / Traefik (Proxy) │ │ maekai.es │ └──────┬──────────────────────────┬───────────────────┘ │ │ ┌──────▼──────────┐ ┌──────────▼──────────┐ │ FRONTEND │ │ BACKEND │ │ app.taskmanager│ │ api.taskmanager │ │ .maekai.es │ │ .maekai.es │ │ React + Nginx │ │ Node.js + Express │ │ Puerto: 80 │ │ Puerto: 4000 │ └─────────────────┘ └──────────┬──────────┘ │ ┌──────────▼──────────┐ │ BASE DE DATOS │ │ db-taskmanager │ │ PostgreSQL 17 │ │ Puerto: 5432 │ └─────────────────────┘


---

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS
- React Router DOM v6
- React Hook Form + Zod
- Axios

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL 17
- JWT (Access Token + Refresh Token)
- Bcrypt
- Helmet + Express Rate Limit
- Cookie Parser

### Infraestructura
- Docker + Nginx
- VPS Hostinger
- EasyPanel (panel de despliegue)
- Let's Encrypt (SSL automático)

---

## 🗄️ Modelo de Datos

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  clients       Client[]
  projects      Project[]
  tasks         Task[]
}

model Client {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  name      String
  company   String?
  email     String?
  phone     String?
  notes     String?
  createdAt DateTime  @default(now())
  projects  Project[]
  tasks     Task[]
}

model Project {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  clientId    String?
  client      Client?   @relation(fields: [clientId], references: [id])
  name        String
  description String?
  status      String    @default("active") // active, paused, closed
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  tasks       Task[]
}

model Task {
  id               String    @id @default(uuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id])
  projectId        String?
  project          Project?  @relation(fields: [projectId], references: [id])
  clientId         String?
  client           Client?   @relation(fields: [clientId], references: [id])
  title            String
  description      String?
  category         String?
  priority         String    @default("medium") // low, medium, high, critical
  status           String    @default("todo") // todo, doing, blocked, review, done
  dueDate          DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

🔐 Sistema de Autenticación
Implementa un patrón de doble token JWT:

Access Token: Corta duración, almacenado en localStorage
Refresh Token: 7 días, almacenado en cookie httpOnly (inaccesible desde JavaScript, protegido contra XSS)
En producción: cookie marcada como Secure (HTTPS only) y SameSite=Strict
📡 Endpoints de la API REST
Método	Ruta	Descripción	Auth
POST	/auth/register	Registro de nuevo usuario	❌
POST	/auth/login	Login y generación de tokens	❌
POST	/auth/refresh	Renovar Access Token	❌
POST	/auth/logout	Cerrar sesión y limpiar cookie	✅
GET/POST	/clients	Listar y crear clientes	✅
GET/PUT/DELETE	/clients/:id	Gestionar cliente específico	✅
GET/POST	/projects	Listar y crear proyectos	✅
GET/PUT/DELETE	/projects/:id	Gestionar proyecto específico	✅
GET/POST	/tasks	Listar y crear tareas	✅
GET/PUT/DELETE	/tasks/:id	Gestionar tarea específica	✅
GET	/health	Healthcheck del servidor	❌
🔒 Seguridad Implementada
Helmet: Cabeceras HTTP seguras
Rate Limiting:
/auth: 10 peticiones/minuto (anti brute force)
Resto de rutas: 100 peticiones/15 minutos
CORS: Solo acepta peticiones desde el dominio del frontend
Bcrypt: Hash de contraseñas con salt rounds
httpOnly cookies: Refresh token inaccesible desde JavaScript
🚀 Infraestructura de Despliegue
Servicio	Nombre en EasyPanel	Dominio	Puerto
Frontend	app-taskmanager	app.taskmanager.maekai.es	80
Backend	api-taskmanager	api.taskmanager.maekai.es	4000
Base de datos	db-taskmanager	seguimiento-workana_db-taskmanager	5432
Proyecto EasyPanel: seguimiento-workana VPS: Hostinger Panel: EasyPanel (licencia gratuita)

⚙️ Variables de Entorno
Backend (api-taskmanager)
DATABASE_URL=postgres://postgres:PASSWORD@seguimiento-workana_db-taskmanager:5432/freelance_db?sslmode=disable
JWT_SECRET=maekai-taskmanager-jwt-secret-2026
JWT_REFRESH_SECRET=maekai-taskmanager-refresh-secret-2026
PORT=4000
NODE_ENV=production
APP_URL=https://app.taskmanager.maekai.es
Frontend (app-taskmanager)
VITE_API_URL=https://api.taskmanager.maekai.es
✅ Funcionalidades Fase 1
Registro e inicio de sesión de usuarios
Autenticación JWT con doble token (Access + Refresh)
Dashboard con resumen de clientes, proyectos y tareas
Gestión completa de clientes (CRUD)
Gestión completa de proyectos con estados
Gestión completa de tareas con prioridades y estados
Rutas protegidas con redirección automática
Aislamiento total de datos por usuario
Interfaz responsive con diseño Mint Green
🧩 Fases del Proyecto
Fase	Descripción	Estado
Fase 1	Base fullstack + Auth + CRUD	✅ Completada
Fase 2	Kanban + Calendario + Subtareas + Dashboard real	🔜 Pendiente
Fase 3	Recordatorios por email (cron + idempotencia)	🔜 Pendiente
Fase 4	Time tracking + métricas freelancer	🔜 Pendiente
Fase 5	Import/Export CSV + backups	🔜 Pendiente
🐛 Retos Técnicos Resueltos en Fase 1
Durante el despliegue se resolvieron varios retos técnicos relevantes que son útiles documentar para futuras fases:

1. Permisos de binarios en Docker (Windows → Linux) Al construir la imagen en Windows, los binarios de node_modules/.bin/ perdían el bit de ejecución al copiarse al contenedor Linux. Solución: chmod +x node_modules/.bin/vite en el Dockerfile y .dockerignore para excluir node_modules locales.

2. Inyección de variables de entorno en Vite Las variables VITE_* deben estar disponibles en tiempo de build, no en tiempo de ejecución. Solución: declarar ENV VITE_API_URL=https://api.taskmanager.maekai.es directamente en el Dockerfile antes del RUN npm run build.

3. CORS en producción con subdominios separados El frontend y backend usan subdominios independientes. Solución: configurar APP_URL en las variables de entorno del backend y añadir credentials: true en la configuración de CORS.

4. Migraciones de Prisma en producción El binario de Prisma tampoco tenía permisos de ejecución. Solución: chmod +x node_modules/.bin/prisma y ejecutar npx prisma db push manualmente desde la consola Bash de EasyPanel para la creación inicial de tablas.

💻 Desarrollo Local
Requisitos
Docker & Docker Compose
Node.js 18+
Configuración
Copycp .env.example .env
docker-compose up --build
URLs locales
Frontend: http://localhost:5173
Backend: http://localhost:4000
PostgreSQL: localhost:5432
Migraciones manuales
Copycd backend
npx prisma migrate dev --name init
Seed de datos de prueba
Copycd backend
npm run prisma:seed

---

Guarda con **Ctrl + S** y luego haz el push:

```cmd
git add README.md
Copygit commit -m "docs: documentación completa Fase 1 para portfolio"