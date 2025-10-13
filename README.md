# Conexa Backend - Star Wars Movies API

Backend API para gestión de películas de Star Wars con sistema de autenticación, quiz y ranking de usuarios.

## 🚀 Tecnologías

- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM
- **JWT** - Autenticación
- **Docker** - Containerización
- **Github Actions** - Integración y despliegue.
- **Swagger** - Documentación API

## Deploy

- El proyecto se encuentra deployado en Railway.
- El swagger para probar el proyecto deployado se encuentra en https://movies-back-production.up.railway.app/api/docs
- El que saca mas puntos en el Quiz se gana una cerveza.

## 📋 Prerequisitos local

### Opción 1: Con Docker (Recomendado)

- Docker y Docker Compose instalados
- Node.js 20+ (solo para IntelliSense del IDE)

### Opción 2: Sin Docker

- Node.js 20+
- PostgreSQL 15+
- npm o yarn

## 🐳 Instalación y Ejecución con Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/Danilodevald123/movies-back.git
cd movies-back
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

### 3. Instalar dependencias (para IntelliSense del IDE)

```bash
npm install
```

### 4. Levantar todos los servicios

```bash
docker-compose up --build
```

Esto levantará:

- **PostgreSQL** en puerto `5433`
- **Backend API** en puerto `3000`
- **pgAdmin** en puerto `5050`

Y ejecutará automáticamente:

- ✅ Migraciones de base de datos
- ✅ Seeds (usuarios y preguntas de prueba)

### 5. Acceder a la aplicación

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050
  - Email: `admin@conexa.com`
  - Password: `admin123`

## 💻 Instalación y Ejecución sin Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/Danilodevald123/movies-back.git
cd movies-back
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:

```env
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=conexa_db

JWT_SECRET=tu-secret-super-seguro
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

SWAPI_BASE_URL=https://www.swapi.tech/api
```

### 4. Crear base de datos

Crear BD postgresSQL y configurar variables de entorno.

### 5. Ejecutar migraciones

```bash
npm run migration:run
```

### 6. Ejecutar seeds

```bash
npm run seed:all
```

### 7. Iniciar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

## 🔑 Credenciales de Prueba

### Usuario Admin

- **Email**: `admin@conexa.com`
- **Password**: `Admin123!`

### Usuario Regular

- **Email**: `user@conexa.com`
- **Password**: `User123!`

## 🧪 Testing

# Tests unitarios

npm run test

## 📚 Documentación API

Una vez levantada la aplicación, acceder a:

**Swagger UI**: http://localhost:3000/api/docs
