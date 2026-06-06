import { MyContext } from '../context';
import { tickets, ticketMessages, users } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function handleTicketMessage(ctx: MyContext) {
    if (!ctx.from || !ctx.message?.text) return;

    const user = await ctx.db.query.users.findFirst({
        where: eq(users.telegramId, ctx.from.id)
    });
    if (!user) return;

    // Check if user has an open ticket
    const openTicket = await ctx.db.query.tickets.findFirst({
        where: eq(tickets.userId, user.id),
        orderBy: [desc(tickets.createdAt)]
    });

    if (openTicket && openTicket.status !== 'closed') {
        await ctx.db.insert(ticketMessages).values({
            ticketId: openTicket.id,
            senderId: user.id,
            isAdmin: false,
            message: ctx.message.text,
        });
        await ctx.reply('✅ پیام شما ثبت شد و به زودی توسط پشتیبانان بررسی می‌شود.');
    } else {
        const [newTicket] = await ctx.db.insert(tickets).values({
            userId: user.id,
            subject: 'پشتیبانی عمومی',
            status: 'open',
        }).returning();

        await ctx.db.insert(ticketMessages).values({
            ticketId: newTicket.id,
            senderId: user.id,
            isAdmin: false,
            message: ctx.message.text,
        });
        await ctx.reply('🎫 تیکت جدیدی برای شما باز شد. پشتیبانان ما به زودی پاسخ شما را خواهند داد.');
    }
}
