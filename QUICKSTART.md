# Quick Start Guide - Latam Tradex

Guía rápida para levantar el proyecto en 5 minutos.

## Pre-requisitos

- Docker Desktop instalado y corriendo
- Node.js 20+ (opcional, solo si quieres desarrollo local)

## Paso 1: Iniciar Infraestructura

```bash
# Clonar o navegar al proyecto
cd latamtradex

# Iniciar todos los servicios con Docker Compose
docker-compose up -d

# Verificar que todos los contenedores estén running
docker-compose ps
```

Deberías ver 8 contenedores corriendo:
- ✅ latamtradex-zookeeper
- ✅ latamtradex-kafka
- ✅ latamtradex-postgres-auth
- ✅ latamtradex-postgres-orders
- ✅ latamtradex-mongodb
- ✅ latamtradex-api-gateway
- ✅ latamtradex-auth-service
- ✅ latamtradex-catalog-service
- ✅ latamtradex-order-service

## Paso 2: Verificar Servicios

### Health Check del API Gateway

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "service": "API Gateway",
  "timestamp": "2024-01-XX..."
}
```

### Ver Logs en Tiempo Real

```bash
docker-compose logs -f
```

## Paso 3: Probar el Flujo Completo

### 3.1. Registrar un Usuario (Auth Service)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@latamtradex.com",
    "password": "securepass123",
    "name": "María García",
    "role": "seller"
  }'
```

**Qué sucede internamente:**
1. API Gateway recibe el request
2. Publica comando a `auth.commands` en Kafka
3. Auth Service consume el comando
4. Crea el usuario en PostgreSQL
5. Publica evento `user.registered` en Kafka

### 3.2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@latamtradex.com",
    "password": "securepass123"
  }'
```

### 3.3. Crear un Producto (Catalog Service)

```bash
curl -X POST http://localhost:3000/api/catalog/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Café Colombiano Premium",
    "description": "Café 100% arábica de origen colombiano",
    "sku": "CAFE-COL-001",
    "price": 25.99,
    "stock": 100,
    "category": "Alimentos"
  }'
```

**Qué sucede internamente:**
1. API Gateway recibe el request
2. Publica comando a `catalog.commands`
3. Catalog Service consume el comando
4. Crea el producto en MongoDB

### 3.4. Crear una Orden (Order Service → Catalog Service)

Primero, obtén el productId de MongoDB:

```bash
# Conectar a MongoDB
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password

# En el shell de MongoDB
use catalog_db
db.products.find().pretty()
# Copiar el _id del producto
```

Crear orden con el productId:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "customer-123",
    "items": [
      {
        "productId": "PRODUCT_ID_AQUI",
        "quantity": 5,
        "price": 25.99
      }
    ]
  }'
```

**Qué sucede internamente (Event-Driven):**
1. API Gateway → publica comando a `order.commands`
2. Order Service consume comando
3. Order Service crea orden en PostgreSQL
4. Order Service publica evento `order.created` en Kafka ✨
5. Catalog Service consume evento `order.created` ✨
6. Catalog Service reduce stock automáticamente
7. Catalog Service publica evento `stock.updated`

**Esto es el corazón de la arquitectura Event-Driven!** 🚀

## Paso 4: Monitorear Kafka

### Ver Topics Creados

```bash
docker exec -it latamtradex-kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list
```

### Consumir Eventos en Tiempo Real

#### Ver eventos de user.registered

```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.registered \
  --from-beginning
```

#### Ver eventos de order.created

```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.created \
  --from-beginning
```

#### Ver eventos de stock.updated

```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic stock.updated \
  --from-beginning
```

## Paso 5: Inspeccionar Bases de Datos

### PostgreSQL (Auth Service)

```bash
# Conectar a la base de datos de Auth
docker exec -it latamtradex-postgres-auth psql -U auth_user -d auth_db

# Ver usuarios registrados
SELECT id, email, name, role, "createdAt" FROM users;

# Salir
\q
```

