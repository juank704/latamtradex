# Arquitectura Detallada - Latam Tradex

## Resumen Ejecutivo

Latam Tradex está construido con una **arquitectura de microservicios pura** con comunicación **100% basada en eventos** mediante Apache Kafka. No existen llamadas HTTP directas entre servicios de negocio, garantizando desacoplamiento total y escalabilidad horizontal.

## Principios Arquitectónicos

### 1. Event-Driven Architecture (EDA)

- **No hay llamadas síncronas entre servicios**: Toda comunicación se realiza mediante eventos asíncronos en Kafka.
- **Publish-Subscribe Pattern**: Los servicios publican eventos sin conocer quién los consume.
- **Eventual Consistency**: El sistema mantiene consistencia eventual, no inmediata.

### 2. Microservices Principles

- **Single Responsibility**: Cada servicio tiene una responsabilidad única y bien definida.
- **Database per Service**: Cada microservicio gestiona su propia base de datos.
- **Independent Deployment**: Los servicios se despliegan de forma independiente.
- **Technology Agnostic**: Aunque todos usan NestJS, cada servicio podría usar una tecnología diferente.

### 3. API Gateway Pattern

- **Punto de entrada único**: El frontend solo conoce al API Gateway.
- **Protocol Translation**: Convierte HTTP REST a comandos/eventos Kafka.
- **Simplificación del cliente**: El frontend no necesita conocer la complejidad interna.

## Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Frontend Application (React/Vue)                 │    │
│  │                   latamtradex-frontend/                       │    │
│  └────────────────────────┬─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/REST (Port 3000)
                             │
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                               │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                      API Gateway (NestJS)                     │     │
│  │                                                               │     │
│  │  Responsibilities:                                            │     │
│  │  • HTTP Request Validation                                    │     │
│  │  • Protocol Translation (HTTP → Kafka)                        │     │
│  │  • CORS Management                                            │     │
│  │  • Request Routing                                            │     │
│  └────────────────────────┬─────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
                             │
                             │ Kafka Commands
                             │
┌──────────────────────────────────────────────────────────────────────────┐
│                         MESSAGE BROKER LAYER                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                      Apache Kafka Cluster                       │    │
│  │                                                                 │    │
│  │  Command Topics:          Event Topics:                        │    │
│  │  • auth.commands          • user.registered                    │    │
│  │  • catalog.commands       • order.created                      │    │
│  │  • order.commands         • order.updated                      │    │
│  │                           • stock.updated                       │    │
│  │                                                                 │    │
│  │  Broker: Port 9092 (internal) / 9093 (external)                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                        Zookeeper                                │    │
│  │                    (Kafka Coordination)                         │    │
│  │                       Port: 2181                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
                             │
                             │ Events & Commands
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                             │
│                                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐          │
│  │Auth Service  │      │Catalog Svc   │      │Order Service │          │
│  │   (NestJS)   │      │   (NestJS)   │      │   (NestJS)   │          │
│  │  Port: 3001  │      │  Port: 3002  │      │  Port: 3003  │          │
│  │              │      │              │      │              │          │
│  │ Consumes:    │      │ Consumes:    │      │ Consumes:    │          │
│  │ • auth.cmd   │      │ • catalog.cmd│      │ • order.cmd  │          │
│  │              │      │ • order.      │      │              │          │
│  │              │      │   created     │      │              │          │
│  │ Publishes:   │      │              │      │ Publishes:   │          │
│  │ • user.      │      │ Publishes:   │      │ • order.     │          │
│  │   registered │      │ • stock.     │      │   created    │          │
│  │              │      │   updated    │      │ • order.     │          │
│  │              │      │              │      │   updated    │          │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘          │
└──────────────────────────────────────────────────────────────────────────┘
           │                     │                     │
           │                     │                     │
           ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                           │
│                                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐          │
│  │ PostgreSQL   │      │   MongoDB    │      │ PostgreSQL   │          │
│  │   (Auth)     │      │  (Catalog)   │      │  (Orders)    │          │
│  │ Port: 5432   │      │ Port: 27017  │      │ Port: 5433   │          │
│  │              │      │              │      │              │          │
│  │ Tables:      │      │ Collections: │      │ Tables:      │          │
│  │ • users      │      │ • products   │      │ • orders     │          │
│  │              │      │              │      │ • order_items│          │
│  └──────────────┘      └──────────────┘      └──────────────┘          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Flujo de Eventos Detallado

