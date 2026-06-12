# CLAUDE.md — Microservices Architecture

## Architecture

```
services/
├── gateway/         # API Gateway (Kong/NGINX)
├── auth/            # Authentication service
├── users/           # User management
├── orders/          # Order processing
├── payments/        # Payment processing
├── notifications/   # Email/SMS/Push
└── shared/          # Proto files, shared types, message schemas
```

## Service Rules for AI Agents

### Service Isolation (CRITICAL)
- **Each service owns its database.** No cross-service database queries. Use API calls or message bus.
- **Never import code from another service.** Shared code lives in `shared/` as proto definitions or published npm packages.
- **One service per change.** Change, test, and deploy one service before moving to the next.

### Communication Patterns
| Pattern | When | Transport |
|---------|------|-----------|
| Sync request-response | When caller needs immediate answer | gRPC / REST |
| Async event | Fire-and-forget notifications | Kafka / RabbitMQ / SQS |
| Saga / orchestration | Multi-step transactions across services | Message bus + state machine |

- **Always handle partial failures.** Network calls can fail. Implement retries with exponential backoff.
- **Use correlation IDs.** Every incoming request gets a `x-correlation-id` that propagates to all downstream calls.
- **Circuit break early.** If a downstream service is unhealthy, fail fast rather than queue up requests.

### API Design (per service)
```bash
# Each service exposes:
GET    /health          # Health check (no auth)
GET    /ready           # Readiness probe (DB + deps)
GET    /metrics         # Prometheus metrics
```

- Version APIs: `/v1/users`, `/v2/users`
- Deprecate old versions with `Sunset` header before removing
- Validate all input at the service boundary (Zod/valibot)

### Event Schema Evolution
- **Additive changes only.** New fields are fine. Never remove or rename existing fields.
- **Never change field types.** Create a new field with the new type, deprecate old.
- **Use schema registry.** If using Avro/Protobuf, update schemas before code.

### Observability
```bash
# Required for every service:
- Structured logging (pino/winston) with correlation IDs
- Request/response logging (status, duration, caller)
- Error logging with full stack traces
- Custom business metrics where relevant
```

## Stack (per service)
- Node.js LTS + TypeScript strict
- Express / Fastify (pick one, be consistent)
- PostgreSQL (own instance/schema per service)
- Redis (shared, namespaced by service)
- Kafka for async messaging
- Docker + docker-compose for local dev
- Jest/Vitest for testing

## Definition of Done (per service)
- [ ] Service builds and starts cleanly
- [ ] Unit tests pass (service logic, no external deps)
- [ ] Integration tests pass (DB, message queue, other services)
- [ ] Health and readiness endpoints respond
- [ ] Correlation ID propagation verified
- [ ] Error responses follow standard envelope
- [ ] API docs updated (OpenAPI/gRPC reflection)
