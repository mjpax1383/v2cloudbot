import { Bot } from 'grammy';
import { MyContext } from './context';
import { handleStart, handleContact } from './handlers/start';
import { authMiddleware, phoneVerificationMiddleware } from './middlewares/auth';
import { adminMiddleware } from './middlewares/admin';
import { handlePurchaseMenu, handleCategorySelection, handleWalletBalance } from './handlers/purchase';
import { handleManageServices, handleOrderDetails } from './handlers/service-management';
import { handleSupportMenu } from './handlers/support';
import { handleAdminMenu, handleAdminProducts, handleAdminPanels, handleAdminUsers, handleAdminReports, handleAdminTexts } from './handlers/admin';
import { processPurchase } from './handlers/transaction';
import { handleReceiptUpload } from './handlers/payment';
import { handleTicketMessage } from './handlers/ticket-logic';
import { handleFreeTrial } from './handlers/trial';
import { admins } from '../db/schema';
import { eq } from 'drizzle-orm';

export function createBot(token: string, db: any, env: any) {
  const bot = new Bot<MyContext>(token);

  bot.use(async (ctx, next) => {
    ctx.db = db;
    ctx.env = env;

    // Check if user is admin once per request
    if (ctx.from) {
        const admin = await ctx.db.query.admins.findFirst({
            where: eq(admins.telegramId, ctx.from.id)
        });
        ctx.isAdmin = !!admin;
    }

    await next();
  });

  // User Commands
  bot.command('start', handleStart);
  bot.on('message:contact', handleContact);

  // Middlewares for Users (skip if admin)
  bot.use(authMiddleware);
  bot.use(phoneVerificationMiddleware);

  // User Keyboard Handlers
  bot.hears('🛒 خرید سرویس', handlePurchaseMenu);
  bot.hears('👤 حساب کاربری', handleWalletBalance);
  bot.hears('💰 شارژ کیف پول', handleWalletBalance);
  bot.hears('🛠 مدیریت سرویس‌ها', handleManageServices);
  bot.hears('📞 پشتیبانی', handleSupportMenu);

  bot.on('message:text', async (ctx, next) => {
    const text = ctx.message?.text;
    if (text && !text.startsWith('/') && !['🛒 خرید سرویس', '👤 حساب کاربری', '💰 شارژ کیف پول', '🛠 مدیریت سرویس‌ها', '📞 پشتیبانی'].includes(text)) {
        return handleTicketMessage(ctx);
    }
    await next();
  });

  // Admin Commands
  bot.command('admin', adminMiddleware, handleAdminMenu);

  // Callback Queries
  bot.on('message:photo', handleReceiptUpload);

  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('buy_')) {
        const productId = parseInt(data.split('_')[1]);
        await processPurchase(ctx, productId);
    } else if (data === 'free_trial') {
        await handleFreeTrial(ctx);
    } else if (data.startsWith('cat_')) {
        await handleCategorySelection(ctx);
    } else if (data === 'manage_services') {
        await handleManageServices(ctx);
    } else if (data.startsWith('manage_order_')) {
        const orderId = parseInt(data.split('_')[2]);
        await handleOrderDetails(ctx, orderId);
    } else if (data === 'recharge_wallet' || data === 'recharge_online' || data === 'recharge_c2c') {
        await handleWalletBalance(ctx);
    } else if (data === 'orders_history') {
        await ctx.reply('⏳ این بخش به زودی فعال خواهد شد.');
    } else if (data.startsWith('admin_')) {
        return adminMiddleware(ctx, async () => {
            if (data === 'admin_menu') await handleAdminMenu(ctx);
            if (data === 'admin_products') await handleAdminProducts(ctx);
            if (data === 'admin_panels') await handleAdminPanels(ctx);
            if (data === 'admin_users') await handleAdminUsers(ctx);
            if (data === 'admin_reports') await handleAdminReports(ctx);
            if (data === 'admin_texts') await handleAdminTexts(ctx);
        });
    }

    await ctx.answerCallbackQuery();
  });

  return bot;
}
