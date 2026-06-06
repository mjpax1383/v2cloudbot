import { InlineKeyboard } from 'grammy';
import { purchaseKeyboard } from '../keyboards';
import { products, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { MyContext } from '../context';

export async function handlePurchaseMenu(ctx: MyContext) {
  await ctx.reply('لطفاً دسته‌بندی مورد نظر خود را انتخاب کنید:', {
    reply_markup: purchaseKeyboard,
  });
}

export async function handleCategorySelection(ctx: MyContext) {
    const productList = await ctx.db.select().from(products).where(eq(products.isActive, true));

    if (productList.length === 0) {
        return ctx.editMessageText('❌ در حال حاضر هیچ محصولی موجود نیست.');
    }

    const keyboard = new InlineKeyboard();
    productList.forEach((p: any) => {
        keyboard.text(`${p.name} - ${p.price} تومان`, `buy_${p.id}`).row();
    });
    keyboard.text('🔙 بازگشت', 'manage_services');

    await ctx.editMessageText('سرویس مورد نظر خود را انتخاب کنید:', {
        reply_markup: keyboard,
    });
}

export async function handleWalletBalance(ctx: MyContext) {
    let balance = 0;
    if (ctx.from) {
        const user = await ctx.db.query.users.findFirst({
            where: eq(users.telegramId, ctx.from.id)
        });
        balance = user?.balance || 0;
    }

    const text = `
💰 موجودی کیف پول شما: ${balance} تومان

شما می‌توانید از طریق درگاه‌های پرداخت یا کارت‌به‌کارت، موجودی خود را افزایش دهید.
`;
    const keyboard = new InlineKeyboard()
        .text('💳 شارژ آنلاین', 'recharge_online').row()
        .text('🏦 کارت به کارت', 'recharge_c2c');

    await ctx.reply(text, { reply_markup: keyboard });
}