### Flujo 1: Registro de Usuario

```
┌─────────┐     ┌─────────────┐     ┌───────┐     ┌──────────────┐     ┌──────────┐
│Frontend │     │API Gateway  │     │ Kafka │     │Auth Service  │     │PostgreSQL│
└────┬────┘     └──────┬──────┘     └───┬───┘     └──────┬───────┘     └────┬─────┘
     │                 │                │                │                   │
     │ POST /register  │                │                │                   │
     ├────────────────>│                │                │                   │
     │                 │                │                │                   │
     │                 │ Validate DTO   │                │                   │
     │                 ├───────────┐    │                │                   │
     │                 │           │    │                │                   │
     │                 │<──────────┘    │                │                   │
     │                 │                │                │                   │
     │                 │ Publish Command│                │                   │
     │                 │ auth.commands  │                │                   │
     │                 ├───────────────>│                │                   │
     │                 │                │                │                   │
     │ 202 Accepted    │                │   Consume      │                   │
     │<────────────────┤                │   Command      │                   │
     │                 │                ├───────────────>│                   │
     │                 │                │                │                   │
     │                 │                │                │ Hash Password     │
     │                 │                │                ├──────────┐        │
     │                 │                │                │          │        │
     │                 │                │                │<─────────┘        │
     │                 │                │                │                   │
     │                 │                │                │ INSERT user       │
     │                 │                │                ├──────────────────>│
     │                 │                │                │                   │
     │                 │                │                │   User Created    │
     │                 │                │                │<──────────────────┤
     │                 │                │                │                   │
     │                 │                │ Publish Event  │                   │
     │                 │                │ user.registered│                   │
     │                 │                │<───────────────┤                   │
     │                 │                │                │                   │
     ▼                 ▼                ▼                ▼                   ▼

Event Published: user.registered
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "seller",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Flujo 2: Creación de Orden (Event-Driven Stock Update)

```
┌─────────┐  ┌─────────┐  ┌───────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌────────┐
│Frontend │  │Gateway  │  │ Kafka │  │ Order  │  │Postgres│  │ Catalog  │  │MongoDB │
└────┬────┘  └────┬────┘  └───┬───┘  └───┬────┘  └───┬────┘  └────┬─────┘  └───┬────┘
     │            │            │          │           │            │            │
     │POST /orders│            │          │           │            │            │
     ├───────────>│            │          │           │            │            │
     │            │            │          │           │            │            │
     │            │Validate    │          │           │            │            │
     │            ├────────┐   │          │           │            │            │
     │            │        │   │          │           │            │            │
     │            │<───────┘   │          │           │            │            │
     │            │            │          │           │            │            │
     │            │Publish Cmd │          │           │            │            │
     │            │order.cmd   │          │           │            │            │
     │            ├───────────>│          │           │            │            │
     │            │            │          │           │            │            │
     │202 Accepted│            │ Consume  │           │            │            │
     │<───────────┤            ├─────────>│           │            │            │
     │            │            │          │           │            │            │
     │            │            │          │Calculate  │            │            │
     │            │            │          │Total      │            │            │
     │            │            │          ├────────┐  │            │            │
     │            │            │          │        │  │            │            │
     │            │            │          │<───────┘  │            │            │
     │            │            │          │           │            │            │
     │            │            │          │INSERT order            │            │
     │            │            │          ├──────────>│            │            │
     │            │            │          │           │            │            │
     │            │            │          │Created    │            │            │
     │            │            │          │<──────────┤            │            │
     │            │            │          │           │            │            │
     │            │            │Publish   │           │            │            │
     │            │            │order.    │           │            │            │
     │            │            │created   │           │            │            │
     │            │            │<─────────┤           │            │            │
     │            │            │          │           │            │            │
     │            │            │          │           │   Consume  │            │
     │            │            │          │           │   order.   │            │
     │            │            │          │           │   created  │            │
     │            │            ├──────────────────────────────────>│            │
     │            │            │          │           │            │            │
     │            │            │          │           │            │Reduce Stock│
     │            │            │          │           │            │UPDATE      │
     │            │            │          │           │            ├───────────>│
     │            │            │          │           │            │            │
     │            │            │          │           │            │Updated     │
     │            │            │          │           │            │<───────────┤
     │            │            │          │           │            │            │
     │            │            │Publish   │           │            │            │
     │            │            │stock.    │           │            │            │
     │            │            │updated   │           │            │            │
     │            │            │<─────────────────────────────────┤            │
     ▼            ▼            ▼          ▼           ▼            ▼            ▼

