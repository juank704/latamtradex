# Diagrama de Integración Frontend-Backend

## Arquitectura Completa Integrada

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                React Application (Port 8080)                          │ │
│  │                   latamtradex-frontend/                               │ │
│  │                                                                       │ │
│  │  Pages:                   Services:              Contexts:            │ │
│  │  • /                      • auth.service        • AuthContext        │ │
│  │  • /login                 • catalog.service     • (user, token)      │ │
│  │  • /register              • order.service                            │ │
│  │  • /products                                                          │ │
│  │  • /orders                HTTP Client:                               │ │
│  │                           • axios (api-client)                        │ │
│  │                           • Auto JWT headers                          │ │
│  └───────────────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTP/REST
                                       │ Authorization: Bearer <JWT>
                                       │ Content-Type: application/json
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              API Gateway (NestJS) - Port 3000                         │ │
│  │                     http://localhost:3000/api                         │ │
│  │                                                                       │ │
│  │  Endpoints:                                                           │ │
│  │  POST /auth/register    → auth.commands                              │ │
│  │  POST /auth/login       → auth.commands                              │ │
│  │  POST /catalog/products → catalog.commands                           │ │
│  │  GET  /catalog/products/:id → catalog.commands                       │ │
│  │  POST /orders           → order.commands                             │ │
│  │                                                                       │ │
│  │  Responsibilities:                                                    │ │
│  │  • HTTP → Kafka command translation                                  │ │
│  │  • CORS handling                                                      │ │
│  │  • Request validation                                                 │ │
│  │  • Returns 202 Accepted                                              │ │
│  └───────────────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Kafka Commands
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE BROKER LAYER                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   Apache Kafka Cluster (Port 9092/9093)               │ │
│  │                                                                       │ │
│  │  Command Topics (Gateway → Services):                                │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ • auth.commands      → Auth Service                          │   │ │
│  │  │ • catalog.commands   → Catalog Service                       │   │ │
│  │  │ • order.commands     → Order Service                         │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  Event Topics (Service → Service):                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ • user.registered    (Auth → *)                              │   │ │
│  │  │ • order.created      (Order → Catalog) ← Stock Update!       │   │ │
│  │  │ • order.updated      (Order → *)                             │   │ │
│  │  │ • stock.updated      (Catalog → *)                           │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  Zookeeper (Port 2181) - Coordination                                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
                 ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                                 │
│                                                                             │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│  │  Auth Service   │      │ Catalog Service │      │  Order Service  │    │
│  │   (NestJS)      │      │    (NestJS)     │      │    (NestJS)     │    │
│  │   Port: 3001    │      │   Port: 3002    │      │   Port: 3003    │    │
│  │                 │      │                 │      │                 │    │
│  │ Consumes:       │      │ Consumes:       │      │ Consumes:       │    │
│  │ • auth.commands │      │ • catalog.cmds  │      │ • order.commands│    │
│  │                 │      │ • order.created │◄─┐   │                 │    │
│  │ Publishes:      │      │                 │  │   │ Publishes:      │    │
│  │ • user.         │      │ Publishes:      │  │   │ • order.created─┼────┘
│  │   registered    │      │ • stock.updated │  └───┤ • order.updated │
│  │                 │      │                 │      │                 │
│  │ Features:       │      │ Features:       │      │ Features:       │
│  │ • Register      │      │ • CRUD products │      │ • Create orders │
│  │ • Login (JWT)   │      │ • Stock mgmt    │      │ • Track status  │
│  │ • Password hash │      │ • Auto reduce   │      │ • Calculate $   │
│  │ • Roles         │      │   on order      │      │                 │
│  └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
│           │                        │                        │          │
└─────────────────────────────────────────────────────────────────────────────┘
            │                        │                        │
            ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                               │
│                                                                             │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│  │  PostgreSQL     │      │    MongoDB      │      │  PostgreSQL     │    │
│  │   (Auth DB)     │      │  (Catalog DB)   │      │  (Orders DB)    │    │
│  │  Port: 5432     │      │  Port: 27017    │      │  Port: 5433     │    │
│  │                 │      │                 │      │                 │    │
│  │ Tables:         │      │ Collections:    │      │ Tables:         │    │
│  │ • users         │      │ • products      │      │ • orders        │    │
│  │   - id          │      │   - _id         │      │   - id          │    │
│  │   - email       │      │   - name        │      │   - userId      │    │
│  │   - password    │      │   - sku         │      │   - status      │    │
│  │   - name        │      │   - price       │      │   - totalAmount │    │
│  │   - role        │      │   - stock       │      │ • order_items   │    │
│  │   - createdAt   │      │   - category    │      │   - productId   │    │
│  │                 │      │   - createdAt   │      │   - quantity    │    │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos: Crear Orden → Actualizar Stock (Event-Driven)

