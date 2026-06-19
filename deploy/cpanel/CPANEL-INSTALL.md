# Instalacion en cPanel

## Requisito

El hosting debe incluir **Setup Node.js App** (Passenger/CloudLinux) con Node.js 20 o 22. Un hosting que solo permita PHP y archivos estaticos no puede ejecutar este backend.

## Rutas recomendadas

- Application root: `soporte-app`
- Application URL: el dominio o subdominio elegido, por ejemplo `https://soporte.sudominio.com`
- Application startup file: `app.js`
- Node.js version: 22 (20 como minimo)
- Application mode: Production

No coloque `data`, `uploads` ni `backups` dentro de `public_html`. El dominio debe apuntar a la aplicacion Node creada en cPanel.

## Pasos

1. Cree el subdominio que usara para soporte.
2. Abra **Setup Node.js App** y cree la aplicacion con los valores anteriores.
3. Desde **File Manager**, abra la carpeta `soporte-app`, cargue el ZIP y extraigalo alli.
4. Confirme que `app.js` y `package.json` quedaron directamente dentro de `soporte-app`, no dentro de una carpeta adicional.
5. En **Setup Node.js App**, pulse **Run NPM Install**.
6. Agregue las variables de `.env.example`, sustituyendo `USUARIO`, dominio y secretos.
7. Verifique permisos de escritura `0755` para `data`, `uploads` y `backups`. El archivo `data/soporte.db` debe ser escribible por la aplicacion.
8. Pulse **Restart Application**.
9. Compruebe `https://SU_DOMINIO/api/health`. Debe responder `{"ok":true,"service":"tickets-system-api"}`.

## SQLite y archivos persistentes

- Base principal: `data/soporte.db`
- Logos y adjuntos: `uploads/`
- Backup JSONL por cada ticket: `backups/tickets-AAAA-MM-DD.jsonl`

Antes de reemplazar una version, descargue esas tres rutas. Para actualizar codigo, no sobrescriba `data`, `uploads` ni `backups`.

## Acceso inicial

- Usuario: `CD.ADMIN`
- La contrasena se introduce manualmente en el formulario y no queda escrita en el frontend.

## Diagnostico

- Error 503: revise el log de Passenger y que `app.js` sea el startup file.
- Prisma no encontrado: ejecute nuevamente **Run NPM Install**.
- Base de solo lectura: corrija permisos de `data` y `data/soporte.db`.
- Pantalla sin datos: confirme que la URL termina en `/api/health` y que no existe un proxy apuntando a Render.
