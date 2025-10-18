# Backend - Eliminatoria

API backend para la plataforma Eliminatoria. Proporciona endpoints para autenticación, gestión de usuarios, cultivos, labores agrícolas, lotes, reportes y alertas.

## Tabla de contenido
- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Migraciones y base de datos](#migraciones-y-base-de-datos)
- [Estructura principal del proyecto](#estructura-principal-del-proyecto)
- [Scripts útiles](#scripts-útiles)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Contacto](#contacto)

## Descripción
Servicio RESTful en Node.js que expone las rutas necesarias para que el frontend interactúe con la lógica de negocio y la base de datos. Incluye autenticación, control de permisos y endpoints para crear/consultar/editar recursos relacionados con la gestión agrícola.

## Stack tecnológico
- Node.js
- Express (o framework HTTP leve)
- ORM/Acceso SQL (configurado en `src/config/database.js`)
- Base de datos relacional (migraciones en `db/migrations/`)
- JSON Web Tokens para autenticación
- Socket / eventos (si aplica) en `src/socket.js`

## Requisitos
- Node.js v16+ (recomendado v18+)
- npm o pnpm/yarn
- Servidor de base de datos (Postgres / MySQL u otro, según configuración)

## Instalación y ejecución
1. Clona el repositorio (si aplica) y entra en la carpeta del backend:
```bash
cd Backend_Eliminatoria
```
2. Instala dependencias:
```bash
npm install
```
3. Configura las variables de entorno (ver siguiente sección).
4. Ejecuta en modo desarrollo:
```bash
npm run dev
```
5. Ejecuta en producción (con build si aplica):
```bash
npm run start
```

## Variables de entorno
Crea un archivo `.env` en la raíz del backend con al menos las variables básicas. Ejemplo:
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=usuario
DB_PASSWORD=password
DB_NAME=eliminatoria
JWT_SECRET=tu_secreto_jwt
```
Revisa `src/config/database.js` para ver las variables exactas usadas por el proyecto.

Hay un archivo `Backend_Eliminatoria/.env.example` con ejemplos que puedes copiar a `.env` y completar con tus valores reales. No subas `.env` al repositorio.

## Migraciones y base de datos
- Las migraciones SQL están en `db/migrations/`.
- Ejecuta las migraciones con el script correspondiente en `package.json` o usando la herramienta que se haya configurado (knex, sequelize-cli, script personalizado). Revisa `package.json` para el comando exacto.
- Si hay scripts de utilidad en `tools/`, pueden ayudar a ejecutar migraciones o pruebas contra la base de datos.

## Estructura principal del proyecto
- src/
  - app.js — configuración central de Express y middlewares
  - index.js — arranque del servidor
  - socket.js — lógica de sockets (si aplica)
  - config/
    - database.js — configuración de conexión a la DB
  - controllers/ — controladores por recurso
  - models/ — modelos de datos
  - routes/ — definición de rutas y endpoints
  - middleware/ — autenticación, permisos y validaciones
- db/migrations/ — scripts SQL de migración
- tools/ — utilidades y scripts (migraiones, consultas, etc.)

## Scripts útiles
Consulta `package.json` para la lista exacta. Comandos típicos:
```bash
npm run dev       # levantar servidor en modo desarrollo
npm run build     # compilar (si aplica)
npm run start     # iniciar en producción
npm run migrate   # ejecutar migraciones (si está definido)
npm run lint      # análisis de código
npm run test      # ejecutar tests
```

## Despliegue
- Configura las variables de entorno en el entorno de producción.
- Asegura la conexión a la base de datos y aplica migraciones antes de levantar el servicio.
- Considera usar PM2, systemd o contenedores (Docker) para gestionar procesos en producción.

## Contribución
- Respetar convenciones de código y linters del repositorio.
- Abrir PRs pequeños con descripción clara de cambios.
- Añadir tests cuando se modifica lógica crítica.
- Documentar cambios en migraciones o en la API.

## Notas
- El frontend (`Frontend-Eliminatoria`) consume esta API; verificar que `NEXT_PUBLIC_API_URL` apunte al backend correcto.
- Revisa `src/middleware/auth.middleware.js` y `src/middleware/checkPermission.js` para entender la gestión de permisos y roles.

## Contacto
Para dudas o problemas: revisar controladores y rutas en `src/controllers/` y `src/routes/`, o contactar al equipo responsable del repositorio.
