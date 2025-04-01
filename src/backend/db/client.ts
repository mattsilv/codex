import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

/**
 * Create a Drizzle ORM instance connected to the D1 database
 * @param d1Database - The D1 database instance
 * @returns Drizzle ORM instance with loaded schema
 */
export function createDb(d1Database: unknown) {
  return drizzle(d1Database, { schema });
}