import { MyContext } from '../context';
import { InlineKeyboard } from 'grammy';
import { orders, panels as panelsTable, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { MarzbanPanel } from '../../panels/marzban';
import { XUI3Panel } from '../../panels/3x-ui';

export async function handleManageServices(ctx: MyContext) {
    if (!ctx.from) return;

    const user = await ctx.db.query.users.findFirst({
        where: eq(users.telegramId, ctx.from.id)
    });

    if (!user) return;

    const userOrders = await ctx.db.query.orders.findMany({
        where: eq(orders.userId, user.id),
    });

    if (userOrders.length === 0) {
        return ctx.reply('❌ شما در حال حاضر هیچ سرویس فعالی ندارید.');
    }

    const keyboard = new InlineKeyboard();
    userOrders.forEach(o => {
        keyboard.text(`سرویس #${o.id} (${o.status})`, `manage_order_${o.id}`).row();
    });

    await ctx.reply('سرویس مورد نظر را برای مدیریت انتخاب کنید:', {
        reply_markup: keyboard,
    });
}

export async function handleOrderDetails(ctx: MyContext, orderId: number) {
    const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, orderId)
    });

    if (!order || !order.serviceIdentifier) return ctx.reply('❌ سرویس یافت نشد.');

    const panelData = await ctx.db.query.panels.findFirst({
        where: eq(panelsTable.id, order.panelId)
    });

    if (!panelData) return ctx.reply('❌ خطا در اتصال به پنل.');

    let usage = { used: 0, total: order.totalVolumeGb };

    try {
        let panel;
        if (panelData.type === 'marzban') {
            panel = new MarzbanPanel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        } else if (panelData.type === '3x-ui') {
            panel = new XUI3Panel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        }

        if (panel) {
            usage = await panel.getTraffic(order.serviceIdentifier);
        }
    } catch (e) {
        console.error('Failed to fetch real-time usage');
    }

    const usageText = `
📊 وضعیت سرویس #${orderId}:
- وضعیت: ${order.status}
- حجم مصرف شده: ${usage.used.toFixed(2)} گیگابایت
- حجم کل: ${usage.total.toFixed(2)} گیگابایت
- تاریخ انقضا: ${order.expiryDate ? order.expiryDate.toLocaleDateString('fa-IR') : 'نامحدود'}

🔗 لینک اتصال:
<code>${order.configLink}</code>
`;
    const keyboard = new InlineKeyboard()
        .text('🔄 تمدید سرویس', `renew_${orderId}`)
        .text('➕ خرید حجم اضافه', `add_volume_${orderId}`).row()
        .text('🔗 دریافت مجدد لینک', `get_link_${orderId}`).row()
        .text('🔙 بازگشت', 'manage_services');

    await ctx.editMessageText(usageText, { reply_markup: keyboard, parse_mode: 'HTML' });
}
