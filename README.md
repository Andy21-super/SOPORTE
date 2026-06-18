# SOPORTE - Sistema Enterprise de Tickets

Proyecto `01-tickets-system`: plataforma web desacoplada para gestionar incidencias, SLA, usuarios, roles, modulos, notificaciones, auditoria y reportes.

## Estructura

```text
frontend/  React 19 + Vite + TypeScript + Material UI
backend/   Node.js + Express + TypeScript + Prisma + Socket.IO
database/  Base SQLite local y notas de migracion PostgreSQL
docs/      Manual tecnico, usuario, API y diagramas Mermaid
docker/    Dockerfiles
```

## Requisitos

- Node.js 22 LTS o superior. En esta maquina se valido con Node.js 24.16.0.
- npm 10 o superior

## Ejecucion local

Opcion rapida en Windows:

```bash
INICIAR_LOCAL.bat
```

Opcion manual:

```bash
cd %USERPROFILE%\Documents\SOPORTE\01-tickets-system
npm install
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run db:init
npm run seed
npm run dev
```

Si Prisma muestra `Schema engine error` al aplicar SQLite, usa el fallback incluido:

```bash
npm --workspace backend run sqlite:init
npm run seed
npm run dev
```

Si Windows no reconoce `node` o `npm`, cierra y abre la terminal. El lanzador `INICIAR_LOCAL.bat` tambien agrega temporalmente `C:\Program Files\nodejs` al PATH.

Frontend: http://localhost:5173  
Backend: http://localhost:4000/api/health

## Credenciales iniciales

- Usuario: `CD.ADMIN`
- Contrasena: ingresa la clave asignada al administrador

## Nota del equipo actual

Al momento de generar el proyecto, `node` y `npm` no estaban instalados en esta maquina. El codigo queda listo, pero la instalacion y ejecucion local requieren Node.js 22 LTS.

## Docker

```bash
cd %USERPROFILE%\Documents\SOPORTE\01-tickets-system
docker compose up --build
```
