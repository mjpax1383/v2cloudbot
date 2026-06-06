import { Context } from 'grammy';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface MyContext extends Context {
  db: DrizzleD1Database<typeof schema>;
  env: {
    BOT_TOKEN: string;
    DB: D1Database;
  };
  isAdmin?: boolean;
}
