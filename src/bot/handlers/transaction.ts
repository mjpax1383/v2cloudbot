import { MyContext } from '../context';
import { MarzbanPanel } from '../../panels/marzban';
import { XUI3Panel } from '../../panels/3x-ui';
import { users, products, orders, panels as panelsTable } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function processPurchase(ctx: MyContext, productId: number) {
    if (!ctx.from) return;

    try {
        const product = await ctx.db.query.products.findFirst({
            where: eq(products.id, productId)
        });
        const user = await ctx.db.query.users.findFirst({
            where: eq(users.telegramId, ctx.from.id)
        });

        if (!product || !user) {
            return ctx.reply('❌ خطا در یافتن اطلاعات محصول یا کاربر.');
        }

        if (user.balance < product.price) {
            return ctx.reply('❌ موجودی کیف پول شما کافی نیست. لطفاً ابتدا حساب خود را شارژ کنید.');
        }

        const panelData = await ctx.db.query.panels.findFirst({
            where: eq(panelsTable.id, product.panelId || 0)
        });

        if (!panelData) {
            return ctx.reply('❌ خطا در یافتن اطلاعات پنل VPN.');
        }

        await ctx.reply('⏳ در حال ایجاد سرویس، لطفاً شکیبا باشید...');

        // Deduct balance
        await ctx.db.update(users).set({
            balance: sql`${users.balance} - ${product.price}`
        }).where(eq(users.id, user.id));

        let panel;
        if (panelData.type === 'marzban') {
            panel = new MarzbanPanel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        } else if (panelData.type === '3x-ui') {
            panel = new XUI3Panel(panelData.apiUrl, { username: panelData.username || '', password: panelData.password || '' });
        } else {
            throw new Error('Panel type not supported');
        }

        const vpnUser = await panel.createUser({
            remark: `${user.username || ctx.from.id}_${Date.now()}`,
            volumeGb: product.volumeGb,
            expiryDays: product.durationDays,
        });

        // Create order
        await ctx.db.insert(orders).values({
            userId: user.id,
            productId: product.id,
            panelId: panelData.id,
            serviceIdentifier: vpnUser.identifier,
            configLink: vpnUser.configLink,
            totalVolumeGb: product.volumeGb,
            expiryDate: vpnUser.expiryDate,
        });

        const successText = `
✅ سرویس شما با موفقیت فعال شد!

🔗 لینک اتصال:
<code>${vpnUser.configLink}</code>

📊 مشخصات سرویس:
- حجم کل: ${vpnUser.totalVolumeGb} گیگابایت
- مهلت استفاده: ${product.durationDays} روز

برای آموزش استفاده از سرویس، بخش "آموزش و راهنما" را مشاهده کنید.
`;
        await ctx.reply(successText, { parse_mode: 'HTML' });
    } catch (error) {
        console.error(error);
        await ctx.reply('❌ متأسفانه خطایی در ایجاد سرویس رخ داد. لطفاً به پشتیبانی اطلاع دهید.');
    }
}
