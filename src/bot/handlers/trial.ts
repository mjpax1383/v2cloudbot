import { MyContext } from '../context';
import { orders, users, panels as panelsTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { MarzbanPanel } from '../../panels/marzban';
import { XUI3Panel } from '../../panels/3x-ui';

export async function handleFreeTrial(ctx: MyContext) {
    if (!ctx.from) return;

    const user = await ctx.db.query.users.findFirst({
        where: eq(users.telegramId, ctx.from.id)
    });
    if (!user) return;

    // Check if user already had a trial
    const existingTrial = await ctx.db.query.orders.findFirst({
        where: and(eq(orders.userId, user.id), eq(orders.productId, 0)) // We'll use ID 0 for trials
    });

    if (existingTrial) {
        return ctx.reply('❌ شما قبلاً از اعتبار تست رایگان خود استفاده کرده‌اید.');
    }

    try {
        await ctx.reply('⏳ در حال آماده‌سازی اکانت تست، لطفاً چند لحظه صبر کنید...');

        // Find a default panel for trials
        const panelData = await ctx.db.query.panels.findFirst({
            where: eq(panelsTable.isActive, true)
        });

        if (!panelData) {
            return ctx.reply('❌ در حال حاضر امکان صدور اکانت تست وجود ندارد.');
        }

        let panel;
        if (panelData.type === 'marzban') {
            panel = new MarzbanPanel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        } else if (panelData.type === '3x-ui') {
            panel = new XUI3Panel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        }

        if (!panel) {
            throw new Error('Panel type not supported for trial');
        }

        const vpnUser = await panel.createUser({
            remark: `trial_${ctx.from.id}`,
            volumeGb: 1, // 1GB for trial
            expiryDays: 1, // 1 day for trial
        });

        await ctx.db.insert(orders).values({
            userId: user.id,
            productId: 0, // Trial
            panelId: panelData.id,
            serviceIdentifier: vpnUser.identifier,
            configLink: vpnUser.configLink,
            totalVolumeGb: 1,
            expiryDate: vpnUser.expiryDate,
        });

        await ctx.reply(`
🎁 اکانت تست شما با موفقیت فعال شد!

🔗 لینک اتصال:
<code>${vpnUser.configLink}</code>

⚠️ این اکانت دارای ۱ گیگابایت حجم و ۱ روز اعتبار می‌باشد.
`, { parse_mode: 'HTML' });

    } catch (error) {
        console.error(error);
        await ctx.reply('❌ متأسفانه خطایی در صدور اکانت تست رخ داد.');
    }
}
