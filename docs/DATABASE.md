# Database Schema — AI Laptop Wala

## Tables Overview

| Table | Purpose |
|-------|---------|
| users | Customers + Admin accounts |
| products | Laptop/desktop products |
| categories | Product categories |
| orders | Customer orders |
| coupons | Discount coupons |
| blog_posts | Blog articles |
| contact_queries | Contact form submissions |
| cms_content | Homepage/page content |
| whatsapp_rules | Auto-reply rules |
| whatsapp_messages | Chat history |
| whatsapp_notifications | Pending WA notifications |
| notifications | Admin notifications |
| media | Uploaded files |
| social_settings | Facebook/Instagram config |
| social_posts | Scheduled social posts |
| reels | Instagram reels |
| site_settings | Feature toggles |
| app_settings | Store settings (key-value) |
| ai_agent_settings | AI agent configuration |
| ai_conversation_memory | Chat memory per contact |
| ai_agent_contact_settings | Per-contact AI toggle |
| ai_daily_count | Daily message count |
| services | Repair services |
| service_bookings | Service bookings |
| product_reviews | Product reviews |
| evolution_settings | Evolution API config |
| evolution_instances | WhatsApp instances |
| evolution_messages | Evolution chat messages |
| evolution_chats | Evolution chat list |

## Key Columns

### products
- id, name, price, original_price, image, category
- description, benefits (JSON), ingredients (JSON)
- in_stock, stock, sku, slug, badge, status
- meta_title, meta_description, focus_keywords
- rating, reviews, created_at

### orders
- id, order_number, user_id, items (JSON), subtotal
- discount, total, coupon_code, payment_method
- payment_status, status, address (JSON)
- tracking_id, courier, created_at

### ai_agent_settings
- id='main', enabled, llm_provider, llm_model, api_key
- system_prompt, temperature, max_tokens, memory_messages
- reply_delay_min, reply_delay_max, daily_limit
- feature_product_search, feature_order_status
- feature_greeting, feature_faq, feature_human_handoff
- feature_typing_indicator, feature_cart_suggest
- business_hours_enabled, business_hours_start/end
- agent_bubble_color, fallback_message

## Run Schema Viewer
```bash
node backend/db_schema.js
```
