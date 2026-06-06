import { Hono } from 'hono';
import { webhookCallback } from 'grammy';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';
import { createBot } from './bot/bot';

type Bindings = {
  DB: D1Database;
  BOT_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post('/webhook', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const bot = createBot(c.env.BOT_TOKEN, db, c.env);

  return webhookCallback(bot, 'hono')(c);
});

export default app;
