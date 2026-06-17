# API REST

Base URL local: `http://localhost:4000/api`

## Autenticacion

`POST /auth/login`

```json
{
  "email": "admin@empresa.com",
  "password": "Admin123*"
}
```

Respuesta: `accessToken`, `refreshToken` y perfil con rol, cargo, area y modulos.

## Catalogos

`GET /catalogs`

Devuelve modulos, categorias, prioridades, estados y roles.

## Tickets

`GET /tickets` lista tickets.

`POST /tickets` crea ticket.

```json
{
  "moduleId": "...",
  "categoryId": "...",
  "priorityId": "...",
  "subject": "Error en ERP",
  "description": "Detalle completo de la incidencia"
}
```

`GET /tickets/:id` obtiene detalle con comentarios.

`PATCH /tickets/:id` actualiza estado, prioridad o asignado.

`POST /tickets/:id/comments` registra comentario. Si `noSolucionado` es `true`, el ticket se reabre automaticamente.

```json
{
  "message": "Intente la solucion propuesta y el problema continua",
  "noSolucionado": true
}
```

## Dashboard

`GET /dashboard` devuelve KPIs ejecutivos.

## Reportes

`GET /reports/tickets.csv` exporta CSV.

## Socket.IO

Eventos emitidos:

- `ticket:created`
- `ticket:updated`
- `comment:new`
- `notification:new`

Salas:

- `user:join`
- `ticket:join`
