# Guía de Inicio y Testing - Latam Tradex

Esta guía te llevará paso a paso desde la instalación hasta el testing completo del sistema.

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Docker Desktop** (versión 20.10+)
- ✅ **Node.js** (versión 20+)
- ✅ **npm** (versión 9+)
- ✅ **Git** (opcional)

### Verificar Instalaciones

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js y npm
node --version
npm --version
```

---

## 🚀 Parte 1: Instalación Inicial

### Paso 1: Navegar al Proyecto

```bash
cd c:\Users\jcveg\Desktop\repo_local\latamtradex
```

### Paso 2: Instalar Dependencias del Frontend

**Opción A - Script Automático (Windows):**
```bash
cd latamtradex-frontend
install-dependencies.bat
```

**Opción B - Script Automático (Linux/Mac):**
```bash
cd latamtradex-frontend
chmod +x install-dependencies.sh
./install-dependencies.sh
```

**Opción C - Manual:**
```bash
cd latamtradex-frontend
npm install
npm install axios
```

### Paso 3: Verificar Archivo .env

```bash
# En latamtradex-frontend/
# Verificar que existe .env con:
VITE_API_BASE_URL=http://localhost:3000/api
```

Si no existe, cópialo desde `.env.example`:
```bash
cp .env.example .env
```

---

## 🐳 Parte 2: Iniciar Backend (Microservicios)

### Paso 1: Volver a la Raíz del Proyecto

```bash
cd ..
# Ahora estás en: c:\Users\jcveg\Desktop\repo_local\latamtradex
```

### Paso 2: Iniciar Infraestructura con Docker

```bash
docker-compose up -d
```

Este comando iniciará **9 contenedores**:
- Zookeeper
- Kafka
- PostgreSQL (Auth)
- PostgreSQL (Orders)
- MongoDB
- API Gateway
- Auth Service
- Catalog Service
- Order Service

### Paso 3: Verificar que Todo Está Corriendo

```bash
docker-compose ps
```

**Salida Esperada:**
```
NAME                              STATUS      PORTS
latamtradex-api-gateway           Up          0.0.0.0:3000->3000/tcp
latamtradex-auth-service          Up
latamtradex-catalog-service       Up
latamtradex-kafka                 Up (healthy) 0.0.0.0:9092->9092/tcp, 9093
latamtradex-mongodb               Up (healthy) 0.0.0.0:27017->27017/tcp
latamtradex-order-service         Up
latamtradex-postgres-auth         Up (healthy) 0.0.0.0:5432->5432/tcp
latamtradex-postgres-orders       Up (healthy) 0.0.0.0:5433->5432/tcp
latamtradex-zookeeper             Up          0.0.0.0:2181->2181/tcp
```

✅ **Todos deben estar en estado "Up" o "Up (healthy)"**

### Paso 4: Ver Logs (Opcional pero Recomendado)

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# O ver logs de un servicio específico
docker-compose logs -f api-gateway
```

Presiona `Ctrl+C` para salir de los logs.

---

## 💻 Parte 3: Iniciar Frontend

### Paso 1: Abrir Nueva Terminal

Abre una **nueva terminal** (deja la anterior con los logs si quieres).

### Paso 2: Navegar al Frontend

```bash
cd c:\Users\jcveg\Desktop\repo_local\latamtradex\latamtradex-frontend
```

### Paso 3: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

**Salida Esperada:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 4: Abrir en Navegador

Abre tu navegador en: **http://localhost:8080**

---

## ✅ Parte 4: Verificación del Sistema

### 4.1 Verificar API Gateway

```bash
# En una nueva terminal
curl http://localhost:3000/api/health
```

**Respuesta Esperada:**
```json
{
  "status": "OK",
  "service": "API Gateway",
  "timestamp": "2024-01-xx..."
}
```

### 4.2 Verificar Kafka Topics

