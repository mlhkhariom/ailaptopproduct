# Nginx Configuration — AI Laptop Wala

## File Location
`/etc/nginx/sites-available/ailaptopwala`

## Key Locations

| Path | Handler |
|------|---------|
| `/api/` | Proxy → localhost:5000 |
| `/socket.io/` | WebSocket proxy → localhost:5000 |
| `/whatsappapi/` | Proxy → localhost:8081 (Evolution API) |
| `/uploads/` | Static files → /var/www/ailaptopwala/uploads/ |
| `/sitemap.xml` | Proxy → localhost:5000 |
| `/robots.txt` | Proxy → localhost:5000 |
| `/llms.txt` | Proxy → localhost:5000 |
| `/og/` | Proxy → localhost:5000 (social bot meta) |
| `/*` | Static → /var/www/ailaptopwala/dist/ |

## SSL
Managed by Certbot/Let's Encrypt

## Reload
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Bot Detection (Social Preview)
Bots (WhatsApp, Facebook, Twitter) are redirected to `/og/products/:slug`
which returns pre-rendered HTML with proper meta tags.

## Cloudflare
- Managed robots.txt: DISABLED (use backend robots.txt)
- SSL: Full (strict)
- Cache: Static assets cached, API bypassed
