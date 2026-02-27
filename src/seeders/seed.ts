import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db';
import { users, keys, products, type ProductType } from '../db/schema';

dotenv.config();

async function main() {
  // Очищаем таблицы перед вставкой
  await db.delete(products);
  await db.delete(keys);
  await db.delete(users);

  console.log('🗑️  Tables cleared\n');

  // ─── 1. Хэшируем пароли ──────────────────────────────────────────────────
  const [aliceHash, bobHash] = await Promise.all([
    bcrypt.hash('alice123', 10),
    bcrypt.hash('bob123',   10),
  ]);

  // ─── 2. Создаём пользователей ────────────────────────────────────────────
  const [alice, bob] = await db.insert(users).values([
    {
      name:     'Alice',
      email:    'alice@example.com',
      password: aliceHash,
      role:     'admin',
    },
    {
      name:     'Bob',
      email:    'bob@example.com',
      password: bobHash,
      role:     'user',
    },
  ]).returning();

  console.log(`✅ Users created:`);
  console.log(`   Alice (id=${alice.id}) — email: alice@example.com / password: alice123 / role: admin`);
  console.log(`   Bob   (id=${bob.id})   — email: bob@example.com   / password: bob123   / role: user`);
  console.log(`   ⚠️  Используй POST /auth/login для получения JWT токена\n`);

  // ─── 3. Создаём API ключи (legacy, для /api/keys) ────────────────────────
  const aliceToken = crypto.randomBytes(32).toString('hex');
  const bobToken   = crypto.randomBytes(32).toString('hex');

  await db.insert(keys).values([
    { data: aliceToken, userId: alice.id },
    { data: bobToken,   userId: bob.id   },
  ]);

  console.log('✅ API keys created:');
  console.log(`   Alice → Bearer ${aliceToken}`);
  console.log(`   Bob   → Bearer ${bobToken}`);
  console.log('   ⚠️  Сохрани токены!\n');

  // ─── 4. Создаём тестовые продукты ────────────────────────────────────────
  await db.insert(products).values([
    {
      type:   'Electronics' as ProductType,
      name:   'Xiaomi Redmi Ultra Pro Max Book 4K OLED HD Special Edition',
      ssn:    'SN-001-2024',
      userId: alice.id,
    },
    {
      type:   'Electronics' as ProductType,
      name:   'Wireless Mouse',
      ssn:    'SN-002-2024',
      userId: alice.id,
    },
    {
      type:   'Furniture' as ProductType,
      name:   'Standing Desk',
      ssn:    'SN-003-2024',
      userId: bob.id,
    },
  ]);

  console.log('✅ Sample products created');
  console.log('\n🎉 Готово! Следующие шаги:');
  console.log('   1. POST /auth/login  { "email": "alice@example.com", "password": "alice123" }');
  console.log('   2. Скопируй token из ответа');
  console.log('   3. Вставь в Swagger: кнопка Authorize 🔒 → Bearer <token>');

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });