# Latam Tradex - B2B/B2C Platform MVP

Plataforma de comercio electrónico B2B/B2C para Pymes construida con arquitectura de microservicios y comunicación basada en eventos mediante Apache Kafka.

## Arquitectura

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React/Vue)                        │
│                      latamtradex-frontend/                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway (NestJS)                        │
│                       Port: 3000 - /api                             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ Kafka Events/Commands
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Apache Kafka Broker                          │
│                    (Event-Driven Architecture)                      │
│                                                                     │
│  Topics:                                                            │
│  - auth.commands        - user.registered                          │
│  - catalog.commands     - stock.updated                            │
│  - order.commands       - order.created                            │
│                         - order.updated                            │
└───────────┬──────────────────┬──────────────────┬───────────────────┘
            │                  │                  │
            ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │ Catalog Service │  │  Order Service  │
│    (NestJS)     │  │    (NestJS)     │  │    (NestJS)     │
│   Port: 3001    │  │   Port: 3002    │  │   Port: 3003    │
│                 │  │                 │  │                 │
│   PostgreSQL    │  │    MongoDB      │  │   PostgreSQL    │
│   Port: 5432    │  │   Port: 27017   │  │   Port: 5433    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Principios de Arquitectura

1. **Microservicios Desacoplados**: Cada servicio es independiente y se comunica únicamente a través de Kafka.
2. **Event-Driven Architecture**: Comunicación asíncrona mediante eventos, sin llamadas HTTP directas entre servicios.
3. **Database per Service**: Cada microservicio tiene su propia base de datos.
4. **API Gateway Pattern**: Punto de entrada único para el frontend.

## Estructura del Proyecto

```
latamtradex/
├── latamtradex-frontend/          # Frontend (NO MODIFICAR)
├── services/                       # Backend Microservices
│   ├── shared/                    # Módulos compartidos
│   │   ├── kafka/                 # Kafka module reutilizable
│   │   │   ├── kafka.module.ts
│   │   │   ├── kafka-producer.service.ts
│   │   │   ├── kafka-consumer.service.ts
│   │   │   └── index.ts
│   │   └── types/                 # TypeScript types compartidos
│   │       ├── events.ts
│   │       └── index.ts
│   ├── api-gateway/               # API Gateway HTTP → Kafka
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── catalog/
│   │   │   │   └── order/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── health.controller.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth-service/              # Auth + PostgreSQL
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── kafka-listener.service.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── catalog-service/           # Catalog + MongoDB
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   └── product.schema.ts
│   │   │   ├── catalog.service.ts
│   │   │   ├── kafka-listener.service.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── order-service/             # Orders + PostgreSQL
│       ├── src/
│       │   ├── entities/
│       │   │   ├── order.entity.ts
│       │   │   └── order-item.entity.ts
│       │   ├── order.service.ts
│       │   ├── kafka-listener.service.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── package.json
├── .gitignore
└── README.md
```

## Microservicios

### 1. API Gateway (Port 3000)

**Responsabilidad**: Punto de entrada HTTP que convierte requests REST en comandos/eventos Kafka.

**Características**:
- Validación de requests con class-validator
- CORS habilitado para el frontend
- Endpoints REST: `/api/auth/*`, `/api/catalog/*`, `/api/orders/*`
- Publica comandos en Kafka para que los servicios los procesen

**Endpoints**:
- `POST /api/auth/register` → Publica comando a `auth.commands`
- `POST /api/auth/login` → Publica comando a `auth.commands`
- `POST /api/catalog/products` → Publica comando a `catalog.commands`
- `GET /api/catalog/products/:id` → Publica comando a `catalog.commands`
- `POST /api/orders` → Publica comando a `order.commands`

### 2. Auth Service (Port 3001)

**Responsabilidad**: Gestión de usuarios, autenticación y autorización.

**Base de Datos**: PostgreSQL (puerto 5432)

**Funcionalidades**:
- Registro de usuarios con hash de contraseñas (bcrypt)
- Login con generación de JWT
- Roles: `buyer`, `seller`, `admin`
- Publica evento `user.registered` en Kafka al crear un usuario

**Eventos Publicados**:
- `user.registered`: Cuando un nuevo usuario se registra

