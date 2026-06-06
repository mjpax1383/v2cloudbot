import { NextFunction } from 'grammy';
import { MyContext } from '../context';

export async function adminMiddleware(ctx: MyContext, next: NextFunction) {
  if (!ctx.from) return;

  if (!ctx.isAdmin) {
    // Silently ignore or send a message
    // return ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
    return;
  }

  return next();
}
