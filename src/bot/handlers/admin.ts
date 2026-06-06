import { InlineKeyboard } from 'grammy';
import { MyContext } from '../context';
import { users, orders, payments } from '../../db/schema';
import { count, sum, eq } from 'drizzle-orm';

export async function handleAdminMenu(ctx: MyContext) {
    const text = '🛠 پنل مدیریت ربات\nلطفاً یک بخش را انتخاب کنید:';
    const keyboard = new InlineKeyboard()
        .text('📦 مدیریت محصولات', 'admin_products').row()
        .text('🖥 مدیریت پنل‌ها', 'admin_panels').row()
        .text('👥 مدیریت کاربران', 'admin_users').row()
        .text('📊 گزارشات مالی', 'admin_reports').row()
        .text('📝 مدیریت متون', 'admin_texts');

    await ctx.reply(text, { reply_markup: keyboard });
}

export async function handleAdminProducts(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
        .text('➕ افزودن محصول جدید', 'admin_add_product').row()
        .text('✏️ ویرایش محصولات', 'admin_list_products').row()
        .text('🔙 بازگشت', 'admin_menu');

    await ctx.editMessageText('📦 مدیریت محصولات:', { reply_markup: keyboard });
}

export async function handleAdminPanels(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
        .text('➕ افزودن پنل', 'admin_add_panel').row()
        .text('📋 لیست پنل‌ها', 'admin_list_panels').row()
        .text('🔙 بازگشت', 'admin_menu');

    await ctx.editMessageText('🖥 مدیریت پنل‌های VPN:', { reply_markup: keyboard });
}

export async function handleAdminUsers(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
        .text('🔍 جستجوی کاربر', 'admin_search_user').row()
        .text('📈 لیست خریدهای اخیر', 'admin_recent_orders').row()
        .text('🔙 بازگشت', 'admin_menu');

    await ctx.editMessageText('👥 مدیریت کاربران:', { reply_markup: keyboard });
}

export async function handleAdminReports(ctx: MyContext) {
    const userCount = await ctx.db.select({ count: count() }).from(users);
    const orderCount = await ctx.db.select({ count: count() }).from(orders);
    const totalIncome = await ctx.db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'completed'));

    const text = `
📊 گزارش عملکرد ربات:
- کل کاربران: ${userCount[0].count}
- کل سفارشات: ${orderCount[0].count}
- درآمد کل تایید شده: ${totalIncome[0].total || 0} تومان
`;
    const keyboard = new InlineKeyboard()
        .text('📈 خروجی اکسل', 'admin_report_excel')
        .text('🔙 بازگشت', 'admin_menu');

    await ctx.editMessageText(text, { reply_markup: keyboard });
}

export async function handleAdminTexts(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
        .text('📖 ویرایش راهنما', 'edit_help')
        .text('❓ ویرایش FAQ', 'edit_faq').row()
        .text('💬 پیام همگانی', 'broadcast_message').row()
        .text('🔙 بازگشت', 'admin_menu');

    await ctx.editMessageText('📝 مدیریت متون و پیام‌ها:', { reply_markup: keyboard });
}
