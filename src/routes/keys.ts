import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import db from '../db';
import { keys, users } from '../db/schema';
import authMiddleware from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/keys/generate:
 *   post:
 *     summary: Создать новый API ключ для пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Ключ создан
 *       400:
 *         description: Не передан userId
 *       404:
 *         description: Пользователь не найден
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Required field: userId',
      });
    }

    // Проверяем что пользователь существует
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const [key] = await db
      .insert(keys)
      .values({ data: token, userId: Number(userId) })
      .returning();

    res.status(201).json({
      success: true,
      message: "New API key generated. Save it — it won't be shown again.",
      data: {
        id: key.id,
        token: key.data,
        userId: key.userId,
        requests: key.requests,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/keys:
 *   get:
 *     summary: Список всех ключей
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список ключей
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await db.query.keys.findMany({
      with: { user: { columns: { id: true, name: true } } },
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/keys/{id}:
 *   delete:
 *     summary: Отозвать ключ
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
 *         description: Ключ удалён
 *       404:
 *         description: Не найден
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [deleted] = await db
      .delete(keys)
      .where(eq(keys.id, Number(req.params.id)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Key not found' });
    }

    res.json({ success: true, message: 'Key revoked' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