```bash
docker exec -it latamtradex-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

**Deberías ver:**
```
__consumer_offsets
auth.commands
catalog.commands
order.commands
order.created
stock.updated
user.registered
```

### 4.3 Verificar Bases de Datos

**PostgreSQL (Auth):**
```bash
docker exec -it latamtradex-postgres-auth psql -U auth_user -d auth_db -c "\dt"
```

**PostgreSQL (Orders):**
```bash
docker exec -it latamtradex-postgres-orders psql -U orders_user -d orders_db -c "\dt"
```

**MongoDB:**
```bash
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password --eval "show dbs"
```

---

## 🧪 Parte 5: Testing Manual Completo

### Test 1: Registrar Usuario

#### 5.1.1 - Desde el Navegador

1. Ve a **http://localhost:8080/register**
2. Rellena el formulario:
   - **Name:** Juan Pérez
   - **Email:** juan@latamtradex.com
   - **Password:** password123
   - **Role:** Seller (Supplier)
3. Click **"Create Account"**

**✅ Resultado Esperado:**
- Toast verde: "Registration successful"
- Redirige a la página principal
- Navbar muestra "Juan Pérez"
- Botón "Logout" visible

#### 5.1.2 - Verificar en Backend

**Ver logs del API Gateway:**
```bash
docker-compose logs api-gateway | grep "Registration request"
```

**Ver logs del Auth Service:**
```bash
docker-compose logs auth-service | grep "User registered"
```

**Ver evento en Kafka:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.registered \
  --from-beginning
```

**Salida Esperada (JSON):**
```json
{
  "userId": "uuid-xxx",
  "email": "juan@latamtradex.com",
  "role": "seller",
  "createdAt": "2024-01-xx..."
}
```

Presiona `Ctrl+C` para salir.

**Verificar en PostgreSQL:**
```bash
docker exec -it latamtradex-postgres-auth psql -U auth_user -d auth_db -c "SELECT id, email, name, role, \"createdAt\" FROM users;"
```

**✅ Deberías ver tu usuario en la tabla!**

---

### Test 2: Login

#### 5.2.1 - Logout Primero

1. Click en **"Logout"** en la navbar
2. Verifica que redirige a home
3. Navbar muestra "Login" y "Register"

#### 5.2.2 - Login

1. Ve a **http://localhost:8080/login**
2. Ingresa credenciales:
   - **Email:** juan@latamtradex.com
   - **Password:** password123
3. Click **"Login"**

**✅ Resultado Esperado:**
- Toast verde: "Login successful"
- Redirige a home
- Navbar muestra "Juan Pérez"
- Botón "Logout" visible

---

### Test 3: Crear Producto (Solo Sellers)

#### 5.3.1 - Navegar a Products

1. Click en **"Products"** en la navbar
2. O ve a **http://localhost:8080/products**

#### 5.3.2 - Crear Producto

1. Click en **"Add Product"** (solo visible para sellers)
2. Rellena el formulario:
   - **Product Name:** Café Colombiano Premium
   - **Description:** Café 100% arábica de origen colombiano
   - **SKU:** CAFE-COL-001
   - **Category:** Alimentos
   - **Price:** 25.99
   - **Stock:** 100
3. Click **"Create Product"**

**✅ Resultado Esperado:**
- Toast verde: "Product created"
- Dialog se cierra

#### 5.3.3 - Verificar en Backend

**Ver logs del Catalog Service:**
```bash
docker-compose logs catalog-service | grep "Product created"
```

**Ver en MongoDB:**
```bash
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password --eval "db.getSiblingDB('catalog_db').products.find().pretty()"
```

**✅ Deberías ver tu producto!**

---

### Test 4: Crear Orden (Event-Driven Magic!)

#### 5.4.1 - Obtener Product ID

```bash
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password --eval "db.getSiblingDB('catalog_db').products.find({}, {_id:1, name:1, stock:1}).pretty()"
```

**Copia el `_id` del producto** (ejemplo: `6789abcd...`)

#### 5.4.2 - Crear Orden vía API

**Opción A - Usar cURL:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "TU_PRODUCT_ID_AQUI",
        "quantity": 5,
        "price": 25.99
      }
    ]
  }'
```

**Opción B - Usar Postman/Thunder Client:**
- **Method:** POST
- **URL:** http://localhost:3000/api/orders
- **Headers:** Content-Type: application/json
- **Body (raw JSON):**
```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "TU_PRODUCT_ID_AQUI",
      "quantity": 5,
      "price": 25.99
    }
  ]
}
```

**✅ Respuesta Esperada:**
```json
{
  "message": "Order creation request received",
  "status": "pending"
}
```

#### 5.4.3 - Verificar Event-Driven Flow

**1. Ver evento order.created en Kafka:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning
```

**Deberías ver:**
```json
{
  "orderId": "uuid-xxx",
  "userId": "user-123",
  "items": [...],
  "totalAmount": 129.95,
  "status": "pending",
  "createdAt": "2024-01-xx..."
}
```

