import { Context, InlineKeyboard } from 'grammy';

export async function handleSupportMenu(ctx: Context) {
    const text = `
📞 بخش پشتیبانی

در صورتی که سوال یا مشکلی دارید، می‌توانید از طریق دکمه‌های زیر اقدام کنید. تیم ما در اسرع وقت پاسخگوی شما خواهد بود.
`;
    const keyboard = new InlineKeyboard()
        .text('🎫 ارسال تیکت جدید', 'new_ticket').row()
        .text('📂 تیکت‌های من', 'my_tickets').row()
        .text('❓ سوالات متداول (FAQ)', 'faq');

    await ctx.reply(text, { reply_markup: keyboard });
}

export async function handleNewTicket(ctx: Context) {
    await ctx.reply('لطفاً پیام خود را برای پشتیبانی ارسال کنید:');
    // Logic to enter conversation mode and save ticket to D1
}

export async function handleMyTickets(ctx: Context) {
    // Fetch tickets from D1
    await ctx.reply('لیست تیکت‌های شما:');
}
