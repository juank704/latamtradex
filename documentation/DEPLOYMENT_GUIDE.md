# Guía de Despliegue - Latam Tradex

Esta guía detalla el proceso completo para desplegar los microservicios en AWS y el frontend en Vercel.

## 📋 Tabla de Contenidos

1. [Preparación Pre-Despliegue](#preparación-pre-despliegue)
2. [Arquitectura de Despliegue AWS](#arquitectura-de-despliegue-aws)
3. [Configuración de AWS](#configuración-de-aws)
4. [Despliegue de Microservicios en AWS](#despliegue-de-microservicios-en-aws)
5. [Despliegue del Frontend en Vercel](#despliegue-del-frontend-en-vercel)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Configuración de DNS y Dominios](#configuración-de-dns-y-dominios)
8. [Pruebas Post-Despliegue](#pruebas-post-despliegue)
9. [Monitoreo y Logging](#monitoreo-y-logging)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Preparación Pre-Despliegue

### Cambios Necesarios en el Código

Antes de desplegar, necesitas realizar los siguientes cambios:

#### 1. Configuración de CORS en API Gateway

**Archivo:** `services/api-gateway/src/main.ts`

**Cambio necesario:** Ya está configurado para aceptar múltiples orígenes, pero en producción debes configurar la variable de entorno `CORS_ORIGIN` con el dominio de Vercel.

**Estado actual:** ✅ Ya soporta múltiples orígenes vía variable de entorno

```typescript
// Código actual (ya está bien)
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:8080'];

app.enableCors({
  origin: corsOrigins,
  credentials: true,
});
```

#### 2. Desactivar `synchronize` en TypeORM (IMPORTANTE)

**Archivos a modificar:**
- `services/auth-service/src/app.module.ts`
- `services/order-service/src/app.module.ts`

**Cambio necesario:** Cambiar `synchronize: true` a `synchronize: false` o mejor aún, usar migraciones.

**En `services/auth-service/src/app.module.ts`:**
```typescript
// ANTES (desarrollo)
synchronize: true, // Only for development

// DESPUÉS (producción)
synchronize: process.env.NODE_ENV === 'development',
```

**En `services/order-service/src/app.module.ts`:**
```typescript
// ANTES (desarrollo)
synchronize: true, // Only for development

// DESPUÉS (producción)
synchronize: process.env.NODE_ENV === 'development',
```

#### 3. Cambiar JWT_SECRET en producción

**Archivo:** `docker-compose.yml` (solo referencia)

**Cambio necesario:** En producción, NUNCA uses `super-secret-jwt-key-change-in-production`. Genera un secreto fuerte usando:

```bash
# Generar un JWT_SECRET seguro
openssl rand -base64 32
```

#### 4. Configurar NODE_ENV para producción

**Cambio necesario:** Asegúrate de que `NODE_ENV=production` en todos los servicios en producción.

#### 5. Frontend - Variable de Entorno para API

**Archivo:** `latamtradex-frontend/.env` (o variables en Vercel)

**Cambio necesario:** Configurar `VITE_API_BASE_URL` con la URL del API Gateway en AWS.

---

## 🏗️ Arquitectura de Despliegue AWS

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                    │
│                    https://tu-app.vercel.app                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Application Load Balancer (ALB)                │
│              https://api.tu-dominio.com                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  API Gateway  │    │  Auth Service │    │ Catalog/Order │
│   (ECS Task)  │    │   (ECS Task)  │    │  (ECS Tasks)  │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AWS MSK (Kafka)│
                    └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  RDS Postgres │    │  DocumentDB   │    │  RDS Postgres │
│   (Auth DB)   │    │ (Catalog DB)  │    │  (Orders DB)  │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Servicios AWS a Utilizar

1. **ECS (Elastic Container Service) con Fargate**: Para ejecutar los microservicios
2. **RDS PostgreSQL**: Para las bases de datos de Auth y Orders
3. **Amazon DocumentDB**: Para la base de datos de Catalog (MongoDB-compatible)
4. **Amazon MSK (Managed Streaming for Kafka)**: Para Kafka
5. **Application Load Balancer (ALB)**: Para enrutar el tráfico al API Gateway
6. **VPC**: Red privada para los servicios
7. **ECR (Elastic Container Registry)**: Para almacenar las imágenes Docker
8. **Secrets Manager**: Para almacenar secretos (JWT_SECRET, passwords de DB, etc.)
9. **CloudWatch**: Para logs y monitoreo
10. **Route 53**: Para DNS (opcional, puedes usar otro servicio DNS)

---

## ☁️ Configuración de AWS

### Paso 1: Crear una VPC

1. Ve a **VPC Dashboard** en AWS Console
2. Crea una nueva VPC:
   - **Nombre:** `latamtradex-vpc`
   - **CIDR Block:** `10.0.0.0/16`
3. Crea 3 subredes públicas (para ALB) y 3 privadas (para servicios):
   - **Public Subnets:** `10.0.1.0/24`, `10.0.2.0/24`, `10.0.3.0/24` (en diferentes AZs)
   - **Private Subnets:** `10.0.11.0/24`, `10.0.12.0/24`, `10.0.13.0/24` (en diferentes AZs)
4. Crea un **Internet Gateway** y conéctalo a la VPC
5. Crea un **NAT Gateway** en una de las subredes públicas
6. Crea **Route Tables**:
   - Una para subredes públicas (ruta a Internet Gateway)
   - Una para subredes privadas (ruta a NAT Gateway)

### Paso 2: Crear Security Groups

#### Security Group para ALB
- **Nombre:** `latamtradex-alb-sg`
- **Inbound Rules:**
  - Puerto 80 (HTTP) desde 0.0.0.0/0
  - Puerto 443 (HTTPS) desde 0.0.0.0/0
- **Outbound Rules:** Todo el tráfico

#### Security Group para API Gateway
- **Nombre:** `latamtradex-api-gateway-sg`
- **Inbound Rules:**
  - Puerto 3000 desde el Security Group del ALB
- **Outbound Rules:** Todo el tráfico

#### Security Group para Microservicios
- **Nombre:** `latamtradex-services-sg`
- **Inbound Rules:**
  - No necesita reglas (solo comunicación interna)
- **Outbound Rules:** Todo el tráfico

#### Security Group para Bases de Datos
- **Nombre:** `latamtradex-db-sg`
- **Inbound Rules:**
  - PostgreSQL (5432) desde `latamtradex-services-sg`
  - MongoDB (27017) desde `latamtradex-services-sg`
- **Outbound Rules:** Ninguno

#### Security Group para MSK
- **Nombre:** `latamtradex-msk-sg`
- **Inbound Rules:**
  - Puerto 9092 desde `latamtradex-services-sg`
  - Puerto 9094 desde `latamtradex-services-sg`
- **Outbound Rules:** Todo el tráfico

### Paso 3: Crear RDS PostgreSQL (Auth DB)

1. Ve a **RDS Dashboard** → **Create database**
2. Configuración:
   - **Engine:** PostgreSQL
   - **Version:** 15.x (o la última estable)
   - **Template:** Production
   - **DB Instance Identifier:** `latamtradex-auth-db`
   - **Master Username:** `auth_user` (o el que prefieras)
   - **Master Password:** Genera una contraseña fuerte (guárdala en Secrets Manager)
   - **DB Instance Class:** `db.t3.micro` (para empezar, escala después)
   - **Storage:** 20 GB (ajusta según necesidades)
   - **VPC:** `latamtradex-vpc`
   - **Subnet Group:** Crea uno con las subredes privadas
   - **Security Group:** `latamtradex-db-sg`
   - **Database Name:** `auth_db`
   - **Backup:** Habilita backups automáticos
   - **Monitoring:** Habilita Enhanced Monitoring

3. Anota el **Endpoint** (ej: `latamtradex-auth-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Paso 4: Crear RDS PostgreSQL (Orders DB)

Repite el Paso 3 con:
- **DB Instance Identifier:** `latamtradex-orders-db`
- **Master Username:** `orders_user`
- **Database Name:** `orders_db`

### Paso 5: Crear Amazon DocumentDB (Catalog DB)

1. Ve a **DocumentDB Dashboard** → **Create cluster**
2. Configuración:
   - **Cluster Identifier:** `latamtradex-catalog-cluster`
   - **Engine Version:** 5.0 (MongoDB 5.0 compatible)
   - **Instance Class:** `db.t3.medium` (mínimo recomendado)
   - **Instance Count:** 1 (para empezar)
   - **Master Username:** `catalog_user`
   - **Master Password:** Genera una contraseña fuerte
   - **VPC:** `latamtradex-vpc`
   - **Subnet Group:** Crea uno con las subredes privadas
   - **Security Group:** `latamtradex-db-sg`

3. Anota el **Endpoint** del cluster

### Paso 6: Crear Amazon MSK (Kafka)

1. Ve a **MSK Dashboard** → **Create cluster**
2. Configuración:
   - **Cluster Name:** `latamtradex-kafka-cluster`
   - **Kafka Version:** 3.5.1 (o la última estable)
   - **Number of broker nodes:** 3 (recomendado para producción)
   - **Broker Instance Type:** `kafka.t3.small` (para empezar)
   - **Storage:** 100 GB por broker
   - **VPC:** `latamtradex-vpc`
   - **Subnet Groups:** Selecciona las subredes privadas
   - **Security Group:** `latamtradex-msk-sg`

3. Espera a que el cluster esté activo (15-20 minutos)
4. Anota el **Bootstrap Brokers** (necesitarás los endpoints internos)

### Paso 7: Crear Secrets en AWS Secrets Manager

Crea los siguientes secretos:

#### 1. JWT Secret
- **Nombre:** `latamtradex/jwt-secret`
- **Valor:** Genera con `openssl rand -base64 32`

#### 2. Auth DB Credentials
- **Nombre:** `latamtradex/auth-db-credentials`
- **Valor (JSON):**
```json
{
  "username": "auth_user",
  "password": "tu-password-aqui",
  "host": "latamtradex-auth-db.xxxxx.us-east-1.rds.amazonaws.com",
  "port": "5432",
  "database": "auth_db"
}
```

#### 3. Orders DB Credentials
- **Nombre:** `latamtradex/orders-db-credentials`
- **Valor (JSON):**
```json
{
  "username": "orders_user",
  "password": "tu-password-aqui",
  "host": "latamtradex-orders-db.xxxxx.us-east-1.rds.amazonaws.com",
  "port": "5432",
  "database": "orders_db"
}
```

#### 4. Catalog DB Credentials
- **Nombre:** `latamtradex/catalog-db-credentials`
- **Valor (JSON):**
```json
{
  "username": "catalog_user",
  "password": "tu-password-aqui",
  "host": "latamtradex-catalog-cluster.xxxxx.docdb.amazonaws.com",
  "port": "27017",
  "database": "catalog_db"
}
```

#### 5. Kafka Brokers
- **Nombre:** `latamtradex/kafka-brokers`
- **Valor (JSON):**
```json
{
  "brokers": "broker1:9092,broker2:9092,broker3:9092"
}
```

### Paso 8: Crear ECR Repositories

Para cada servicio, crea un repositorio en ECR:

```bash
# Autenticarse en ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <tu-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Crear repositorios
aws ecr create-repository --repository-name latamtradex/api-gateway --region us-east-1
aws ecr create-repository --repository-name latamtradex/auth-service --region us-east-1
aws ecr create-repository --repository-name latamtradex/catalog-service --region us-east-1
aws ecr create-repository --repository-name latamtradex/order-service --region us-east-1
```

Anota las URIs de los repositorios (ej: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/latamtradex/api-gateway`)

---

## 🚀 Despliegue de Microservicios en AWS

### Paso 1: Construir y Subir Imágenes Docker a ECR

Para cada servicio, ejecuta:

```bash
# Definir variables
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<tu-account-id>
ECR_REPO=latamtradex/api-gateway  # Cambiar para cada servicio

# Construir la imagen
cd services
docker build -f api-gateway/Dockerfile -t $ECR_REPO:latest .

# Etiquetar para ECR
docker tag $ECR_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# Subir a ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
```

Repite para:
- `latamtradex/auth-service`
- `latamtradex/catalog-service`
- `latamtradex/order-service`

### Paso 2: Crear Task Definitions en ECS

#### Task Definition para API Gateway

1. Ve a **ECS Dashboard** → **Task Definitions** → **Create new Task Definition**
2. Configuración:
   - **Task Definition Family:** `latamtradex-api-gateway`
   - **Launch Type:** Fargate
   - **Task Role:** Crea un IAM Role con permisos para leer Secrets Manager
   - **Task Execution Role:** Crea un IAM Role con permisos para ECR y CloudWatch Logs
   - **CPU:** 0.5 vCPU (512)
   - **Memory:** 1 GB (1024)
   - **Container Definitions:**
     - **Name:** `api-gateway`
     - **Image:** `<account-id>.dkr.ecr.us-east-1.amazonaws.com/latamtradex/api-gateway:latest`
     - **Port Mappings:** 3000
     - **Environment Variables:**
       ```
       NODE_ENV=production
       PORT=3000
       ```
     - **Secrets (usar Secrets Manager):**
       ```
       KAFKA_BROKERS: arn:aws:secretsmanager:region:account:secret:latamtradex/kafka-brokers
       CORS_ORIGIN: (configurar manualmente o crear secreto)
       ```
     - **Log Configuration:**
       - **Log Driver:** awslogs
       - **Log Group:** `/ecs/latamtradex-api-gateway`
       - **Region:** tu región
       - **Stream Prefix:** `api-gateway`

#### Task Definition para Auth Service

Similar al API Gateway, pero con:
- **Family:** `latamtradex-auth-service`
- **CPU:** 0.25 vCPU (256)
- **Memory:** 512 MB
- **Image:** `<account-id>.dkr.ecr.us-east-1.amazonaws.com/latamtradex/auth-service:latest`
- **Port:** 3001
- **Secrets:**
  ```
  KAFKA_BROKERS: arn:aws:secretsmanager:...
  DATABASE_HOST: arn:aws:secretsmanager:...:latamtradex/auth-db-credentials::host
  DATABASE_PORT: arn:aws:secretsmanager:...:latamtradex/auth-db-credentials::port
  DATABASE_USER: arn:aws:secretsmanager:...:latamtradex/auth-db-credentials::username
  DATABASE_PASSWORD: arn:aws:secretsmanager:...:latamtradex/auth-db-credentials::password
  DATABASE_NAME: arn:aws:secretsmanager:...:latamtradex/auth-db-credentials::database
  JWT_SECRET: arn:aws:secretsmanager:...:latamtradex/jwt-secret
  ```

#### Task Definition para Catalog Service

- **Family:** `latamtradex-catalog-service`
- **CPU:** 0.25 vCPU (256)
- **Memory:** 512 MB
- **Port:** 3002
- **Secrets:**
  ```
  MONGODB_URI: (construir desde secretos)
  KAFKA_BROKERS: arn:aws:secretsmanager:...
  ```

#### Task Definition para Order Service

- **Family:** `latamtradex-order-service`
- Similar a Auth Service pero con secrets de Orders DB

### Paso 3: Crear ECS Cluster

1. Ve a **ECS Dashboard** → **Clusters** → **Create Cluster**
2. Configuración:
   - **Cluster Name:** `latamtradex-cluster`
   - **Infrastructure:** AWS Fargate
3. Crea el cluster

### Paso 4: Crear Services en ECS

Para cada servicio:

1. Ve a **Clusters** → `latamtradex-cluster` → **Services** → **Create**
2. Configuración:
   - **Service Name:** `api-gateway-service` (o `auth-service`, etc.)
   - **Task Definition:** Selecciona la Task Definition correspondiente
   - **Service Type:** Replica
   - **Number of Tasks:** 2 (para alta disponibilidad)
   - **VPC:** `latamtradex-vpc`
   - **Subnets:** Subredes privadas
   - **Security Groups:** `latamtradex-services-sg` (o `latamtradex-api-gateway-sg` para API Gateway)
   - **Load Balancer:** Solo para API Gateway:
     - **Load Balancer Type:** Application Load Balancer
     - **Load Balancer Name:** `latamtradex-alb`
     - **Container to Load Balance:** api-gateway:3000
     - **Listener:** HTTP:80 o HTTPS:443 (si tienes certificado SSL)
     - **Target Group:** Crea uno nuevo

3. Crea el servicio

### Paso 5: Crear Application Load Balancer (si no se creó automáticamente)

1. Ve a **EC2 Dashboard** → **Load Balancers** → **Create Load Balancer**
2. Selecciona **Application Load Balancer**
3. Configuración:
   - **Name:** `latamtradex-alb`
   - **Scheme:** Internet-facing
   - **IP Address Type:** IPv4
   - **VPC:** `latamtradex-vpc`
   - **Mappings:** Selecciona las 3 AZs con subredes públicas
   - **Security Group:** `latamtradex-alb-sg`
   - **Listener:** HTTP:80 (agregar HTTPS después con certificado)
   - **Default Action:** Forward to `latamtradex-api-gateway-tg`
4. Crea el Load Balancer
5. Anota el **DNS Name** del ALB

### Paso 6: Configurar SSL/TLS (Opcional pero Recomendado)

1. Solicita un certificado en **ACM (AWS Certificate Manager)**
   - **Domain Name:** `api.tu-dominio.com`
   - **Validation:** DNS validation
2. Una vez validado, edita el Listener del ALB:
   - Agrega un nuevo listener HTTPS:443
   - Selecciona el certificado
   - Default action: Forward to `latamtradex-api-gateway-tg`
3. Opcional: Redirigir HTTP a HTTPS en el listener HTTP:80

---

## 🌐 Despliegue del Frontend en Vercel

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket
2. El frontend debe estar en la carpeta `latamtradex-frontend`

### Paso 2: Conectar Vercel con el Repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **Add New Project**
3. Importa tu repositorio
4. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Root Directory:** `latamtradex-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Paso 3: Configurar Variables de Entorno en Vercel

En la configuración del proyecto, ve a **Environment Variables** y agrega:

```
VITE_API_BASE_URL=https://api.tu-dominio.com/api
```

O si usas el DNS del ALB directamente:
```
VITE_API_BASE_URL=https://latamtradex-alb-xxxxx.us-east-1.elb.amazonaws.com/api
```

### Paso 4: Desplegar

1. Haz clic en **Deploy**
2. Espera a que se complete el despliegue
3. Vercel te dará una URL temporal (ej: `tu-proyecto.vercel.app`)
4. Puedes configurar un dominio personalizado después

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. En la configuración del proyecto, ve a **Domains**
2. Agrega tu dominio (ej: `app.tu-dominio.com`)
3. Configura los registros DNS según las instrucciones de Vercel

---

## 🔐 Configuración de Variables de Entorno

### Resumen de Variables por Servicio

#### API Gateway (ECS Task)
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-app.vercel.app,https://app.tu-dominio.com
KAFKA_BROKERS=<desde-secrets-manager>
```

#### Auth Service (ECS Task)
```env
NODE_ENV=production
PORT=3001
KAFKA_BROKERS=<desde-secrets-manager>
KAFKA_GROUP_ID=auth-service-group
DATABASE_HOST=<desde-secrets-manager>
DATABASE_PORT=5432
DATABASE_NAME=auth_db
DATABASE_USER=<desde-secrets-manager>
DATABASE_PASSWORD=<desde-secrets-manager>
JWT_SECRET=<desde-secrets-manager>
```

#### Catalog Service (ECS Task)
```env
NODE_ENV=production
PORT=3002
KAFKA_BROKERS=<desde-secrets-manager>
KAFKA_GROUP_ID=catalog-service-group
MONGODB_URI=mongodb://<user>:<password>@<host>:27017/catalog_db?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

#### Order Service (ECS Task)
```env
NODE_ENV=production
PORT=3003
KAFKA_BROKERS=<desde-secrets-manager>
KAFKA_GROUP_ID=order-service-group
DATABASE_HOST=<desde-secrets-manager>
DATABASE_PORT=5432
DATABASE_NAME=orders_db
DATABASE_USER=<desde-secrets-manager>
DATABASE_PASSWORD=<desde-secrets-manager>
```

#### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://api.tu-dominio.com/api
```

---

## 🌍 Configuración de DNS y Dominios

### Opción 1: Usar Route 53 (AWS)

1. Crea un Hosted Zone en Route 53 para tu dominio
2. Configura los registros:
   - **A Record (Alias) para API:**
     - Name: `api`
     - Type: A
     - Alias: Yes
     - Alias Target: Selecciona tu ALB
   - **CNAME para Frontend:**
     - Name: `app` (o `www`)
     - Type: CNAME
     - Value: `cname.vercel-dns.com` (Vercel te dará el valor exacto)

### Opción 2: Usar otro proveedor DNS

1. **Para el API (ALB):**
   - Crea un registro A o CNAME apuntando al DNS del ALB
   - Ejemplo: `api.tu-dominio.com` → `latamtradex-alb-xxxxx.us-east-1.elb.amazonaws.com`

2. **Para el Frontend (Vercel):**
   - Sigue las instrucciones de Vercel para configurar el dominio
   - Generalmente es un registro CNAME

---

## ✅ Pruebas Post-Despliegue

### 1. Verificar Health Checks

```bash
# Health check del API Gateway
curl https://api.tu-dominio.com/api/health

# Debe responder: {"status":"ok"}
```

### 2. Probar Registro de Usuario

```bash
curl -X POST https://api.tu-dominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "buyer"
  }'
```

### 3. Probar Login

```bash
curl -X POST https://api.tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Verificar Frontend

1. Abre tu aplicación en Vercel
2. Intenta registrarte
3. Verifica que las peticiones lleguen al API Gateway

### 5. Verificar Logs

Revisa los logs en CloudWatch para cada servicio:
- `/ecs/latamtradex-api-gateway`
- `/ecs/latamtradex-auth-service`
- `/ecs/latamtradex-catalog-service`
- `/ecs/latamtradex-order-service`

---

## 📊 Monitoreo y Logging

### CloudWatch Logs

Todos los servicios están configurados para enviar logs a CloudWatch. Puedes:

1. Ver logs en tiempo real:
   - Ve a **CloudWatch** → **Log Groups**
   - Selecciona el log group del servicio
   - Haz clic en **View Logs**

2. Crear Alarmas:
   - Crea alarmas para errores críticos
   - Configura notificaciones (SNS)

### CloudWatch Metrics

ECS proporciona métricas automáticas:
- CPU Utilization
- Memory Utilization
- Task Count
- Service Count

### AWS X-Ray (Opcional)

Para tracing distribuido, considera habilitar AWS X-Ray en tus servicios.

---

## 🔍 Troubleshooting

### Problema: Servicios no pueden conectarse a Kafka

**Solución:**
- Verifica que los Security Groups permitan el tráfico
- Verifica que los brokers de MSK estén accesibles desde las subredes privadas
- Revisa los logs de los servicios en CloudWatch

### Problema: Servicios no pueden conectarse a las bases de datos

**Solución:**
- Verifica que los Security Groups permitan el tráfico (puertos 5432 y 27017)
- Verifica que las credenciales en Secrets Manager sean correctas
- Asegúrate de que las bases de datos estén en las subredes privadas correctas

### Problema: Error de CORS en el frontend

**Solución:**
- Verifica que `CORS_ORIGIN` en el API Gateway incluya el dominio de Vercel
- Formato correcto: `https://tu-app.vercel.app` (sin trailing slash)
- Reinicia las tareas del API Gateway después de cambiar la variable

### Problema: Frontend no puede conectarse al API

**Solución:**
- Verifica que `VITE_API_BASE_URL` esté configurado correctamente en Vercel
- Verifica que el ALB esté accesible públicamente
- Verifica los Security Groups del ALB

### Problema: Task Definitions fallan al iniciar

**Solución:**
- Verifica los permisos del Task Execution Role (debe tener acceso a ECR y Secrets Manager)
- Verifica que las imágenes Docker estén en ECR
- Revisa los logs del servicio en CloudWatch

### Problema: Alta latencia

**Solución:**
- Considera aumentar el tamaño de las instancias (CPU/Memory)
- Verifica que las tareas estén distribuidas en múltiples AZs
- Considera usar AWS ElastiCache para caché (si es necesario)

---

## 📝 Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Todas las imágenes Docker están en ECR
- [ ] Todos los secrets están en Secrets Manager
- [ ] `synchronize: false` en TypeORM (o migraciones configuradas)
- [ ] JWT_SECRET es fuerte y seguro
- [ ] NODE_ENV=production en todos los servicios
- [ ] CORS_ORIGIN configurado con el dominio de Vercel
- [ ] Security Groups configurados correctamente
- [ ] Bases de datos accesibles desde los servicios
- [ ] Kafka (MSK) accesible desde los servicios
- [ ] ALB configurado y saludable
- [ ] Frontend desplegado en Vercel con VITE_API_BASE_URL correcto
- [ ] DNS configurado correctamente
- [ ] SSL/TLS configurado (recomendado)
- [ ] Logs funcionando en CloudWatch
- [ ] Health checks pasando
- [ ] Pruebas end-to-end funcionando

---

## 💰 Estimación de Costos (Aproximada)

### AWS (mensual, región us-east-1)

- **ECS Fargate:** ~$50-100 (depende del uso)
- **RDS PostgreSQL (2 instancias db.t3.micro):** ~$30-50
- **DocumentDB (db.t3.medium):** ~$100-150
- **MSK (3 brokers kafka.t3.small):** ~$150-200
- **ALB:** ~$20-30
- **Data Transfer:** Variable
- **CloudWatch Logs:** ~$10-20
- **ECR:** Mínimo (casi gratis)

**Total estimado:** ~$360-550/mes (puede variar significativamente)

### Vercel

- **Hobby Plan:** Gratis (con limitaciones)
- **Pro Plan:** $20/mes por usuario

---

## 🔄 Próximos Pasos

1. **Automatización CI/CD:**
   - Configurar GitHub Actions o AWS CodePipeline
   - Automatizar build y deploy de imágenes Docker
   - Automatizar deploy a ECS

2. **Alta Disponibilidad:**
   - Aumentar número de tareas por servicio
   - Distribuir en múltiples AZs
   - Configurar Auto Scaling

3. **Backup y Disaster Recovery:**
   - Configurar backups automáticos de RDS
   - Configurar backups de DocumentDB
   - Documentar proceso de recuperación

4. **Seguridad:**
   - Habilitar AWS WAF en el ALB
   - Configurar VPC Endpoints para servicios AWS
   - Revisar y actualizar Security Groups regularmente
   - Rotar secrets regularmente

5. **Monitoreo Avanzado:**
   - Configurar alertas en CloudWatch
   - Implementar AWS X-Ray
   - Configurar dashboards personalizados

---

**¡Buena suerte con el despliegue! 🚀**

