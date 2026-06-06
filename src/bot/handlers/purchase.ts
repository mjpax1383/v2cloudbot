import { Context, InlineKeyboard } from 'grammy';
import { purchaseKeyboard } from '../keyboards';

export async function handlePurchaseMenu(ctx: Context) {
  await ctx.reply('لطفاً دسته‌بندی مورد نظر خود را انتخاب کنید:', {
    reply_markup: purchaseKeyboard,
  });
}

export async function handleCategorySelection(ctx: Context) {
    // In a real app, fetch products from D1 based on category
    const products = [
        { id: 1, name: 'سرویس ۱۰ گیگ - یک ماهه', price: 50000 },
        { id: 2, name: 'سرویس ۲۰ گیگ - یک ماهه', price: 90000 },
    ];

    const keyboard = new InlineKeyboard();
    products.forEach(p => {
        keyboard.text(`${p.name} - ${p.price} تومان`, `buy_${p.id}`).row();
    });
    keyboard.text('🔙 بازگشت', 'back_to_categories');

    await ctx.editMessageText('سرویس مورد نظر خود را انتخاب کنید:', {
        reply_markup: keyboard,
    });
}

export async function handleWalletBalance(ctx: Context) {
    const balance = 0; // Fetch from D1
    const text = `
💰 موجودی کیف پول شما: ${balance} تومان

شما می‌توانید از طریق درگاه‌های پرداخت یا کارت‌به‌کارت، موجودی خود را افزایش دهید.
`;
    const keyboard = new InlineKeyboard()
        .text('💳 شارژ آنلاین', 'recharge_online').row()
        .text('🏦 کارت به کارت', 'recharge_c2c');

    await ctx.reply(text, { reply_markup: keyboard });
}
