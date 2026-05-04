import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

const dbUrl = process.env.DATABASE_URL || './data/aics.db';

const client = createClient({
  url: `file:${dbUrl}`,
});

export const db = drizzle(client, { schema });

// Test connection helper
export async function testConnection(): Promise<boolean> {
  try {
    await client.execute('SELECT 1');
    return true;
  } catch (err) {
    console.error('[db] Connection failed:', err);
    return false;
  }
}
