# Backend - Eliminatoria

API backend para el Sistema de Agricultura de Precisión. Proporciona endpoints RESTful y comunicación en tiempo real mediante WebSockets para la gestión completa de operaciones agrícolas.

## Tabla de contenido
- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Migraciones y base de datos](#migraciones-y-base-de-datos)
- [Estructura principal del proyecto](#estructura-principal-del-proyecto)
- [Endpoints principales](#endpoints-principales)
- [Scripts útiles](#scripts-útiles)
- [Herramientas adicionales](#herramientas-adicionales)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Contacto](#contacto)

## Descripción
Servicio RESTful construido con Node.js y Express que gestiona toda la lógica de negocio para un sistema de agricultura de precisión. Incluye autenticación JWT, control de roles y permisos, gestión de cultivos, lotes, labores agrícolas, trabajadores, reportes y sistema de alertas en tiempo real.

## Características principales
- ✅ **Autenticación y autorización** con JWT y control de roles (Administrador, Supervisor, Operario)
- ✅ **Gestión de cultivos y lotes** con ubicación GPS y área en hectáreas
- ✅ **Registro de labores agrícolas** con seguimiento de trabajadores y producción
- ✅ **Sistema de alertas en tiempo real** mediante Socket.IO
- ✅ **Dashboard de producción diaria** con métricas y estadísticas
- ✅ **Generación de reportes** en PDF y Excel (ExcelJS, PDFKit)
- ✅ **Integración con IA** mediante Google GenAI para análisis predictivo
- ✅ **Validación de datos** con express-validator

## Stack tecnológico
- **Runtime:** Node.js v18+
- **Framework:** Express v5.1.0
- **Base de datos:** MySQL 8+ (InnoDB)
- **ORM/Driver:** mysql2 v3.15.2
- **Autenticación:** JSON Web Tokens (jsonwebtoken v9.0.2) + bcryptjs v3.0.2
- **WebSockets:** Socket.IO v4.8.1 para alertas en tiempo real
- **Generación de reportes:** 
  - ExcelJS v4.4.0 (archivos Excel)
  - PDFKit v0.17.2 (archivos PDF)
- **IA:** Google GenAI v1.25.0
- **Validación:** express-validator v7.0.1
- **Seguridad:** CORS v2.8.5

## Requisitos
- Node.js v18+ (recomendado LTS)
- npm v8+ o pnpm/yarn
- MySQL 8.0+ o MariaDB 10.5+
- Git (para clonar el repositorio)

## Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/juansito17/Backend_Eliminatoria.git
cd Backend_Eliminatoria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Configurar la base de datos
Ejecuta el script de esquema SQL para crear las tablas:
```bash
# En MySQL
mysql -u tu_usuario -p agricultura_db < esquema.sql
```
O ejecuta las migraciones con los scripts en `tools/`:
```bash
node tools/run_migration.js
# o de forma segura
node tools/run_migration_safe.js
```

### 5. Ejecutar en modo desarrollo
```bash
npm run dev
```
El servidor estará disponible en `http://localhost:3000` (o el puerto configurado en `.env`).

### 6. Ejecutar en producción
```bash
npm start
```

## Variables de entorno
Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```bash
# Puerto del servidor
PORT=3000

# Configuración de base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=agricultura_db

# Seguridad
JWT_SECRET=tu_secreto_jwt_muy_largo_y_aleatorio
NODE_ENV=development

# Google GenAI (opcional)
GOOGLE_API_KEY=tu_api_key_de_google_genai
```

**Notas importantes:**
- **NO** subas el archivo `.env` al repositorio (ya está en `.gitignore`)
- Puedes usar `ENVIRONMENT_EXAMPLES.md` como referencia
- `JWT_SECRET` debe ser una cadena larga y aleatoria (mínimo 32 caracteres)
- En producción, usa variables de entorno del sistema o servicios de gestión de secretos

## Migraciones y base de datos

### Esquema de base de datos
El archivo `esquema.sql` contiene el esquema completo de la base de datos con las siguientes tablas:
- **roles:** Roles de usuarios (Administrador, Supervisor, Operario)
- **usuarios:** Información de usuarios y credenciales
- **cultivos:** Tipos de cultivos (papa, café, plátano, etc.)
- **lotes:** Parcelas o lotes de la finca con ubicación GPS
- **trabajadores:** Personal de la finca
- **labores_tipos:** Tipos de labores agrícolas (siembra, riego, fertilización, etc.)
- **labores_agricolas:** Registro de labores realizadas
- **alertas:** Sistema de notificaciones y alertas
- **produccion_diaria:** Métricas de producción por día

### Ejecutar migraciones
Las migraciones SQL están en `db/migrations/`. Puedes ejecutarlas usando los scripts en `tools/`:

```bash
# Migración estándar
node tools/run_migration.js

# Migración segura (con validaciones)
node tools/run_migration_safe.js

# Consultas personalizadas a la BD
node tools/query_db.js
```

### Scripts de utilidad
- `tools/check_range.js` - Verificar rangos de fechas
- `tools/list_labores.js` - Listar labores agrícolas
- `tools/put_alerta.js` - Crear alertas en la BD

## Estructura principal del proyecto
```
Backend_Eliminatoria/
├── src/
│   ├── app.js                 # Configuración de Express y middlewares
│   ├── index.js               # Punto de entrada del servidor
│   ├── socket.js              # Configuración de Socket.IO
│   ├── config/
│   │   └── database.js        # Conexión a MySQL
│   ├── controllers/           # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── usuarios.controller.js
│   │   ├── cultivos.controller.js
│   │   ├── lotes.controller.js
│   │   ├── trabajadores.controller.js
│   │   ├── laboresAgricolas.controller.js
│   │   ├── laboresTipos.controller.js
│   │   ├── alertas.controller.js
│   │   ├── reportes.controller.js
│   │   ├── roles.controller.js
│   │   └── dashboardProduccionDiaria.controller.js
│   ├── models/                # Modelos de datos
│   │   ├── auth.model.js
│   │   ├── usuario.model.js
│   │   ├── cultivo.model.js
│   │   ├── lote.model.js
│   │   ├── trabajador.model.js
│   │   ├── laborAgricola.model.js
│   │   ├── laborTipo.model.js
│   │   ├── alerta.model.js
│   │   ├── role.model.js
│   │   └── dashboardProduccionDiaria.model.js
│   ├── routes/                # Definición de endpoints
│   │   ├── auth.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── cultivos.routes.js
│   │   ├── lotes.routes.js
│   │   ├── trabajadores.routes.js
│   │   ├── laboresAgricolas.routes.js
│   │   ├── laboresTipos.routes.js
│   │   ├── alertas.routes.js
│   │   ├── reportes.routes.js
│   │   ├── roles.routes.js
│   │   └── dashboardProduccionDiaria.routes.js
│   └── middleware/            # Middlewares de autenticación y permisos
│       ├── auth.middleware.js
│       ├── checkPermission.js
│       └── checkRole.js
├── db/
│   └── migrations/            # Scripts de migración SQL
├── tools/                     # Scripts de utilidad
│   ├── run_migration.js
│   ├── run_migration_safe.js
│   ├── query_db.js
│   ├── check_range.js
│   ├── list_labores.js
│   └── put_alerta.js
├── esquema.sql                # Esquema completo de la BD
├── package.json
└── .env.example               # Plantilla de variables de entorno
```

## Endpoints principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Cultivos
- `GET /api/cultivos` - Listar cultivos
- `POST /api/cultivos` - Crear cultivo
- `PUT /api/cultivos/:id` - Actualizar cultivo
- `DELETE /api/cultivos/:id` - Eliminar cultivo

### Lotes
- `GET /api/lotes` - Listar lotes
- `POST /api/lotes` - Crear lote
- `PUT /api/lotes/:id` - Actualizar lote
- `DELETE /api/lotes/:id` - Eliminar lote

### Trabajadores
- `GET /api/trabajadores` - Listar trabajadores
- `POST /api/trabajadores` - Crear trabajador
- `PUT /api/trabajadores/:id` - Actualizar trabajador
- `DELETE /api/trabajadores/:id` - Eliminar trabajador

### Labores Agrícolas
- `GET /api/labores-agricolas` - Listar labores (con filtros)
- `POST /api/labores-agricolas` - Registrar labor
- `PUT /api/labores-agricolas/:id` - Actualizar labor
- `DELETE /api/labores-agricolas/:id` - Eliminar labor

### Alertas (WebSocket)
- `GET /api/alertas` - Obtener alertas
- Socket.IO: `connection`, `nuevaAlerta`, `alertaLeida`

### Reportes
- `GET /api/reportes/produccion-excel` - Generar reporte Excel
- `GET /api/reportes/produccion-pdf` - Generar reporte PDF

### Dashboard
- `GET /api/dashboard/produccion-diaria` - Métricas de producción

## Scripts útiles

### Scripts de npm (package.json)
```bash
# Desarrollo con hot-reload
npm run dev

# Ejecutar tests (si están configurados)
npm test
```

### Scripts de utilidad (tools/)
```bash
# Ejecutar migraciones de base de datos
node tools/run_migration.js

# Ejecutar migraciones con validación de seguridad
node tools/run_migration_safe.js

# Consultar la base de datos
node tools/query_db.js

# Verificar rangos de fechas
node tools/check_range.js

# Listar todas las labores agrícolas
node tools/list_labores.js

# Crear una alerta en la base de datos
node tools/put_alerta.js
```

## Herramientas adicionales

### Socket.IO - Alertas en tiempo real
El backend incluye Socket.IO para notificaciones en tiempo real:
```javascript
// Eventos disponibles:
- connection: Cliente conectado
- nuevaAlerta: Nueva alerta creada
- alertaLeida: Alerta marcada como leída
- disconnect: Cliente desconectado
```

### Generación de reportes
- **Excel:** Usa ExcelJS para generar reportes de producción en formato `.xlsx`
- **PDF:** Usa PDFKit para generar reportes imprimibles en formato `.pdf`

### Integración con IA
El sistema incluye Google GenAI para:
- Análisis predictivo de producción
- Recomendaciones de labores agrícolas
- Detección de patrones en cultivos

## Despliegue

### Requisitos para producción
1. Servidor con Node.js v18+
2. MySQL 8+ con el esquema ejecutado
3. Variables de entorno configuradas
4. SSL/TLS para conexiones seguras (recomendado)

### Pasos para despliegue
1. **Clonar el repositorio en el servidor:**
```bash
git clone https://github.com/juansito17/Backend_Eliminatoria.git
cd Backend_Eliminatoria
```

2. **Instalar dependencias de producción:**
```bash
npm install --production
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env con valores de producción
PORT=3000
NODE_ENV=production
DB_HOST=tu_host_produccion
DB_USER=tu_usuario_produccion
DB_PASSWORD=tu_password_seguro
DB_NAME=agricultura_db
JWT_SECRET=tu_secreto_muy_largo_y_aleatorio
```

4. **Ejecutar migraciones:**
```bash
node tools/run_migration_safe.js
```

5. **Iniciar el servidor:**
```bash
# Con PM2 (recomendado)
npm install -g pm2
pm2 start src/index.js --name agricultura-backend

# O con node directamente
node src/index.js
```

6. **Configurar proxy reverso (Nginx/Apache):**
```nginx
# Ejemplo de configuración Nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Recomendaciones de seguridad
- ✅ Usar HTTPS en producción
- ✅ Configurar CORS adecuadamente
- ✅ Implementar rate limiting
- ✅ Mantener dependencias actualizadas
- ✅ Usar variables de entorno para secretos
- ✅ Realizar backups regulares de la base de datos
- ✅ Monitorear logs y errores

## Contribución

### Flujo de trabajo
1. Fork del repositorio
2. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Hacer commits descriptivos: `git commit -m "feat: agregar endpoint para X"`
4. Push a tu fork: `git push origin feature/nueva-funcionalidad`
5. Crear un Pull Request

### Convenciones de código
- Usar CommonJS (`require`/`module.exports`)
- Seguir la estructura MVC existente (Model-View-Controller)
- Documentar funciones complejas
- Validar todos los inputs con express-validator
- Manejar errores apropiadamente con try-catch
- Usar nombres descriptivos para variables y funciones

### Tests
```bash
npm test
```

## Contacto

- **Repositorio:** [github.com/juansito17/Backend_Eliminatoria](https://github.com/juansito17/Backend_Eliminatoria)
- **Issues:** [github.com/juansito17/Backend_Eliminatoria/issues](https://github.com/juansito17/Backend_Eliminatoria/issues)

Para dudas o problemas técnicos, por favor abre un issue en GitHub o contacta al equipo de desarrollo.

---

**Licencia:** ISC

**Versión:** 1.0.0

**Última actualización:** Octubre 2025
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
