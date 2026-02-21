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

## 🗏️ Arquitectura del Sistema

INTERNET | | HTTPS v EasyPanel / Traefik (Proxy) maekai.es | |---------------------| v v FRONTEND BACKEND app.taskmanager api.taskmanager .maekai.es .maekai.es React + Nginx Node.js + Express Puerto: 80 Puerto: 4000 | v BASE DE DATOS db-taskmanager PostgreSQL 17 Puerto: 5432


---

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS
- React Router DOM v6
- React Hook Form + Zod
- Axios
- @hello-pangea/dnd (drag & drop Kanban)
- Lucide React (iconografía)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL 17
- JWT (Access Token 24h + Refresh Token 7d)
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
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  clients      Client[]
  projects     Project[]
  tasks        Task[]
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
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  projectId   String?
  project     Project?  @relation(fields: [projectId], references: [id])
  clientId    String?
  client      Client?   @relation(fields: [clientId], references: [id])
  title       String
  description String?
  category    String?
  priority    String    @default("medium") // low, medium, high, critical
  status      String    @default("todo")   // todo, doing, blocked, review, done
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  subtasks    Subtask[]
}

model Subtask {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title     String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
🔐 Sistema de Autenticación
Implementa un patrón de doble token JWT:

Access Token: 24 horas de duración, almacenado en localStorage
Refresh Token: 7 días, almacenado en cookie httpOnly (inaccesible desde JavaScript, protegido contra XSS)
En producción: cookie marcada como Secure (HTTPS only) y SameSite=None (necesario para subdominios cruzados)
Interceptor Axios para renovación automática del token expirado
📡 Endpoints de la API REST
Método	Ruta	Descripción	Auth
POST	/auth/register	Registro de nuevo usuario	❌
POST	/auth/login	Login y generación de tokens	❌
POST	/auth/refresh	Renovar Access Token	❌
POST	/auth/logout	Cerrar sesión y limpiar cookie	✅
GET	/auth/me	Datos del usuario autenticado	✅
GET/POST	/clients	Listar y crear clientes	✅
GET/PATCH/DELETE	/clients/:id	Gestionar cliente específico	✅
GET/POST	/projects	Listar y crear proyectos	✅
GET/PATCH/DELETE	/projects/:id	Gestionar proyecto específico	✅
GET/POST	/tasks	Listar y crear tareas (paginado)	✅
GET/PATCH/DELETE	/tasks/:id	Gestionar tarea específica	✅
PATCH	/tasks/:id/status	Actualizar solo el estado (Kanban)	✅
GET	/tasks/kanban	Tareas agrupadas por columna	✅
GET/POST	/tasks/:id/subtasks	Listar y crear subtareas	✅
PATCH/DELETE	/tasks/:id/subtasks/:sid	Gestionar subtarea específica	✅
GET	/dashboard/summary	Métricas del dashboard	✅
GET	/health	Healthcheck del servidor	❌
🔒 Seguridad Implementada
Helmet: Cabeceras HTTP seguras
Rate Limiting:
/auth: 10 peticiones/minuto (anti brute force)
Resto de rutas: 100 peticiones/15 minutos
CORS: Solo acepta peticiones desde el dominio del frontend
Bcrypt: Hash de contraseñas con salt rounds
httpOnly cookies: Refresh token inaccesible desde JavaScript
SameSite=None + Secure: Compatibilidad entre subdominios en producción
🚀 Infraestructura de Despliegue
Servicio	Nombre en EasyPanel	Dominio	Puerto
Frontend	app-taskmanager	app.taskmanager.maekai.es	80
Backend	api-taskmanager	api.taskmanager.maekai.es	4000
Base de datos	db-taskmanager	seguimiento-workana_db-taskmanager	5432
Proyecto EasyPanel: seguimiento-workana
VPS: Hostinger
Panel: EasyPanel (licencia gratuita)
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
✅ Funcionalidades Fase 1 — Base Fullstack + Auth + CRUD
Registro e inicio de sesión de usuarios
Autenticación JWT con doble token (Access + Refresh)
Dashboard con resumen estático de clientes, proyectos y tareas
Gestión completa de clientes (CRUD)
Gestión completa de proyectos con estados
Gestión completa de tareas con prioridades y estados
Rutas protegidas con redirección automática
Aislamiento total de datos por usuario
Interfaz responsive con diseño Mint Green
✅ Funcionalidades Fase 2 — Kanban + Dashboard Real + Subtareas
Tablero Kanban con 5 columnas: To Do, Doing, Blocked, Review, Done
Drag & drop entre columnas con persistencia inmediata en base de datos
Crear, editar y eliminar tareas directamente desde el tablero Kanban
Prioridades con colores en las tarjetas (Critical, High, Medium, Low)
Edición de clientes con modal de edición inline y botones hover
Edición de proyectos con cambio de estado (Active/Paused/Closed)
Eliminación de clientes y proyectos con confirmación
Dashboard con datos reales conectado a la API:
Total de clientes
Proyectos activos
Tareas pendientes (todo + doing + blocked + review)
Tareas completadas
Tareas vencidas (overdue)
Porcentaje de finalización
Auto-refresh del dashboard cada 30 segundos
Modelo Subtask en base de datos con endpoints CRUD completos
Token de acceso extendido a 24 horas
Cookie SameSite=None para compatibilidad entre subdominios
prisma db push automático en cada deploy
🧩 Fases del Proyecto
Fase	Descripción	Estado
Fase 1	Base fullstack + Auth + CRUD	✅ Completada
Fase 2	Kanban + Dashboard real + Subtareas + Edit/Delete	✅ Completada
Fase 3	Recordatorios por email (cron + idempotencia)	📜 Pendiente
Fase 4	Time tracking + métricas freelancer	📜 Pendiente
Fase 5	Import/Export CSV + backups	📜 Pendiente
🐛 Retos Técnicos Resueltos
Fase 1
Permisos de binarios en Docker (Windows → Linux): Los binarios de node_modules/.bin/ perdían el bit de ejecución. Solución: chmod +x en el Dockerfile y .dockerignore para excluir node_modules locales.
Inyección de variables de entorno en Vite: Las variables VITE_* deben estar disponibles en tiempo de build. Solución: declarar ENV VITE_API_URL directamente en el Dockerfile.
CORS en producción con subdominios separados: Solución: configurar APP_URL en las variables de entorno del backend con credentials: true.
Migraciones de Prisma en producción: Solución: prisma db push desde la consola Bash de EasyPanel.
Fase 2
Dependencias de Fase 2 no incluidas en package.json: @hello-pangea/dnd no estaba declarado. Solución: añadir todas las dependencias nuevas al frontend/package.json antes del deploy.
Caché de Docker en capas de Prisma: El cliente Prisma se generaba con el schema antiguo por caché. Solución: añadir && echo "schema-v2-subtask" al comando de generación para invalidar la capa.
Modelo Subtask no reconocido por TypeScript: El tipo PrismaClient no incluía subtask porque el schema actualizado aún no había sido procesado. Solución: cast new PrismaClient() as any en el controller de subtareas.
Rutas PUT vs PATCH: Los controllers originales usaban PUT pero el frontend enviaba PATCH. Solución: registrar ambos métodos en las rutas de clientes y proyectos.
SameSite=Strict bloqueaba la cookie entre subdominios: Solución: cambiar a SameSite=None; Secure en el controlador de autenticación.
start.sh con saltos de línea Windows (CRLF): Causaba error /bin/sh: not found en el contenedor Linux. Solución: eliminar start.sh y usar CMD ["sh", "-c", "..."] directamente en el Dockerfile.
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
Migraciones
Copycd backend
npx prisma db push

Guarda con **Ctrl+S** y ejecuta:

```powershell
cd "C:\Users\maris\Documents\Antigravity\App-Freelance Task Manager PRO"
git add README.md
git commit -m "docs: update README with Phase 2 complete documentation"
git push