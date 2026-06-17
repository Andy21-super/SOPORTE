# Despliegue en GitHub + Render

Esta aplicacion se despliega como un solo servicio web: Express sirve la API en `/api` y tambien publica el frontend React compilado.

## 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Preparar despliegue en nube"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## 2. Publicar en Render

1. Entra a Render y conecta tu cuenta de GitHub.
2. Crea un Blueprint nuevo desde este repositorio.
3. Render detectara `render.yaml` y creara el servicio `soporte-tickets`.
4. Cuando termine el deploy, abre:

```text
https://soporte-tickets.onrender.com
```

El health check de la API queda en:

```text
https://soporte-tickets.onrender.com/api/health
```

## 3. Datos importantes

- El servicio usa SQLite en `/var/data/soporte.db`.
- Los adjuntos se guardan en `/var/data/uploads`.
- El disco persistente de Render evita perder base de datos y archivos en reinicios.
- `JWT_SECRET` y `JWT_REFRESH_SECRET` se generan automaticamente desde Render.
- Si cambias el nombre del servicio en Render, actualiza `CORS_ORIGIN` con el nuevo dominio.

## 4. Credenciales iniciales

```text
Correo: admin@empresa.com
Contrasena: Admin123*
```

Despues del primer ingreso, cambia esa contrasena.
