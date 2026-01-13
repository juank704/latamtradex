# Latam Tradex - Frontend

Frontend de la plataforma B2B/B2C Latam Tradex, construido con React, TypeScript, Vite y conectado al backend de microservicios.

## Stack Tecnológico

- **Framework:** React 18
- **Build Tool:** Vite
- **Lenguaje:** TypeScript
- **UI Library:** shadcn/ui + Radix UI
- **Estilos:** Tailwind CSS
- **HTTP Client:** Axios
- **Estado:** React Context + TanStack Query
- **Routing:** React Router v7
- **Formularios:** React Hook Form + Zod

## Instalación Rápida

### 1. Instalar Dependencias

```bash
npm install
```

O usa el script de instalación:

**Windows:**
```bash
install-dependencies.bat
```

**Linux/Mac:**
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Iniciar Backend (Requerido)

Desde la raíz del proyecto:

```bash
cd ..
docker-compose up -d
```

### 4. Iniciar Frontend

```bash
npm run dev
```

Abre http://localhost:8080 en tu navegador.

## Páginas Disponibles

| Ruta | Descripción | Auth Requerido |
|------|-------------|----------------|
| `/` | Página de inicio | No |
| `/login` | Iniciar sesión | No |
| `/register` | Crear cuenta | No |
| `/products` | Catálogo de productos | No |
| `/orders` | Mis órdenes | Sí (recomendado) |

## Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run lint     # Linter
npm run preview  # Preview del build
```

## Documentación Completa

Ver [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) para documentación detallada de integración.

---

**Generado para Latam Tradex**
