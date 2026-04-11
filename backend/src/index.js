import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import cmsRoutes from './routes/cms.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contacts.js';
import whatsappRoutes from './routes/whatsapp.js';
import customerRoutes from './routes/customers.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve React frontend
const frontendDist = path.resolve(__dirname, '../../dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Apsoncure Backend running on http://localhost:${PORT}`));