**Comandos que Consume**:
- `auth.commands`: `REGISTER_USER`, `LOGIN_USER`

### 3. Catalog Service (Port 3002)

**Responsabilidad**: Gestión del catálogo de productos y stock.

**Base de Datos**: MongoDB (puerto 27017)

**Funcionalidades**:
- CRUD de productos
- Gestión de inventario/stock
- Suscripción al evento `order.created` para actualizar stock de forma asíncrona
- Publica evento `stock.updated` cuando el stock cambia

**Eventos Publicados**:
- `stock.updated`: Cuando el stock de un producto cambia

**Eventos que Consume**:
- `order.created`: Para reducir el stock cuando se crea una orden

**Comandos que Consume**:
- `catalog.commands`: `CREATE_PRODUCT`, `GET_PRODUCT`

### 4. Order Service (Port 3003)

**Responsabilidad**: Gestión de pedidos y transacciones.

**Base de Datos**: PostgreSQL (puerto 5433)

**Funcionalidades**:
- Creación de órdenes
- Actualización de estados de órdenes
- Publica evento `order.created` en Kafka al crear una orden
- Cálculo automático del monto total

**Eventos Publicados**:
- `order.created`: Cuando se crea una nueva orden
- `order.updated`: Cuando se actualiza el estado de una orden

**Comandos que Consume**:
- `order.commands`: `CREATE_ORDER`

## Event-Driven Flow Example

### Flujo: Crear una Orden

```
1. Frontend → API Gateway
   POST /api/orders
   {
     "userId": "user-123",
     "items": [
       { "productId": "prod-1", "quantity": 2, "price": 100 }
     ]
   }

2. API Gateway → Kafka
   Topic: order.commands
   Command: CREATE_ORDER

3. Order Service (Consumer)
   - Consume comando de order.commands
   - Crea orden en PostgreSQL
   - Calcula total
   - Publica evento order.created

4. Kafka → Catalog Service (Consumer)
   Topic: order.created
   - Consume evento
   - Reduce stock de productos
   - Publica stock.updated
```

## Tecnologías

### Backend
- **Framework**: NestJS + TypeScript
- **Mensajería**: Apache Kafka (kafkajs)
- **Bases de Datos**:
  - PostgreSQL (Auth, Orders)
  - MongoDB (Catalog)
- **Autenticación**: JWT + bcrypt
- **Validación**: class-validator, class-transformer

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Message Broker**: Kafka + Zookeeper

## Instalación y Setup

### Prerequisitos

- Node.js 20+
- Docker + Docker Compose
- npm o yarn

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd latamtradex
```

2. Instalar dependencias de todos los servicios:
```bash
npm run install:all
```

3. Iniciar la infraestructura con Docker Compose:
```bash
npm run docker:up
```

Esto iniciará:
- Zookeeper (puerto 2181)
- Kafka (puertos 9092, 9093)
- PostgreSQL Auth (puerto 5432)
- PostgreSQL Orders (puerto 5433)
- MongoDB (puerto 27017)
- API Gateway (puerto 3000)
- Auth Service (puerto 3001)
- Catalog Service (puerto 3002)
- Order Service (puerto 3003)

4. Verificar que todos los contenedores estén corriendo:
```bash
docker-compose ps
```

5. Ver logs en tiempo real:
```bash
npm run docker:logs
```

## Scripts Disponibles

### Gestión de Docker

```bash
npm run docker:up          # Iniciar todos los servicios
npm run docker:down        # Detener todos los servicios
npm run docker:restart     # Reiniciar todos los servicios
npm run docker:build       # Reconstruir imágenes
npm run docker:clean       # Detener y eliminar volúmenes
npm run docker:logs        # Ver logs en tiempo real
```

### Gestión de Kafka

```bash
npm run kafka:topics         # Listar todos los topics
npm run kafka:create-topics  # Crear topics necesarios
```

### Desarrollo Local (sin Docker)

```bash
npm run dev:gateway    # API Gateway en modo desarrollo
npm run dev:auth       # Auth Service en modo desarrollo
npm run dev:catalog    # Catalog Service en modo desarrollo
npm run dev:order      # Order Service en modo desarrollo
```

### Build

```bash
npm run build:all      # Build todos los servicios
npm run build:gateway  # Build solo API Gateway
npm run build:auth     # Build solo Auth Service
npm run build:catalog  # Build solo Catalog Service
npm run build:order    # Build solo Order Service
```

## Variables de Entorno

Las variables de entorno están configuradas en el [docker-compose.yml](docker-compose.yml).

### API Gateway
```env
PORT=3000
KAFKA_BROKERS=kafka:9092
NODE_ENV=development
```

### Auth Service
```env
PORT=3001
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=auth-service-group
DATABASE_HOST=postgres-auth
DATABASE_PORT=5432
DATABASE_NAME=auth_db
DATABASE_USER=auth_user
DATABASE_PASSWORD=auth_password
JWT_SECRET=super-secret-jwt-key-change-in-production
```

### Catalog Service
```env
PORT=3002
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=catalog-service-group
MONGODB_URI=mongodb://catalog_user:catalog_password@mongodb:27017/catalog_db?authSource=admin
```

### Order Service
```env
PORT=3003
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=order-service-group
DATABASE_HOST=postgres-orders
DATABASE_PORT=5432
DATABASE_NAME=orders_db
DATABASE_USER=orders_user
DATABASE_PASSWORD=orders_password
```

## Testing con cURL/Postman

### Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123",
    "name": "Juan Pérez",
    "role": "seller"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123"
  }'
```

