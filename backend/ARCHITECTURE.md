# Microservice Readiness — Architecture Guide

## Current: Event-Driven Modular Monolith

```
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS APP (Monolith)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Ecommerce│  │   ERP   │  │   CRM   │  │   CMS   │       │
│  │ Routes  │  │ Routes  │  │ Routes  │  │ Routes  │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │             │             │             │            │
│       └──────┬──────┴──────┬──────┴──────┬──────┘            │
│              │              │              │                  │
│       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐           │
│       │  EVENT BUS  │ │   DB    │ │   ENGINES   │           │
│       │ (in-memory) │ │(Postgres)│ │(Approval,   │           │
│       │             │ │         │ │ Accounting, │           │
│       │ emit/on     │ │ Shared  │ │ Audit,      │           │
│       └──────┬──────┘ └─────────┘ │ Notify)     │           │
│              │                     └─────────────┘           │
│       ┌──────▼──────┐                                        │
│       │ SUBSCRIBERS │                                        │
│       │(cross-module│                                        │
│       │  reactions) │                                        │
│       └─────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## How to Use Event Bus (for developers)

### Emitting Events (in route handlers):
```javascript
import { eventBus, EVENTS } from '../../lib/eventBus.js';

// After placing order:
await eventBus.emit(EVENTS.ORDER_PLACED, {
  orderId: id,
  orderNumber: order_number,
  items, total, phone, email,
  paymentMethod, customerName
});
```

### Subscribing (in eventSubscribers.js):
```javascript
eventBus.on(EVENTS.ORDER_PLACED, async (data) => {
  // Send email, WhatsApp, create lead, record accounting
});
```

## Splitting to Microservices (Future)

When ready to split:

1. **Replace EventBus** with Redis Pub/Sub or RabbitMQ
2. **Each module becomes a service**:
   - `ecommerce-service` (products, orders, cart)
   - `erp-service` (job cards, billing, inventory)
   - `crm-service` (leads, campaigns)
   - `cms-service` (blog, pages, media)
   - `notification-service` (email, WhatsApp, push)
3. **Shared DB → per-service DB** (each service owns its tables)
4. **API Gateway** in front (nginx already does this)

### What's Already Decoupled:
- ✅ Routes organized by module (ecommerce/, erp/, cms/, system/)
- ✅ Event Bus for cross-module communication
- ✅ Engines are standalone (approval, accounting, audit, notify)
- ✅ Each module has its own DB tables
- ✅ Registry auto-loads routes (easy to remove a module)

### What Needs Work for Full Split:
- ❌ Shared `db` import (need per-service connection)
- ❌ Some routes still import from other modules directly
- ❌ No API versioning (/api/v1/)
- ❌ No service discovery
- ❌ No circuit breaker

## Event Contract

All events follow this shape:
```javascript
{
  event: 'order.placed',
  timestamp: ISO string,
  data: { ... module-specific payload }
}
```

See `src/lib/eventBus.js` → `EVENTS` for full list.