**2. Ver orden en PostgreSQL:**
```bash
docker exec -it latamtradex-postgres-orders psql -U orders_user -d orders_db -c "SELECT id, \"userId\", status, \"totalAmount\", \"createdAt\" FROM orders;"
```

**3. 🎯 VERIFICAR STOCK REDUCIDO (Event-Driven!):**
```bash
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password --eval "db.getSiblingDB('catalog_db').products.find({}, {name:1, stock:1}).pretty()"
```

**✅ El stock debería haber bajado de 100 a 95!**

**4. Ver evento stock.updated en Kafka:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic stock.updated \
  --from-beginning
```

**🎉 Esto demuestra que la arquitectura Event-Driven funciona!**

---

### Test 5: Verificar Página de Orders

1. Ve a **http://localhost:8080/orders**
2. Deberías ver tus órdenes (actualmente muestra mock data)

---

## 🔍 Parte 6: Testing de Integración Avanzado

### Test 6.1: Flujo Completo de Compra

1. **Registrar Comprador:**
   - Register con role: **Buyer**
   - Email: maria@latamtradex.com

2. **Crear Varios Productos (como Seller):**
   - Logout → Login como juan@latamtradex.com
   - Crear 3 productos diferentes

3. **Crear Múltiples Órdenes (como Buyer):**
   - Logout → Login como maria@latamtradex.com
   - Crear 2 órdenes con productos diferentes

4. **Verificar Stock Actualizado:**
   - Verificar que el stock bajó en cada producto

### Test 6.2: Monitoreo en Tiempo Real

**Terminal 1 - Ver todos los logs:**
```bash
docker-compose logs -f
```

**Terminal 2 - Consumer de user.registered:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.registered \
  --from-beginning
```

**Terminal 3 - Consumer de order.created:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning
```

**Terminal 4 - Consumer de stock.updated:**
```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic stock.updated \
  --from-beginning
```

Ahora realiza acciones en el frontend y ve los eventos en tiempo real!

---

## 📊 Parte 7: Inspección de Datos

### Inspeccionar PostgreSQL (Auth)

```bash
docker exec -it latamtradex-postgres-auth psql -U auth_user -d auth_db
```

**Comandos útiles:**
```sql
-- Ver estructura de tabla users
\d users

-- Ver todos los usuarios
SELECT * FROM users;

-- Contar usuarios por rol
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Salir
\q
```

### Inspeccionar PostgreSQL (Orders)

```bash
docker exec -it latamtradex-postgres-orders psql -U orders_user -d orders_db
```

**Comandos útiles:**
```sql
-- Ver tablas
\dt

-- Ver órdenes
SELECT * FROM orders;

-- Ver items de órdenes
SELECT * FROM order_items;

-- Join de órdenes con items
SELECT o.id, o."userId", o.status, o."totalAmount",
       oi."productId", oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON o.id = oi."orderId";

-- Salir
\q
```

### Inspeccionar MongoDB (Catalog)

```bash
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password
```

**Comandos útiles:**
```javascript
// Cambiar a base de datos
use catalog_db

// Ver todas las colecciones
show collections

// Ver productos
db.products.find().pretty()

// Contar productos
db.products.count()

// Buscar producto por SKU
db.products.find({ sku: "CAFE-COL-001" })

// Ver productos con stock bajo
db.products.find({ stock: { $lt: 50 } })

// Salir
exit
```

---

## 🛠️ Parte 8: Troubleshooting

### Problema 1: "Cannot connect to API"

**Síntoma:** Frontend muestra error de conexión

**Solución:**
```bash
# Verificar que API Gateway está corriendo
docker-compose ps api-gateway

# Ver logs
docker-compose logs api-gateway

# Reiniciar API Gateway
docker-compose restart api-gateway
```

### Problema 2: "Kafka not healthy"

**Síntoma:** Servicios no se conectan a Kafka

**Solución:**
```bash
# Verificar estado de Kafka
docker-compose ps kafka

# Reiniciar Kafka y Zookeeper
docker-compose restart zookeeper kafka

# Esperar 30 segundos y verificar
docker-compose ps
```

### Problema 3: "Base de datos no conecta"

**Síntoma:** Servicios no arrancan

**Solución:**
```bash
# Verificar bases de datos
docker-compose ps postgres-auth postgres-orders mongodb

# Ver logs
docker-compose logs postgres-auth
docker-compose logs mongodb

