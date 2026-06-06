import { payments, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { MyContext } from '../context';

export async function handleReceiptUpload(ctx: MyContext) {
    if (!ctx.from || !ctx.message?.photo) return;

    const user = await ctx.db.query.users.findFirst({
        where: eq(users.telegramId, ctx.from.id)
    });

    if (!user) return;

    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.api.getFile(photo.file_id);
    const receiptUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

    await ctx.db.insert(payments).values({
        userId: user.id,
        amount: 0,
        gateway: 'card-to-card',
        status: 'pending',
        receiptImage: receiptUrl,
    });

    await ctx.reply('✅ رسید شما دریافت شد و پس از تایید مدیریت، حساب شما شارژ خواهد شد.');
}
