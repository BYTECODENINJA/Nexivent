# NexiVent

## 1. Project Overview

![Project Diagram](project.png)


NexiVent is a TypeScript/NestJS event-management backend organized as a microservice monorepo. It supports account registration and login, event creation and publication, ticket purchase and check-in, and asynchronous email notifications. The API gateway is the client-facing entry point; it forwards HTTP requests to dedicated Auth, Events, and Tickets services.

Key architectural characteristics:

- **Service separation:** Auth, Events, Tickets, Notifications, and the API Gateway are independently bootstrapped NestJS applications.
- **Shared infrastructure libraries:** Common DTOs, Drizzle database schemas, and Kafka client configuration live in reusable libraries.
- **Event-driven notifications:** Domain services emit Kafka events; Notifications consumes registration and ticket events and sends email through SMTP.
- **Validation and authorization:** HTTP applications use Nest's global `ValidationPipe`; JWT Bearer authentication guards gateway routes that require an authenticated user.

## 2. Tech Stack

| Area | Technology |
| --- | --- |
| Language | TypeScript (target: ES2023) |
| Runtime | Node.js |
| Framework | NestJS 11 |
| API style | REST over HTTP |
| Database | PostgreSQL 16 (local Docker service) |
| ORM / schema | Drizzle ORM and Drizzle Kit |
| Message broker | Apache Kafka (KafkaJS / Nest microservices) |
| Authentication | Passport JWT, `@nestjs/jwt`, and bcrypt |
| Email | Nodemailer; MailHog is provided for local SMTP testing |
| HTTP client | Axios through `@nestjs/axios` |
| Validation | class-validator and class-transformer |
| Testing | Jest, ts-jest, and Supertest |
| Code quality | ESLint and Prettier |
| Local infrastructure | Docker Compose |

Redis is included in `docker-compose.yaml`, but no application code currently uses it.

## 3. Architecture & Flow (Mermaid Diagrams)

### System Architecture

```mermaid
flowchart LR
    Client[HTTP client] --> Gateway[API Gateway :3000]

    Gateway --> Auth[Auth service :3001]
    Gateway --> Events[Events service :3003]
    Gateway --> Tickets[Tickets service :3004]

    Auth --> PostgreSQL[(PostgreSQL)]
    Events --> PostgreSQL
    Tickets --> PostgreSQL

    Auth --> Kafka[(Kafka)]
    Events --> Kafka
    Tickets --> Kafka
    Kafka --> Notifications[Notifications service :3006]
    Notifications --> SMTP[SMTP / MailHog]

    Redis[(Redis)]
    KafkaUI[Kafka UI :8080] --> Kafka
```

### Core Flow: Ticket Purchase

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant T as Tickets Service
    participant DB as PostgreSQL
    participant K as Kafka
    participant N as Notifications Service
    participant M as SMTP / MailHog

    C->>G: POST /tickets/purchase with Bearer token
    G->>G: Validate JWT and extract userId
    G->>T: POST /purchase with x-user-id
    T->>DB: Read event and confirmed-ticket total
    DB-->>T: Event and capacity data
    T->>T: Validate published status and capacity
    T->>DB: Insert confirmed ticket
    DB-->>T: Created ticket
    T->>K: Emit ticket.purchased
    T-->>G: Purchase result
    G-->>C: 201 response
    K-->>N: ticket.purchased event
    N->>M: Send confirmation email
```

## 4. Project Structure

```text
nexivent/
├── apps/
│   ├── api-gateway/        # Public HTTP gateway that proxies auth, event, and ticket requests.
│   ├── auth/               # User registration, login, JWT issuance, and profile lookup.
│   ├── events/             # Event persistence, publication, cancellation, and ownership checks.
│   ├── notifications/      # Kafka event consumers and SMTP email delivery.
│   └── tickets/            # Ticket purchase, cancellation, check-in, and ticket queries.
├── libs/
│   ├── common/             # Shared DTOs, interfaces, constants, and utilities.
│   ├── database/           # Drizzle PostgreSQL schemas and the shared database service.
│   └── kafka/              # Kafka topics, client token, and dynamic Nest Kafka module.
├── dist/                   # Compiled application output (generated).
├── docker-compose.yaml     # Local Kafka, Kafka UI, PostgreSQL, Redis, and MailHog services.
├── drizzle.config.ts       # Drizzle Kit schema, migrations, and connection configuration.
├── nest-cli.json           # Nest monorepo application and library definitions.
├── package.json            # Scripts, runtime dependencies, development tools, and Jest config.
├── pnpm-lock.yaml          # Locked dependency graph for pnpm.
└── tsconfig.json           # Shared TypeScript compiler and path-alias configuration.
```

## 5. Core Functions & API Endpoints

### API Endpoints

The following routes are exposed by the API Gateway at `http://localhost:3000`. Routes marked **Authenticated** require an `Authorization: Bearer <access_token>` header. Gateway controllers forward requests to services over localhost HTTP; service ports are listed in the architecture diagram.