### PostgreSQL (Order Service)

```bash
# Conectar a la base de datos de Orders
docker exec -it latamtradex-postgres-orders psql -U orders_user -d orders_db

# Ver órdenes
SELECT id, "userId", status, "totalAmount", "createdAt" FROM orders;

# Ver items de órdenes
SELECT * FROM order_items;

# Salir
\q
```

### MongoDB (Catalog Service)

```bash
# Conectar a MongoDB
docker exec -it latamtradex-mongodb mongosh -u catalog_user -p catalog_password

# Seleccionar base de datos
use catalog_db

# Ver productos
db.products.find().pretty()

# Ver stock de un producto específico
db.products.find({ sku: "CAFE-COL-001" })

# Salir
exit
```

## Arquitectura Visual

```
Frontend (latamtradex-frontend/)
    ↓ HTTP
API Gateway :3000
    ↓ Kafka Commands/Events
┌───────────────────────────────┐
│      Apache Kafka Broker      │
│                               │
│  📬 Topics:                   │
│  • auth.commands              │
│  • catalog.commands           │
│  • order.commands             │
│  • user.registered            │
│  • order.created              │
│  • order.updated              │
│  • stock.updated              │
└───────────────────────────────┘
    ↓                ↓               ↓
Auth Service   Catalog Service   Order Service
:3001          :3002             :3003
    ↓                ↓               ↓
PostgreSQL     MongoDB           PostgreSQL
:5432          :27017            :5433
```

## Comandos Útiles

```bash
# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f catalog-service
docker-compose logs -f order-service

# Reiniciar un servicio
docker-compose restart api-gateway

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Iniciar solo infraestructura (sin servicios)
docker-compose up -d zookeeper kafka postgres-auth postgres-orders mongodb
```

## Troubleshooting

### Problema: Kafka no arranca

```bash
# Ver logs de Kafka
docker-compose logs kafka

# Reiniciar Kafka y Zookeeper
docker-compose restart zookeeper kafka
```

### Problema: Servicios no se conectan a Kafka

```bash
# Verificar que Kafka está healthy
docker-compose ps kafka

# El output debe mostrar "healthy" en STATE
```

### Problema: Base de datos no conecta

```bash
# Verificar estado de las bases de datos
docker-compose ps postgres-auth postgres-orders mongodb

# Ver logs
docker-compose logs postgres-auth
docker-compose logs mongodb
```

### Limpieza Total y Reinicio

```bash
# Detener y limpiar todo
docker-compose down -v --remove-orphans

# Volver a iniciar
docker-compose up -d

# Ver progreso
docker-compose logs -f
```

## Endpoints API Gateway

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login usuario |
| POST | `/api/catalog/products` | Crear producto |
| GET | `/api/catalog/products/:id` | Obtener producto |
| POST | `/api/orders` | Crear orden |
| GET | `/api/health` | Health check |

## Siguientes Pasos

1. ✅ Infraestructura levantada
2. ✅ Servicios comunicándose por Kafka
3. ✅ Event-Driven Architecture funcionando
4. ⏭️ Conectar el frontend (latamtradex-frontend)
5. ⏭️ Implementar autenticación JWT en API Gateway
6. ⏭️ Agregar validaciones de negocio
7. ⏭️ Implementar patrón SAGA para rollbacks

## Verificación Final

Si completaste todos los pasos, deberías poder:

- ✅ Registrar usuarios → genera evento `user.registered`
- ✅ Crear productos → almacenados en MongoDB
- ✅ Crear órdenes → genera evento `order.created`
- ✅ Ver stock actualizado automáticamente → mediante evento `order.created`
- ✅ Todo sin llamadas HTTP directas entre servicios

**Esto es Event-Driven Architecture pura! 🎉**

## Recursos

- [README.md](README.md) - Documentación completa
- [docker-compose.yml](docker-compose.yml) - Configuración de infraestructura
- NestJS Docs: https://docs.nestjs.com/
- Kafka Docs: https://kafka.apache.org/documentation/
