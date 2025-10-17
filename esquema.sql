-- #############################################################################
-- ## Esquema de Base de Datos para el Sistema de Agricultura de Precisión    ##
-- ## Base de Datos: agricultura_db                                           ##
-- ## Motor: MySQL (InnoDB)                                                   ##
-- #############################################################################

-- --- Creación de la Base de Datos ---
CREATE DATABASE IF NOT EXISTS agricultura_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agricultura_db;

-- -----------------------------------------------------
-- Tabla: roles
-- Descripción: Almacena los roles de los usuarios del sistema (Administrador, Supervisor, Operario).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE,
  descripcion_rol TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: usuarios
-- Descripción: Gestiona la información de los usuarios y sus credenciales.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_rol INT NOT NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP NULL,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- -----------------------------------------------------
-- Tabla: lotes
-- Descripción: Define los lotes o parcelas de la finca.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS lotes (
  id_lote INT AUTO_INCREMENT PRIMARY KEY,
  nombre_lote VARCHAR(100) NOT NULL,
  ubicacion_gps_poligono JSON, -- Para almacenar coordenadas del lote
  area_hectareas DECIMAL(10, 2),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: cultivos
-- Descripción: Catálogo de los tipos de cultivo.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cultivos (
  id_cultivo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cultivo VARCHAR(100) NOT NULL UNIQUE,
  descripcion_cultivo TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: trabajadores
-- Descripción: Información de los operarios o trabajadores de campo.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS trabajadores (
  id_trabajador INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  codigo_trabajador VARCHAR(20) UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: labores_tipos
-- Descripción: Catálogo de los tipos de labores agrícolas (ej. Cosecha, Siembra, Riego).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS labores_tipos (
  id_labor_tipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_labor VARCHAR(100) NOT NULL UNIQUE,
  descripcion_labor TEXT,
  requiere_cantidad BOOLEAN DEFAULT TRUE, -- Indica si la labor implica una cantidad medible (ej. kg)
  requiere_peso BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: labores_agricolas
-- Descripción: Tabla principal para registrar todas las actividades de campo.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS labores_agricolas (
  id_labor INT AUTO_INCREMENT PRIMARY KEY,
  id_lote INT NOT NULL,
  id_cultivo INT NOT NULL,
  id_trabajador INT NOT NULL,
  id_labor_tipo INT NOT NULL,
  id_usuario_registro INT NOT NULL, -- Usuario que registra la labor
  fecha_labor DATETIME NOT NULL,
  cantidad_recolectada DECIMAL(10, 2), -- Ej. Cajas, canastas
  peso_kg DECIMAL(10, 2),
  costo_aproximado DECIMAL(12, 2),
  ubicacion_gps_punto POINT, -- Coordenada exacta del registro si es necesario
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
  FOREIGN KEY (id_cultivo) REFERENCES cultivos(id_cultivo),
  FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador),
  FOREIGN KEY (id_labor_tipo) REFERENCES labores_tipos(id_labor_tipo),
  FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(id_usuario)
);

-- -----------------------------------------------------
-- Tabla: alertas
-- Descripción: Registra notificaciones automáticas sobre desviaciones significativas.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas (
  id_alerta INT AUTO_INCREMENT PRIMARY KEY,
  id_labor INT NULL, -- Labor asociada, si aplica
  id_lote INT NULL,  -- Lote asociado, si aplica
  tipo_alerta VARCHAR(100) NOT NULL, -- Ej. 'BAJO_RENDIMIENTO', 'RETRASO_COSECHA'
  descripcion TEXT NOT NULL,
  nivel_severidad ENUM('Bajo', 'Medio', 'Alto') NOT NULL,
  resuelta BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_labor) REFERENCES labores_agricolas(id_labor),
  FOREIGN KEY (id_lote) REFERENCES lotes(id_lote)
);

-- -----------------------------------------------------
-- Vistas o Tablas Agregadas para el Dashboard (Opcional, para rendimiento)
-- Estas tablas se podrían actualizar con triggers o un proceso batch.
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Tabla: dashboard_produccion_diaria
-- Descripción: Almacena datos pre-calculados para el dashboard, optimizando consultas.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_produccion_diaria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  id_lote INT NOT NULL,
  id_cultivo INT NOT NULL,
  total_peso_kg DECIMAL(15, 2) DEFAULT 0.00,
  productividad_promedio_trabajador DECIMAL(10, 2) DEFAULT 0.00, -- kg/trabajador
  costo_total_aproximado DECIMAL(15, 2) DEFAULT 0.00,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_fecha_lote_cultivo` (`fecha`, `id_lote`, `id_cultivo`),
  FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
  FOREIGN KEY (id_cultivo) REFERENCES cultivos(id_cultivo)
);

-- --- Inserción de Datos Iniciales (Maestros) ---

INSERT INTO roles (nombre_rol, descripcion_rol) VALUES
('Administrador', 'Acceso total al sistema y configuración.'),
('Supervisor', 'Gestión de labores, trabajadores y reportes.'),
('Operario', 'Registro de datos de campo y consulta de tareas.');

INSERT INTO labores_tipos (nombre_labor, descripcion_labor) VALUES
('Cosecha', 'Recolección del producto del campo.'),
('Pesaje', 'Registro del peso del producto recolectado.'),
('Transporte', 'Movimiento del producto desde el lote a la bodega.'),
('Siembra', 'Plantación de nuevas semillas o plántulas.'),
('Riego', 'Aplicación de agua al cultivo.');

-- --- Fin del Script ---
