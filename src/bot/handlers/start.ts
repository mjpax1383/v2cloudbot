import { MyContext } from '../context';
import { mainMenuKeyboard } from '../keyboards';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function handleStart(ctx: MyContext) {
  if (ctx.from && ctx.db) {
      const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.telegramId, ctx.from.id)
      });
      if (!existingUser) {
          await ctx.db.insert(users).values({
              telegramId: ctx.from.id,
              username: ctx.from.username,
              fullName: `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim(),
          });
      }
  }

  const welcomeText = `
درود! به ربات فروش VPN خوش آمدید. 🚀

💎 با استفاده از این ربات می‌توانید به سادگی و با چند کلیک، سرویس مورد نیاز خود را خریداری کرده و بلافاصله دریافت کنید.

✅ برخی از امکانات ربات:
- تحویل آنی کانفیگ پس از خرید
- پشتیبانی از درگاه‌های معتبر
- مشاهده وضعیت سرویس و حجم باقی‌مانده
- تمدید آنلاین سرویس
- پشتیبانی ۲۴ ساعته

لطفاً از منوی زیر برای شروع استفاده کنید 👇
`;
  await ctx.reply(welcomeText, {
    reply_markup: mainMenuKeyboard,
  });
}

export async function handleContact(ctx: MyContext) {
    if (!ctx.message?.contact || !ctx.from) return;

    // Ensure the contact belongs to the user
    if (ctx.message.contact.user_id !== ctx.from.id) {
        return ctx.reply('❌ لطفاً شماره موبایل خود را به اشتراک بگذارید.');
    }

    await ctx.db.update(users).set({
        phoneNumber: ctx.message.contact.phone_number,
        isVerified: true
    }).where(eq(users.telegramId, ctx.from.id));

    await ctx.reply('✅ شماره موبایل شما با موفقیت تایید شد. اکنون می‌توانید از تمامی امکانات ربات استفاده کنید.', {
        reply_markup: mainMenuKeyboard
    });
}
