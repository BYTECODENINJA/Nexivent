# NexiVent: Scalable Event & Ticket Management Microservices

A high-performance event management system built with a microservices architecture for handling authentication, event creation, ticket sales, and automated notifications.

### Tech Stack
* **Framework**: [NestJS](https://nestjs.com/) (Node.js)
* **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
* **Messaging**: [Apache Kafka](https://kafka.apache.org/)
* **Caching**: [Redis](https://redis.io/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **DevOps**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* **Mailing**: [MailHog](https://github.com/mailhog/MailHog) (Development)

### Quick Start

#### Requirements
* Node.js (v20 or higher)
* Docker & Docker Compose
* npm or yarn

#### Installation
```bash
# Clone the repository
git clone <repository-url>
cd nexivent

# Install dependencies
npm install
```

#### Run Scripts
```bash
# Start infrastructure (Kafka, PostgreSQL, Redis, MailHog)
docker-compose up -d

# Run migrations (using drizzle-kit)
npm run drizzle-kit push

# Start all microservices in development mode
npm run start:dev
```

### Architecture Map
```text
📂 nexivent/
├── 📁 apps/
│   ├── 📁 api-gateway/     # Entry point for client requests, routes to microservices
│   ├── 📁 auth/            # Identity management, JWT issuance, and validation
│   ├── 📁 events/          # Event lifecycle management (Create, Update, List)
│   ├── 📁 notifications/   # Email dispatching via Kafka consumers
│   └── 📁 tickets/         # Ticket issuance and reservation logic
├── 📁 libs/
│   ├── 📁 common/          # Shared DTOs, interfaces, constants, and utils
│   ├── 📁 database/        # Drizzle ORM schema definitions and database service
│   └── 📁 kafka/           # Shared Kafka client registration and message patterns
├── 📄 docker-compose.yaml  # Infrastructure definition for local development
└── 📄 drizzle.config.ts    # Drizzle ORM configuration
```

### Environment Variables

| Variable | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `KAFKA_BROKER` | String | List of Kafka broker addresses | No | `localhost:9093` |
| `JWT_SECRET` | String | Secret key for signing JWT tokens | No | `secret` |
| `SMTP_HOST` | String | SMTP server host for notifications | No | `localhost` |
| `SMTP_PORT` | Number | SMTP server port for notifications | No | `1025` |
| `DATABASE_URL` | String | Postgres connection string | **Yes** | N/A |

---
*Generated using the Project Documenter skill.*