### Crear Producto

```bash
curl -X POST http://localhost:3000/api/catalog/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "description": "Laptop profesional de alta gama",
    "sku": "DELL-XPS-13-001",
    "price": 1299.99,
    "stock": 50,
    "category": "Electronics"
  }'
```

### Crear Orden

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "items": [
      {
        "productId": "product-id-here",
        "quantity": 2,
        "price": 1299.99
      }
    ]
  }'
```

## Kafka Topics

| Topic | Producer | Consumer | Descripción |
|-------|----------|----------|-------------|
| `auth.commands` | API Gateway | Auth Service | Comandos de autenticación |
| `catalog.commands` | API Gateway | Catalog Service | Comandos de catálogo |
| `order.commands` | API Gateway | Order Service | Comandos de órdenes |
| `user.registered` | Auth Service | - | Usuario registrado |
| `order.created` | Order Service | Catalog Service | Orden creada |
| `order.updated` | Order Service | - | Orden actualizada |
| `stock.updated` | Catalog Service | - | Stock actualizado |

## Monitoreo de Kafka

Para ver mensajes en un topic:

```bash
docker exec -it latamtradex-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.registered \
  --from-beginning
```

Para ver todos los grupos de consumidores:

```bash
docker exec -it latamtradex-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list
```

## Próximos Pasos (Post-MVP)

- [ ] Implementar patrón SAGA para transacciones distribuidas
- [ ] Agregar Kafka Connect para sincronización de datos
- [ ] Implementar CQRS (Command Query Responsibility Segregation)
- [ ] Agregar Event Sourcing
- [ ] Implementar API Gateway con Kong o similar
- [ ] Agregar monitoring con Prometheus + Grafana
- [ ] Implementar distributed tracing con Jaeger
- [ ] Agregar CI/CD pipeline
- [ ] Implementar rate limiting
- [ ] Agregar Redis para caching
- [ ] Implementar health checks avanzados
- [ ] Agregar tests unitarios e integración

## Troubleshooting

### Los servicios no se conectan a Kafka

1. Verificar que Kafka está corriendo:
```bash
docker-compose ps kafka
```

2. Ver logs de Kafka:
```bash
docker-compose logs kafka
```

3. Reiniciar Kafka:
```bash
docker-compose restart kafka
```

### Error de conexión a bases de datos

1. Verificar que las bases de datos están corriendo:
```bash
docker-compose ps postgres-auth postgres-orders mongodb
```

2. Verificar logs:
```bash
docker-compose logs postgres-auth
docker-compose logs mongodb
```

### Limpiar y reiniciar todo

```bash
npm run docker:clean
npm run docker:up
```

## Contribución

Este es un MVP. Para contribuir:

1. Fork el repositorio
2. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

MIT

## Contacto

Para preguntas o soporte, contactar al equipo de Latam Tradex.
