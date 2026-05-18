// ══════════════════════════════════════════════════════════
// EVENT BUS — Decouples modules for microservice readiness
// Modules emit events, other modules subscribe
// When splitting to microservices: replace with Redis/RabbitMQ
// ══════════════════════════════════════════════════════════

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // Subscribe to an event
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler); // return unsubscribe fn
  }

  // Unsubscribe
  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) this.listeners.set(event, handlers.filter(h => h !== handler));
  }

  // Emit event (async — all handlers run in parallel)
  async emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    await Promise.allSettled(handlers.map(h => {
      try { return Promise.resolve(h(data)); }
      catch (e) { console.error(`EventBus [${event}] handler error:`, e.message); return Promise.resolve(); }
    }));
  }

  // List all registered events (debug)
  listEvents() {
    const events = {};
    for (const [event, handlers] of this.listeners) {
      events[event] = handlers.length;
    }
    return events;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// ══════════════════════════════════════════════════════════
// EVENT DEFINITIONS (contract between modules)
// ══════════════════════════════════════════════════════════

export const EVENTS = {
  // Ecommerce
  ORDER_PLACED: 'order.placed',           // { orderId, orderNumber, items, total, userId, address }
  ORDER_STATUS_CHANGED: 'order.status',   // { orderId, orderNumber, oldStatus, newStatus, trackingId }
  ORDER_CANCELLED: 'order.cancelled',     // { orderId, orderNumber, items }

  // Products
  PRODUCT_CREATED: 'product.created',     // { productId, name, price }
  PRODUCT_UPDATED: 'product.updated',     // { productId, changes, oldValues }
  PRODUCT_PRICE_CHANGED: 'product.price', // { productId, oldPrice, newPrice }
  STOCK_LOW: 'stock.low',                 // { productId, name, stock, threshold }

  // CRM
  LEAD_CREATED: 'lead.created',           // { leadId, name, phone, source, interest }
  LEAD_STATUS_CHANGED: 'lead.status',     // { leadId, oldStatus, newStatus }
  LEAD_WON: 'lead.won',                   // { leadId, dealValue }

  // ERP
  JOB_CARD_CREATED: 'jobcard.created',    // { jobId, customerName, device }
  JOB_CARD_COMPLETED: 'jobcard.completed',// { jobId, technicianId }
  EXPENSE_SUBMITTED: 'expense.submitted', // { expenseId, amount, category }
  INVOICE_CREATED: 'invoice.created',     // { invoiceId, amount, customerId }
  INVOICE_PAID: 'invoice.paid',           // { invoiceId, amount }

  // Auth
  USER_REGISTERED: 'user.registered',     // { userId, email, name }
  USER_LOGIN: 'user.login',               // { userId, ip }

  // WhatsApp
  WHATSAPP_MESSAGE: 'whatsapp.message',   // { from, body, contactName }
};