Key Points:
1. Order Service NO llama directamente a Catalog Service
2. Catalog Service se entera de la orden mediante el evento order.created
3. Stock se actualiza de forma asíncrona y automática
4. Desacoplamiento total entre servicios
```

## Modelo de Datos

### Auth Service (PostgreSQL)

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Catalog Service (MongoDB)

```javascript
// products collection
{
  _id: ObjectId("..."),
  name: "Producto X",
  description: "Descripción del producto",
  sku: "SKU-001",  // unique
  price: 99.99,
  stock: 100,
  category: "Categoría",
  imageUrl: "https://...",
  isActive: true,
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:00:00Z")
}

// Indexes
db.products.createIndex({ sku: 1 }, { unique: true })
db.products.createIndex({ category: 1 })
db.products.createIndex({ isActive: 1 })
```

### Order Service (PostgreSQL)

```sql
-- orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    "productId" VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
);

CREATE INDEX idx_orders_userId ON orders("userId");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_orderId ON order_items("orderId");
CREATE INDEX idx_order_items_productId ON order_items("productId");
```

## Kafka Topics Schema

### Command Topics

#### auth.commands
```json
{
  "command": "REGISTER_USER | LOGIN_USER",
  "data": {
    "email": "string",
    "password": "string",
    "name": "string",
    "role": "buyer | seller | admin"
  }
}
```

#### catalog.commands
```json
{
  "command": "CREATE_PRODUCT | GET_PRODUCT",
  "data": {
    "name": "string",
    "description": "string",
    "sku": "string",
    "price": "number",
    "stock": "number",
    "category": "string"
  }
}
```

#### order.commands
```json
{
  "command": "CREATE_ORDER",
  "data": {
    "userId": "string",
    "items": [
      {
        "productId": "string",
        "quantity": "number",
        "price": "number"
      }
    ]
  }
}
```

### Event Topics

#### user.registered
```json
{
  "userId": "uuid",
  "email": "string",
  "role": "string",
  "createdAt": "ISO-8601"
}
```

#### order.created
```json
{
  "orderId": "uuid",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string",
  "createdAt": "ISO-8601"
}
```

#### order.updated
```json
{
  "orderId": "uuid",
  "status": "string",
  "updatedAt": "ISO-8601"
}
```

#### stock.updated
```json
{
  "productId": "string",
  "quantity": "number",
  "operation": "increase | decrease",
  "updatedAt": "ISO-8601"
}
```

## Módulos Compartidos

### Shared Kafka Module

El módulo Kafka compartido ([services/shared/kafka](services/shared/kafka)) proporciona:

1. **KafkaModule**: Módulo NestJS configurable
2. **KafkaProducerService**: Servicio para publicar eventos
3. **KafkaConsumerService**: Servicio para consumir eventos

**Ventajas**:
- Reutilizable por todos los servicios
- Configuración centralizada
- Manejo de errores estandarizado
- Logging consistente

### Shared Types Module

El módulo de tipos compartidos ([services/shared/types](services/shared/types)) proporciona:

1. **EventTopics**: Enum con todos los topics
2. **Event Interfaces**: Interfaces TypeScript para cada evento
3. **Type Safety**: Garantiza consistencia entre servicios

## Patrones de Diseño Aplicados

### 1. API Gateway Pattern
- Punto de entrada único para clientes externos
- Simplifica la comunicación del frontend
- Permite cambios internos sin afectar clientes

### 2. Event Sourcing (Parcial)
- Los eventos son la fuente de verdad
- Estado derivado de eventos pasados
- Trazabilidad completa de cambios

### 3. CQRS (Command Query Responsibility Segregation)
- Comandos separados de queries
- Optimización independiente de lecturas/escrituras
- Escalabilidad diferenciada

### 4. Publisher-Subscriber
- Productores no conocen consumidores
- Permite agregar consumidores sin cambios
- Desacoplamiento total

### 5. Database per Service
- Cada servicio posee sus datos
- No hay base de datos compartida
- Autonomía completa

## Consideraciones de Escalabilidad

### Horizontal Scaling

Cada servicio puede escalar independientemente:

```yaml
# docker-compose con réplicas
services:
  order-service:
    deploy:
      replicas: 5  # 5 instancias del Order Service
