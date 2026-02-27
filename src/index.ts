import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import authRouter    from './routes/auth';
import usersRouter   from './routes/users';
import productsRouter from './routes/products';
import keysRouter    from './routes/keys';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ──────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth',         authRouter);     // ← register, login, me (публичные + защищённые)
app.use('/api/users',    usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/keys',     keysRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.json({
    status:  'ok',
    message: 'Express + Drizzle ORM API is running',
    docs:    `http://localhost:${PORT}/api/docs`,
    flow: [
      '1. POST /auth/register        — зарегистрируйся (получишь JWT токен)',
      '2. POST /auth/login           — или войди (получишь JWT токен)',
      '3. GET  /auth/me              — проверь свой профиль (нужен токен)',
      '4. Используй токен в Bearer   — для /api/users, /api/products, /api/keys',
    ],
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Drizzle ORM ready`);
  console.log(`🚀 Server:  http://localhost:${PORT}`);
  console.log(`📖 Swagger: http://localhost:${PORT}/api/docs`);
  console.log(`\n📌 Первый запуск:`);
  console.log(`   1. POST /auth/register  — зарегистрируйся, получи JWT токен`);
  console.log(`   2. POST /auth/login     — или войди с email + password`);
  console.log(`   3. Вставь токен в Swagger: кнопка Authorize 🔒`);
});