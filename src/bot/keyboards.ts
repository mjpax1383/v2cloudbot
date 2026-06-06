import { InlineKeyboard, Keyboard } from 'grammy';

export const mainMenuKeyboard = new Keyboard()
  .text('🛒 خرید سرویس').text('👤 حساب کاربری').row()
  .text('💰 شارژ کیف پول').text('🛠 مدیریت سرویس‌ها').row()
  .text('📚 آموزش و راهنما').text('📞 پشتیبانی').row()
  .resized();

export const accountKeyboard = new InlineKeyboard()
  .text('💎 موجودی: {balance} تومان', 'ignore').row()
  .text('📝 تاریخچه خریدها', 'orders_history').row()
  .text('💳 شارژ حساب', 'recharge_wallet');

export const purchaseKeyboard = new InlineKeyboard()
  .text('🔋 سرویس‌های حجمی', 'cat_volume').row()
  .text('⏳ سرویس‌های زمانی', 'cat_time').row()
  .text('🎁 اکانت تست (رایگان)', 'free_trial');

export const supportKeyboard = new InlineKeyboard()
  .text('🎫 تیکت جدید', 'new_ticket').row()
  .text('📂 تیکت‌های من', 'my_tickets').row()
  .url('📣 کانال اطلاع‌رسانی', 'https://t.me/yourchannel');