#### Gateway and authentication

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Returns the API Gateway status string. |
| `POST` | `/auth/register` | Creates a user account. |
| `POST` | `/auth/login` | Validates credentials and returns a JWT access token. |
| `GET` | `/auth/profile` | Returns the authenticated user's profile. |

`POST /auth/register`

```json
{
  "email": "ada@example.com",
  "password": "secure-password",
  "name": "Ada Lovelace"
}
```

```json
{
  "message": "User registered successfully",
  "userId": "uuid"
}
```

`POST /auth/login`

```json
{
  "email": "ada@example.com",
  "password": "secure-password"
}
```

```json
{
  "access_token": "jwt",
  "user": {
    "id": "uuid",
    "email": "ada@example.com",
    "name": "Ada Lovelace",
    "role": "USER"
  }
}
```

`GET /auth/profile` response:

```json
{
  "id": "uuid",
  "email": "ada@example.com",
  "name": "Ada Lovelace",
  "role": "USER"
}
```

#### Events

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/events` | Lists published events. |
| `GET` | `/events/my-events` | **Authenticated.** Lists events owned by the current user. |
| `GET` | `/events/:id` | Fetches an event by UUID. |
| `POST` | `/events` | **Authenticated.** Creates an event in `DRAFT` status. |
| `PUT` | `/events/:id/publish` | **Authenticated.** Publishes an event when the caller is its organizer or has the `ADMIN` role. |
| `PUT` | `/events/:id/cancel` | **Authenticated.** Cancels an event when the caller is its organizer or has the `ADMIN` role. |

`POST /events`

```json
{
  "title": "NexiVent Summit",
  "description": "An event for builders.",
  "date": "2026-09-15T09:00:00.000Z",
  "location": "Nairobi",
  "capacity": 100,
  "price": 2500
}
```

An event response contains the generated UUID, submitted fields, `organizerId`, timestamps, and a `status` of `DRAFT`, `PUBLISHED`, or `CANCELLED`:

```json
{
  "id": "uuid",
  "title": "NexiVent Summit",
  "date": "2026-09-15T09:00:00.000Z",
  "location": "Nairobi",
  "capacity": 100,
  "price": 2500,
  "status": "DRAFT",
  "organizerId": "uuid"
}
```

#### Tickets

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/tickets/purchase` | **Authenticated.** Purchases 1–10 tickets for a published event with available capacity. |
| `GET` | `/tickets/my-tickets` | **Authenticated.** Lists the current user's tickets with event details. |
| `GET` | `/tickets/:id` | **Authenticated.** Returns one ticket owned by the current user. |
| `POST` | `/tickets/:id/cancel` | **Authenticated.** Cancels a ticket unless it is already cancelled or checked in. |
| `POST` | `/tickets/check-in` | **Authenticated.** Checks in a ticket; the caller must own the event. |
| `GET` | `/tickets/event/:eventId` | **Authenticated.** Lists tickets for an event; the caller must own the event. |

`POST /tickets/purchase`

```json
{
  "eventId": "00000000-0000-4000-8000-000000000000",
  "quantity": 2
}
```

```json
{
  "message": "Ticket purchased successfully",
  "ticket": {
    "id": "uuid",
    "ticketCode": "A1B2C3D4E5F6",
    "eventTitle": "NexiVent Summit",
    "quantity": 2,
    "totalPrice": 5000,
    "status": "CONFIRMED",
    "purchasedAt": "2026-08-19T10:00:00.000Z"
  }
}
```

`POST /tickets/check-in`

```json
{
  "ticketCode": "A1B2C3D4E5F6"
}
```

```json
{
  "message": "Ticket checked in successfully",
  "ticket": {
    "id": "uuid",
    "ticketCode": "A1B2C3D4E5F6",
    "quantity": 2,
    "status": "CHECKED_IN",
    "checkedInAt": "2026-08-19T10:30:00.000Z"
  }
}
```

#### Notifications service

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `http://localhost:3006/health` | Returns the Notifications service health payload. |

### Internal Functions and Services