# Reiniciar bases de datos
docker-compose restart postgres-auth postgres-orders mongodb
```

### Problema 4: "Frontend no carga"

**Síntoma:** Página en blanco

**Solución:**
```bash
# Verificar que el servidor de Vite está corriendo
# Debería mostrar "Local: http://localhost:8080/"

# Si no, reiniciar:
cd latamtradex-frontend
npm run dev
```

### Problema 5: "No se ven los productos/órdenes"

**Síntoma:** Páginas vacías

**Solución:**
- Los endpoints GET aún no están implementados en el backend
- Las páginas usan mock data temporalmente
- Ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) para implementarlos

### Limpieza Total y Reinicio

Si algo está muy roto:

```bash
# Detener y eliminar todo
docker-compose down -v --remove-orphans

# Eliminar imágenes (opcional)
docker-compose down --rmi all

# Volver a iniciar
docker-compose up -d --build
```

---

## 📈 Parte 9: Métricas y Monitoreo

### Ver Estadísticas de Kafka

```bash
# Ver grupos de consumidores
docker exec -it latamtradex-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list

# Ver detalles de un grupo
docker exec -it latamtradex-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group auth-service-group
```

### Ver Uso de Recursos

```bash
# Ver CPU y memoria de cada contenedor
docker stats
```

---

## 🎯 Parte 10: Checklist de Testing Completo

### Backend

- [ ] ✅ Todos los contenedores están "Up"
- [ ] ✅ API Gateway responde en `/api/health`
- [ ] ✅ Kafka tiene todos los topics creados
- [ ] ✅ PostgreSQL (Auth) conecta
- [ ] ✅ PostgreSQL (Orders) conecta
- [ ] ✅ MongoDB conecta

### Frontend

- [ ] ✅ Frontend carga en http://localhost:8080
- [ ] ✅ Navegación funciona
- [ ] ✅ Páginas se renderizan correctamente

### Autenticación

- [ ] ✅ Registro de usuario funciona
- [ ] ✅ Evento `user.registered` se publica en Kafka
- [ ] ✅ Usuario se guarda en PostgreSQL
- [ ] ✅ Login funciona
- [ ] ✅ Token JWT se guarda en localStorage
- [ ] ✅ Logout funciona
- [ ] ✅ Sesión persiste al recargar

### Productos

- [ ] ✅ Crear producto funciona (solo sellers)
- [ ] ✅ Producto se guarda en MongoDB
- [ ] ✅ Comando se publica en Kafka

### Órdenes (Event-Driven)

- [ ] ✅ Crear orden funciona
- [ ] ✅ Orden se guarda en PostgreSQL
- [ ] ✅ Evento `order.created` se publica
- [ ] ✅ **Stock se reduce automáticamente en MongoDB**
- [ ] ✅ Evento `stock.updated` se publica

---

## 🎉 ¡Testing Completado!

Si todos los checks están ✅, tu sistema está funcionando perfectamente!

### Arquitectura Verificada:

```
✅ Frontend (React + TypeScript)
    ↓ HTTP
✅ API Gateway (NestJS)
    ↓ Kafka Commands
✅ Message Broker (Kafka)
    ↓ Events
✅ Microservices (Auth, Catalog, Order)
    ↓
✅ Databases (PostgreSQL, MongoDB)
```

### Event-Driven Verificado:

```
✅ Order Created → Stock Reduced Automatically
✅ No HTTP calls between services
✅ Complete decoupling via Kafka
```

---

## 📚 Próximos Pasos

1. **Implementar endpoints GET** - Ver [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
2. **Agregar Protected Routes** - Proteger páginas que requieren auth
3. **Implementar WebSocket** - Updates en tiempo real
4. **React Query** - Caché y optimistic updates
5. **Tests Automatizados** - Unit, Integration, E2E

---

## 📖 Documentación de Referencia

- **[QUICKSTART.md](QUICKSTART.md)** - Inicio rápido del backend
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Integración completa
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada
- **[README.md](README.md)** - Documentación principal

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisar esta guía de troubleshooting
2. Ver logs: `docker-compose logs -f`
3. Verificar DevTools del navegador (Console, Network)
4. Revisar documentación adicional

---

**¡Felicidades! Has completado el setup y testing de Latam Tradex MVP** 🚀

El sistema está listo para desarrollo y demostración de la arquitectura Event-Driven con microservicios.

---

**Generado por Claude Code** - Latam Tradex v1.0
