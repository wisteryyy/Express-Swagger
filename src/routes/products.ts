import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db';
import { products, PRODUCT_TYPES, ProductType } from '../db/schema';
import authMiddleware from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все продукты
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список продуктов
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await db.query.products.findMany({
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
 * /api/products/{id}:
 *   get:
 *     summary: Получить продукт по ID
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
 *         description: Продукт найден
 *       404:
 *         description: Не найден
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, Number(req.params.id)),
      with: { user: { columns: { id: true, name: true } } },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать продукт (userId берётся из токена автоматически)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, name, ssn]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Electronics, Furniture, Clothing, Food, Other]
 *                 example: Electronics
 *               name:
 *                 type: string
 *                 example: MacBook Pro
 *               ssn:
 *                 type: string
 *                 example: SN-999-2024
 *     responses:
 *       201:
 *         description: Продукт создан
 *       400:
 *         description: Не хватает полей или неверный тип
 *       409:
 *         description: SSN уже существует
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, name, ssn } = req.body;

    if (!type || !name || !ssn) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: type, name, ssn',
      });
    }

    // Валидация enum
    if (!PRODUCT_TYPES.includes(type as ProductType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed values: ${PRODUCT_TYPES.join(', ')}`,
      });
    }

    // userId берётся автоматически из Bearer токена (прокинут в auth middleware)
    const [product] = await db
      .insert(products)
      .values({ type: type as ProductType, name, ssn, userId: req.userId! })
      .returning();

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'SSN already exists' });
    }
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить продукт
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
 *               type:
 *                 type: string
 *                 enum: [Electronics, Furniture, Clothing, Food, Other]
 *               name:
 *                 type: string
 *               ssn:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлён
 *       400:
 *         description: Неверный тип
 *       404:
 *         description: Не найден
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, name, ssn } = req.body;

    // Валидация enum если тип передан
    if (type && !PRODUCT_TYPES.includes(type as ProductType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed values: ${PRODUCT_TYPES.join(', ')}`,
      });
    }

    const [product] = await db
      .update(products)
      .set({
        ...(type && { type: type as ProductType }),
        ...(name && { name }),
        ...(ssn  && { ssn  }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, Number(req.params.id)))
      .returning();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить продукт
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
      .delete(products)
      .where(eq(products.id, Number(req.params.id)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
