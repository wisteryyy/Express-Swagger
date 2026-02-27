import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import db from '../db';
import { users } from '../db/schema';
import authMiddleware from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить всех пользователей
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await db.query.users.findMany({
      with: {
        keys:     { columns: { id: true, requests: true, createdAt: true } },
        products: { columns: { id: true, name: true, type: true, ssn: true } },
      },
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       404:
 *         description: Не найден
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(req.params.id)),
      with: {
        keys:     { columns: { id: true, requests: true, createdAt: true } },
        products: { columns: { id: true, name: true, type: true, ssn: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать пользователя (только для админов)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Не хватает полей
 *       409:
 *         description: Email уже занят
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, email, password',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role ?? 'user',
      })
      .returning();

    // Не возвращаем password в ответе
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bob
 *     responses:
 *       200:
 *         description: Обновлён
 *       404:
 *         description: Не найден
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const [user] = await db
      .update(users)
      .set({
        ...(name && { name }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, Number(req.params.id)))
      .returning();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя (каскадно удаляет его ключи и продукты)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Удалён
 *       404:
 *         description: Не найден
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, Number(req.params.id)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted (keys and products removed too)' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;