import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import db from '../db';
import { users, type NewUser } from '../db/schema';
import { generateToken } from '../utils/jwt.util';

// Регистрация
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  // Простая валидация
  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Fields name, email and password are required',
    });
    return;
  }

  try {
    // Проверяем, не занят ли email
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Email is already taken',
      });
      return;
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: NewUser = {
      name,
      email,
      password: hashedPassword,
      role: role ?? 'user',
    };

    // Сохраняем пользователя
    const [created] = await db
      .insert(users)
      .values(newUser)
      .returning();

    // Генерируем JWT
    const token = generateToken({
      userId: created.id,
      email: created.email,
      role: created.role,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id:    created.id,
        name:  created.name,
        email: created.email,
        role:  created.role,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: errorMessage,
    });
  }
};

// Логин
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Fields email and password are required',
    });
    return;
  }

  try {
    // Ищем пользователя по email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Сравниваем пароль с хэшем
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Генерируем JWT
    const token = generateToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: errorMessage,
    });
  }
};

// Me (получить текущего пользователя)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const [user] = await db
      .select({
        id:        users.id,
        name:      users.name,
        email:     users.email,
        role:      users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.userId!));

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Failed to get user', error: errorMessage });
  }
};