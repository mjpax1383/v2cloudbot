import { NextFunction } from 'grammy';
import { MyContext } from '../context';
import { admins } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function adminMiddleware(ctx: MyContext, next: NextFunction) {
  if (!ctx.from) return;

  const admin = await ctx.db.query.admins.findFirst({
      where: eq(admins.telegramId, ctx.from.id)
  });

  if (!admin) {
    // Silently ignore or send a message
    // return ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
    return;
  }

  return next();
}
