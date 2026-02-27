import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations, InferSelectModel } from 'drizzle-orm';

export const PRODUCT_TYPES = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Other'] as const;
export type ProductType = typeof PRODUCT_TYPES[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = typeof USER_ROLES[number];

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  password:  text('password').notNull(),
  role:      text('role', { enum: USER_ROLES })
               .notNull()
               .default('user'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Keys ─────────────────────────────────────────────────────────────────────
export const keys = sqliteTable('keys', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  data:      text('data').notNull().unique(),
  requests:  integer('requests').notNull().default(0),
  userId:    integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = sqliteTable('products', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  type:      text('type', { enum: PRODUCT_TYPES }).notNull(),
  name:      text('name').notNull(),
  ssn:       text('ssn').notNull().unique(),
  userId:    integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type User    = InferSelectModel<typeof users>;
export type Key     = InferSelectModel<typeof keys>;
export type Product = InferSelectModel<typeof products>;

// Тип для создания пользователя (без авто-полей)
export type NewUser = {
  name:     string;
  email:    string;
  password: string;
  role?:    UserRole;
};

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  keys:     many(keys),
  products: many(products),
}));

export const keysRelations = relations(keys, ({ one }) => ({
  user: one(users, { fields: [keys.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
}));