```
┌──────────┐
│ Frontend │ POST /api/orders
│          ├────────────────────────────────┐
└──────────┘                                │
                                            ▼
                                    ┌────────────────┐
                                    │  API Gateway   │
                                    │ Valida request │
                                    └───────┬────────┘
                                            │
                                            │ Publica comando
                                            │ topic: order.commands
                                            ▼
                                    ┌────────────────┐
                                    │     Kafka      │
                                    │  order.commands│
                                    └───────┬────────┘
                                            │
                                            │ Consume
                                            ▼
                                    ┌────────────────┐
                                    │ Order Service  │
                                    │ 1. Crea orden  │
                                    │    en Postgres │
                                    │ 2. Calcula $   │
                                    └───────┬────────┘
                                            │
                                            │ Publica evento
                                            │ topic: order.created
                                            ▼
                                    ┌────────────────┐
                                    │     Kafka      │
                                    │ order.created  │
                                    └───────┬────────┘
                                            │
                                            │ Consume
                                            ▼
                                   ┌─────────────────┐
                                   │ Catalog Service │
                                   │ Escucha eventos │
                                   └────────┬────────┘
                                            │
                                            │ Procesa
                                            ▼
                                   ┌─────────────────┐
                                   │   MongoDB       │
                                   │ Reduce stock    │
                                   │ product.stock   │
                                   │ -= quantity     │
                                   └────────┬────────┘
                                            │
                                            │ Publica
                                            ▼
                                   ┌─────────────────┐
                                   │     Kafka       │
                                   │ stock.updated   │
                                   └─────────────────┘
```

## Características Clave de la Integración

### 1. Separación de Capas

```
Frontend Layer        → UI/UX, Estado, Navegación
↓
API Gateway Layer     → HTTP → Kafka translation
↓
Message Broker Layer  → Event distribution
↓
Business Logic Layer  → Microservicios independientes
↓
Data Layer           → Database per service
```

### 2. Autenticación Flow

```
Usuario → Login Form
    ↓
Frontend → POST /api/auth/login
    ↓
API Gateway → Kafka (auth.commands)
    ↓
Auth Service → Valida en PostgreSQL
    ↓
Generate JWT Token
    ↓
Response ← Frontend
    ↓
localStorage.setItem('token', jwt)
    ↓
AuthContext actualizado
    ↓
Navbar muestra usuario
```

### 3. Event-Driven Communication

```
Frontend NUNCA llama directamente a los microservicios
                    ↓
         Siempre vía API Gateway
                    ↓
            Kafka como middleware
                    ↓
    Microservicios completamente desacoplados
                    ↓
         Eventos asíncronos entre servicios
```

## Tecnologías por Capa

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **UI:** shadcn/ui + Tailwind CSS
- **HTTP:** Axios
- **Estado:** Context API + TanStack Query
- **Routing:** React Router v7

### API Gateway
- **Framework:** NestJS
- **Validation:** class-validator
- **Kafka Client:** kafkajs

### Microservicios
- **Framework:** NestJS + TypeScript
- **Auth DB:** PostgreSQL + TypeORM
- **Catalog DB:** MongoDB + Mongoose
- **Orders DB:** PostgreSQL + TypeORM
- **Messaging:** Kafka (kafkajs)

### Infraestructura
- **Containers:** Docker + Docker Compose
- **Message Broker:** Apache Kafka + Zookeeper
- **Databases:** PostgreSQL 15, MongoDB 7

## Seguridad

```
Frontend
  ↓ JWT en Authorization header
API Gateway
  ↓ Valida token (futuro)
Microservicios
  ↓ Confían en Gateway
Databases
  ↓ Credenciales en env vars
```

## Escalabilidad

```
Frontend → Puede servirse desde CDN
    ↓
API Gateway → Escalable horizontalmente (N instancias)
    ↓
Kafka → Particiones para paralelismo
    ↓
Microservicios → Cada uno escala independientemente
    ↓
Databases → Read replicas + sharding (futuro)
```

---

**Este diagrama representa la arquitectura completa integrada de Latam Tradex v1.0**
