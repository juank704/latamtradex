# Plan de Despliegue del Frontend en Vercel

## 📋 Resumen Ejecutivo

Este documento detalla el proceso completo para desplegar el frontend de Latam Tradex en Vercel. **No es necesario separar el proyecto** - Vercel puede desplegar desde una subcarpeta sin problemas.

---

## ❓ ¿Necesito Separar el Proyecto?

### Respuesta: **NO es necesario separar el proyecto**

Vercel soporta perfectamente proyectos en subcarpetas. Puedes mantener la estructura actual:
```
latamtradex/
├── latamtradex-frontend/  ← Frontend (se desplegará desde aquí)
├── services/               ← Backend (no se desplegará)
└── ...
```

**Ventajas de mantener todo junto:**
- ✅ Un solo repositorio para gestionar
- ✅ Historial de commits unificado
- ✅ Fácil sincronización entre frontend y backend
- ✅ Vercel puede configurarse para desplegar solo desde la subcarpeta

**Cuándo considerar separar:**
- Si quieres diferentes permisos de acceso para frontend/backend
- Si prefieres repositorios completamente independientes
- Si el equipo de frontend y backend son completamente diferentes

---

## 🚀 Plan de Despliegue Paso a Paso

### Prerrequisitos

- [ ] Cuenta en Vercel (gratis en [vercel.com](https://vercel.com))
- [ ] Repositorio en GitHub, GitLab o Bitbucket
- [ ] Código del frontend en la carpeta `latamtradex-frontend/`
- [ ] URL del API Gateway (backend) lista para conectar

---

## Paso 1: Preparar el Repositorio

### 1.1 Verificar la Estructura

Asegúrate de que tu repositorio tenga esta estructura:
```
latamtradex/
└── latamtradex-frontend/
    ├── package.json
    ├── vite.config.ts
    ├── src/
    └── ...
```

### 1.2 Verificar package.json

El `package.json` debe tener el script de build:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

✅ Ya está configurado correctamente en tu proyecto.

### 1.3 Commit y Push

Asegúrate de que todos los cambios estén en el repositorio:
```bash
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

---

## Paso 2: Conectar Vercel con el Repositorio

### 2.1 Crear Cuenta/Iniciar Sesión

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub, GitLab o Bitbucket
3. Autoriza a Vercel para acceder a tus repositorios

### 2.2 Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New Project"** o **"Import Project"**
2. Selecciona tu repositorio `latamtradex`
3. Haz clic en **"Import"**

### 2.3 Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Vite, pero verifica/ajusta:

#### Configuración del Framework
- **Framework Preset:** `Vite` (debería detectarse automáticamente)
- **Root Directory:** `latamtradex-frontend` ⚠️ **IMPORTANTE**
- **Build Command:** `npm run build` (o `npm ci && npm run build`)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (o `npm ci` para builds más rápidos)

#### Configuración Avanzada (Opcional)

Puedes crear un archivo `vercel.json` en la raíz del repositorio para mayor control:

```json
{
  "buildCommand": "cd latamtradex-frontend && npm ci && npm run build",
  "outputDirectory": "latamtradex-frontend/dist",
  "installCommand": "cd latamtradex-frontend && npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Nota:** Si usas `vercel.json`, no necesitas configurar "Root Directory" en la UI de Vercel.

---

## Paso 3: Configurar Variables de Entorno

### 3.1 Variables Necesarias

El frontend necesita la siguiente variable de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del API Gateway | `https://api.tu-dominio.com/api` |

### 3.2 Configurar en Vercel

1. En la página de configuración del proyecto, ve a **"Settings"** → **"Environment Variables"**
2. Agrega la variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://api.tu-dominio.com/api` (o la URL de tu API Gateway)
   - **Environment:** Selecciona todas (Production, Preview, Development)

3. Haz clic en **"Save"**

### 3.3 Valores por Entorno (Opcional)

Puedes configurar diferentes valores para diferentes entornos:

- **Production:** `https://api.tu-dominio.com/api`
- **Preview:** `https://api-staging.tu-dominio.com/api`
- **Development:** `http://localhost:3000/api`

---

## Paso 4: Realizar el Primer Despliegue

### 4.1 Desplegar

1. Haz clic en **"Deploy"** en la página de configuración
2. Vercel comenzará a:
   - Instalar dependencias
   - Ejecutar el build
   - Desplegar la aplicación

### 4.2 Verificar el Despliegue

1. Espera a que termine el proceso (2-5 minutos)
2. Verás una URL temporal: `tu-proyecto-xxxxx.vercel.app`
3. Haz clic en la URL para ver tu aplicación

### 4.3 Verificar que Funciona

1. Abre la URL de Vercel en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **Network**
4. Intenta hacer login o cualquier acción que llame al API
5. Verifica que las peticiones vayan a la URL correcta del API

---

## Paso 5: Configurar Dominio Personalizado (Opcional)

### 5.1 Agregar Dominio

1. En la configuración del proyecto, ve a **"Settings"** → **"Domains"**
2. Ingresa tu dominio (ej: `app.tu-dominio.com`)
3. Haz clic en **"Add"**

### 5.2 Configurar DNS

Vercel te dará instrucciones específicas. Generalmente necesitas:

**Opción A: Registro CNAME**
```
Tipo: CNAME
Nombre: app (o www)
Valor: cname.vercel-dns.com
```

**Opción B: Registro A (si Vercel lo requiere)**
```
Tipo: A
Nombre: app
Valor: [IP que Vercel te proporcione]
```

### 5.3 Verificar DNS

1. Espera a que se propague el DNS (puede tardar hasta 48 horas, generalmente es más rápido)
2. Vercel verificará automáticamente cuando esté listo
3. Una vez verificado, tu dominio estará activo con SSL automático

---

## Paso 6: Configuración de Rutas (SPA)

### 6.1 Configurar Rewrites para React Router

Como estás usando React Router, necesitas que todas las rutas apunten a `index.html`. Vercel lo hace automáticamente para proyectos Vite, pero puedes asegurarte con `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Ubicación:** Crea este archivo en `latamtradex-frontend/vercel.json`

---

## 🔧 Configuración Avanzada

### Optimización del Build

Puedes optimizar el build agregando estas configuraciones en `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Variables de Entorno en Desarrollo Local

Crea un archivo `.env.local` en `latamtradex-frontend/` (no lo subas a Git):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Agrega `.env.local` al `.gitignore` si no está ya.

---

## 📊 Monitoreo y Analytics

### Vercel Analytics (Opcional)

1. Ve a **"Settings"** → **"Analytics"**
2. Habilita **Vercel Analytics** (gratis en el plan Hobby)
3. Obtendrás métricas de:
   - Visitas
   - Páginas más visitadas
   - Rendimiento

### Logs en Tiempo Real

1. En cada despliegue, puedes ver los logs en tiempo real
2. Ve a **"Deployments"** → Selecciona un despliegue → **"Logs"**
3. Útil para debugging

---

## 🔍 Troubleshooting

### Problema: Build Falla

**Síntomas:** El despliegue falla durante el build

**Soluciones:**
1. Verifica los logs en Vercel para ver el error específico
2. Asegúrate de que `package.json` tenga todas las dependencias
3. Verifica que el comando de build sea correcto: `npm run build`
4. Prueba localmente: `cd latamtradex-frontend && npm run build`

### Problema: 404 en Rutas (React Router)

**Síntomas:** Las rutas como `/products` o `/orders` dan 404

**Solución:**
- Asegúrate de tener `vercel.json` con los rewrites configurados (ver Paso 6)

### Problema: No se Conecta al API

**Síntomas:** El frontend carga pero las peticiones al API fallan

**Soluciones:**
1. Verifica que `VITE_API_BASE_URL` esté configurada en Vercel
2. Verifica que la URL del API sea correcta y accesible
3. Verifica CORS en el backend (debe permitir el dominio de Vercel)
4. Abre la consola del navegador para ver errores específicos

### Problema: Variables de Entorno No Funcionan

**Síntomas:** `import.meta.env.VITE_API_BASE_URL` es `undefined`

**Soluciones:**
1. Asegúrate de que la variable empiece con `VITE_` (requerido por Vite)
2. Reinicia el despliegue después de agregar variables de entorno
3. Verifica que la variable esté en el entorno correcto (Production/Preview)

### Problema: Imágenes o Assets No Cargan

**Síntomas:** Imágenes o archivos estáticos dan 404

**Soluciones:**
1. Asegúrate de que los assets estén en la carpeta `public/`
2. Usa rutas relativas: `/imagen.png` en lugar de rutas absolutas
3. Verifica que los archivos estén en el repositorio

### Problema: Build es Muy Lento

**Soluciones:**
1. Usa `npm ci` en lugar de `npm install` (más rápido y determinístico)
2. Considera usar caché de dependencias en Vercel (automático)
3. Optimiza el tamaño del bundle (ver Configuración Avanzada)

---

## ✅ Checklist de Despliegue

Antes de considerar el despliegue completo, verifica:

- [ ] Repositorio está en GitHub/GitLab/Bitbucket
- [ ] Código del frontend está en `latamtradex-frontend/`
- [ ] `package.json` tiene el script `build`
- [ ] Proyecto conectado a Vercel
- [ ] Root Directory configurado como `latamtradex-frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Variable `VITE_API_BASE_URL` configurada en Vercel
- [ ] Primer despliegue exitoso
- [ ] Aplicación carga correctamente en la URL de Vercel
- [ ] Las peticiones al API funcionan
- [ ] Las rutas de React Router funcionan (no dan 404)
- [ ] Dominio personalizado configurado (si aplica)
- [ ] SSL/HTTPS funcionando (automático en Vercel)

---

## 🔄 Despliegues Automáticos

### Configuración Automática

Vercel despliega automáticamente cuando:
- Haces push a la rama `main` o `master` → Despliega a **Production**
- Haces push a otras ramas → Crea un **Preview Deployment**
- Abres un Pull Request → Crea un **Preview Deployment** con comentario

### Despliegues Manuales

También puedes desplegar manualmente:
1. Ve a **"Deployments"**
2. Haz clic en los tres puntos (⋯) de un despliegue anterior
3. Selecciona **"Redeploy"**

---

## 💰 Planes de Vercel

### Plan Hobby (Gratis)
- ✅ Despliegues ilimitados
- ✅ Dominios personalizados
- ✅ SSL automático
- ✅ Analytics básico
- ⚠️ Limitaciones de ancho de banda (100GB/mes)
- ⚠️ Builds limitados (100 builds/hora)

### Plan Pro ($20/mes por usuario)
- ✅ Todo del plan Hobby
- ✅ Ancho de banda ilimitado
- ✅ Builds ilimitados
- ✅ Analytics avanzado
- ✅ Soporte prioritario

**Para empezar, el plan Hobby es suficiente.**

---

## 📝 Archivos de Configuración Recomendados

### `.gitignore` (en `latamtradex-frontend/`)

Asegúrate de que incluya:
```
node_modules/
dist/
.env.local
.env*.local
```

### `vercel.json` (opcional, en `latamtradex-frontend/`)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🚀 Próximos Pasos Después del Despliegue

1. **Configurar CI/CD:**
   - Los despliegues automáticos ya están activos
   - Considera agregar tests antes del despliegue

2. **Optimización:**
   - Implementar lazy loading de rutas
   - Optimizar imágenes
   - Configurar Service Workers (PWA)

3. **Monitoreo:**
   - Configurar alertas en Vercel
   - Integrar con herramientas de monitoreo (Sentry, etc.)

4. **Seguridad:**
   - Revisar headers de seguridad
   - Configurar CSP (Content Security Policy)

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Configuración de Dominios](https://vercel.com/docs/concepts/projects/domains)

---

## 🎉 ¡Listo para Desplegar!

Con este plan, deberías poder desplegar tu frontend en Vercel sin problemas. Recuerda:

1. **No necesitas separar el proyecto** - Vercel maneja subcarpetas perfectamente
2. **Configura la Root Directory** como `latamtradex-frontend`
3. **Agrega la variable de entorno** `VITE_API_BASE_URL`
4. **Verifica que el build funcione** localmente antes de desplegar

¡Buena suerte con el despliegue! 🚀

