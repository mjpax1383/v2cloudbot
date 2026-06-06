import { NextFunction, Keyboard } from 'grammy';
import { MyContext } from '../context';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function authMiddleware(ctx: MyContext, next: NextFunction) {
  if (!ctx.from || ctx.isAdmin) return next();

  // Fetch channel ID from settings or use default
  const channelSetting = await ctx.db.query.settings.findFirst({
      where: (s, { eq }) => eq(s.key, 'mandatory_channel')
  });
  const channelId = channelSetting?.value || '@yourchannel';

  try {
    const member = await ctx.api.getChatMember(channelId, ctx.from.id);
    if (member.status === 'left' || member.status === 'kicked') {
      return ctx.reply(`لطفاً ابتدا در کانال ما عضو شوید:\n${channelId}`, {
        reply_markup: new Keyboard().text('✅ عضو شدم').resized(),
      });
    }
  } catch (e: any) {
    if (e.description && e.description.includes('chat not found')) {
        console.error(`Channel ${channelId} not found. Please check channelId in settings.`);
    }
  }
  return next();
}

export async function phoneVerificationMiddleware(ctx: MyContext, next: NextFunction) {
  if (!ctx.from || ctx.isAdmin) return next();

  const user = await ctx.db.query.users.findFirst({
      where: eq(users.telegramId, ctx.from.id)
  });

  if (user && !user.isVerified && ctx.message?.text === '🛒 خرید سرویس') {
    return ctx.reply('برای خرید ابتدا باید شماره موبایل خود را تایید کنید.', {
        reply_markup: new Keyboard().requestContact('📱 تایید شماره موبایل').resized(),
    });
  }
  return next();
}
