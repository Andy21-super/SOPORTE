# Manual tecnico

## Arquitectura

El sistema esta desacoplado en tres capas:

- Frontend React/Vite en `frontend`.
- Backend Express/Socket.IO en `backend`.
- Base de datos SQLite gestionada por Prisma.

La comunicacion entre frontend y backend se realiza por API REST. Los cambios operativos se publican por Socket.IO.

## Seguridad

- JWT para acceso.
- Refresh token persistido en sesiones.
- RBAC por permisos.
- Helmet, CORS y rate limiting.
- Validacion Zod en endpoints criticos.
- Bcrypt para contrasenas.
- Auditoria de login, creacion, cambios y reapertura.

## Patrones

- Rutas desacopladas por modulo.
- Servicios de dominio para tickets, auditoria, notificaciones y correo.
- Prisma como repositorio transaccional.
- DTO/validadores con Zod.
- Middlewares para autenticacion, permisos y errores.

## Comandos

```bash
npm install
copy backend\.env.example backend\.env
npm run migrate
npm run seed
npm run dev
```

## Produccion

Configurar secretos largos en `.env`, SMTP real, CORS con dominio final y migrar a PostgreSQL para alta concurrencia.
