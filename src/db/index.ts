import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient, Client } from '@libsql/client';
import * as schema from './schema';

dotenv.config();

const client: Client = createClient({
  url: 'file:' + (process.env.DATABASE_URL ?? './dev.db'),
});

const db = drizzle(client, { schema });

export default db;