| Component | Responsibilities and interactions |
| --- | --- |
| `AuthService.register(email, password, name)` | Checks `users` for an existing email, bcrypt-hashes the password, inserts the user, then emits `user.registered` to Kafka. Returns a success message and user ID. |
| `AuthService.login(email, password)` | Retrieves a user by email, verifies the bcrypt hash, signs a one-hour JWT containing `sub` and `email`, and emits `user.login`. Returns the access token and selected user data. |
| `EventsService.create(...)` | Inserts a `DRAFT` event associated with the supplied organizer ID and emits `event.created`. |
| `EventsService.update/publish/cancel(...)` | Loads the event, permits only its organizer or an `ADMIN`, updates the event record, and emits the matching Kafka event. The implementation contains update logic, but the API Gateway does not currently expose an event-update route. |
| `TicketsService.purchase(...)` | Verifies that the event exists and is published, aggregates confirmed quantities to enforce capacity, inserts a confirmed ticket with a random 12-character hexadecimal code, and emits `ticket.purchased`. Prices are stored and returned as integers. |
| `TicketsService.cancel/checkIn(...)` | Enforces ticket ownership for cancellation and event-organizer ownership for check-in, updates ticket status and timestamps, and emits ticket lifecycle events. |
| `NotificationsService` and `EmailService` | Consume `user.registered`, `ticket.purchased`, and `ticket.cancelled`; build HTML email bodies; and send them through Nodemailer. Ticket notifications use `user@example.com` when their Kafka event lacks an email address. |
| `DatabaseService` | Creates a `pg` pool and a Drizzle database instance backed by the `users`, `events`, and `tickets` schemas. At runtime its connection string is currently hard-coded rather than read from `DATABASE_URL`. |

## 6. Getting Started (Local Development)

### Prerequisites

- Node.js (the repository does not declare a required version; its TypeScript target is ES2023).
- pnpm (a `pnpm-lock.yaml` is committed).
- Docker and Docker Compose.

### Installation

```bash
git clone <repository-url>
cd nexivent
pnpm install --frozen-lockfile
```

### Environment Setup

The repository contains a `.env` file with the local Drizzle connection string. Create or update it with the following value for local migrations:

```dotenv
DATABASE_URL=postgresql://nexivent:nexivent_password@localhost:5432/nexivent?schema=public
```

Optional service settings can be placed in `.env`; see [Environment Variables](#7-environment-variables). Nest's entry points read from `process.env`; use an environment-loading mechanism appropriate to your shell or deployment because no `@nestjs/config` or dotenv loader is configured in the application modules.

### Database and infrastructure setup

Start the local dependencies:

```bash
docker compose up -d
```

Generate and apply Drizzle migrations after the database is available:

```bash
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

No seed command or migration files are currently committed. The commands above use the schemas in `libs/database/src/schema` and write generated migrations to `drizzle/migrations`.

### Running the applications

Start each application in a separate terminal. The gateway depends on the Auth, Events, and Tickets HTTP services being available.

```bash
pnpm exec nest start auth --watch
pnpm exec nest start events --watch
pnpm exec nest start tickets --watch
pnpm exec nest start notifications --watch
pnpm run start:dev
```

The final command starts the default API Gateway application on port `3000`. The services listen on ports `3001` (Auth), `3003` (Events), `3004` (Tickets), and `3006` (Notifications). Kafka UI is available on port `8080`, and MailHog's web UI is available on port `8025`.

## 7. Environment Variables

| Variable Name | Description | Required (Y/N) | Example Value |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL URL used by `drizzle.config.ts` for Drizzle Kit commands. The runtime `DatabaseService` currently uses a hard-coded local URL instead. | Y for Drizzle migration commands | `postgresql://nexivent:nexivent_password@localhost:5432/nexivent?schema=public` |
| `JWT_SECRET` | Secret used by the Auth service and API Gateway to sign and validate JWTs. Defaults to `secret` when unset. | N | `change-me-in-production` |
| `KAFKA_BROKER` | Kafka broker address used by the shared Kafka module and Notifications consumer. Defaults to `localhost:9093`. | N | `localhost:9093` |
| `SMTP_HOST` | SMTP host used by the Notifications email service. Defaults to `localhost`. | N | `localhost` |
| `SMTP_PORT` | SMTP port used by the Notifications email service. Defaults to `1025`. | N | `1025` |
| `TICKETS_SERVICE_URL` | Optional base URL used by the API Gateway when forwarding ticket requests. Defaults to `http://localhost:3004`. | N | `http://localhost:3004` |

## 8. Testing

The repository includes Jest unit tests for the Auth service and shared libraries, plus Nest/Supertest E2E test configuration and specs for each application. The root Jest configuration searches `apps/` and `libs/` for `*.spec.ts` files. No separate integration-test command is defined.

```bash
# Run unit tests and any discovered specs
pnpm test

# Watch tests
pnpm run test:watch

# Generate coverage in coverage/
pnpm run test:cov

# Run the API Gateway E2E suite
pnpm run test:e2e

# Format TypeScript source files
pnpm run format

# Run ESLint (the configured script applies --fix)
pnpm run lint
```

## 9. Deployment & CI/CD

Docker Compose is provided only for local infrastructure dependencies; there is no application Dockerfile, Kubernetes configuration, cloud deployment configuration, or CI/CD pipeline in this repository. Deployment and CI/CD are **not yet configured**.