```

### Kafka Partitioning

Los topics están particionados para paralelismo:

```bash
# Crear topic con 3 particiones
kafka-topics --create \
  --topic order.created \
  --partitions 3 \
  --replication-factor 1
```

### Consumer Groups

Múltiples instancias del mismo servicio comparten el trabajo:

```
Order Service Instance 1 → Partition 0
Order Service Instance 2 → Partition 1
Order Service Instance 3 → Partition 2
```

## Resiliencia y Manejo de Errores

### Retry Mechanism

```typescript
// KafkaProducerService tiene retry automático
this.kafka = new Kafka({
  clientId: this.options.clientId,
  brokers: this.options.brokers,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});
```

### Dead Letter Queue (Próximo)

Para eventos que fallan después de múltiples reintentos:

```
order.created → Processing Failed → order.created.dlq
```

### Circuit Breaker (Próximo)

Evitar cascadas de fallos:

```
Service Down → Circuit Open → Reject Fast
```

## Seguridad

### Nivel de Transporte
- Kafka puede configurarse con SSL/TLS
- Autenticación SASL

### Nivel de Aplicación
- JWT para autenticación de usuarios
- Passwords hasheadas con bcrypt (10 rounds)

### Nivel de Red
- Docker network aislada
- Solo API Gateway expuesto públicamente

## Monitoreo y Observabilidad (Próximo)

### Métricas Propuestas
- Latencia de eventos (producer → consumer)
- Throughput de mensajes por topic
- Consumer lag (retraso de consumidores)
- Tasa de errores por servicio

### Logging Estructurado
Cada servicio usa Logger de NestJS:

```typescript
this.logger.log(`Order created: ${order.id}`);
this.logger.error('Error creating order', error);
```

### Distributed Tracing (Próximo)
- Jaeger o Zipkin
- Trace ID propagado en headers de Kafka

## Comparación: Event-Driven vs REST

### REST (NO usado entre servicios)

```
Order Service → HTTP POST → Catalog Service
                           ↓
                      Update Stock
```

**Problemas**:
- Acoplamiento fuerte
- Punto único de fallo
- Difícil escalabilidad
- Latencia síncrona

### Event-Driven (USADO)

```
Order Service → Kafka Event → Catalog Service
                             ↓
                        Update Stock
```

**Ventajas**:
- ✅ Desacoplamiento total
- ✅ Sin puntos únicos de fallo
- ✅ Escalabilidad horizontal
- ✅ Procesamiento asíncrono
- ✅ Fácil agregar consumidores

## Roadmap Técnico

### Fase 1: MVP (Actual)
- ✅ Arquitectura de microservicios
- ✅ Kafka como message broker
- ✅ 3 servicios core
- ✅ Database per service

### Fase 2: Producción
- [ ] SAGA pattern para transacciones distribuidas
- [ ] API Gateway con Kong/NGINX
- [ ] Autenticación centralizada
- [ ] Rate limiting

### Fase 3: Observabilidad
- [ ] Prometheus + Grafana
- [ ] Jaeger distributed tracing
- [ ] ELK stack para logs
- [ ] Health checks avanzados

### Fase 4: Resilencia
- [ ] Circuit breakers
- [ ] Bulkheads
- [ ] Dead letter queues
- [ ] Event replay

### Fase 5: Avanzado
- [ ] Event Sourcing completo
- [ ] CQRS con read replicas
- [ ] Kafka Streams
- [ ] GraphQL federation

## Conclusión

Esta arquitectura proporciona:

1. **Escalabilidad**: Servicios independientes escalables horizontalmente
2. **Resiliencia**: Sin puntos únicos de fallo
3. **Mantenibilidad**: Servicios pequeños y enfocados
4. **Flexibilidad**: Fácil agregar nuevos servicios/features
5. **Performance**: Procesamiento asíncrono y paralelo

El desacoplamiento total mediante Kafka permite que Latam Tradex crezca orgánicamente, agregando nuevos microservicios según sea necesario sin modificar los existentes.
