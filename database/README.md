# Base de datos

La base inicial usa SQLite mediante Prisma:

```env
DATABASE_URL="file:./dev.db"
```

Para migrar a PostgreSQL:

1. Cambiar `provider = "postgresql"` en `backend/prisma/schema.prisma`.
2. Usar una URL PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/soporte"
```

3. Ejecutar:

```bash
npm --workspace backend run prisma:migrate
npm --workspace backend run prisma:seed
```
