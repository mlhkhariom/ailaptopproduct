# Handlers

Business logic handlers separated from routes.
Routes handle HTTP (req/res), handlers handle logic.

Structure:
- orderHandler.js — order creation, status updates
- paymentHandler.js — payment processing
- notificationHandler.js — email/WA/SMS sending
- invoiceHandler.js — PDF generation
