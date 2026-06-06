import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  telegramId: integer('telegram_id').unique().notNull(),
  username: text('username'),
  fullName: text('full_name'),
  phoneNumber: text('phone_number'),
  balance: real('balance').default(0).notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey(),
  telegramId: integer('telegram_id').unique().notNull(),
  level: text('level').default('admin').notNull(), // 'superadmin', 'admin'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const panels = sqliteTable('panels', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'marzban', '3x-ui', 'hiddify', etc.
  apiUrl: text('api_url').notNull(),
  username: text('username'),
  password: text('password'),
  token: text('token'),
  config: text('config'), // JSON string for extra panel-specific settings
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id'),
  panelId: integer('panel_id').references(() => panels.id),
  price: real('price').notNull(),
  volumeGb: integer('volume_gb').notNull(),
  durationDays: integer('duration_days').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  panelId: integer('panel_id').references(() => panels.id).notNull(),
  serviceIdentifier: text('service_identifier'), // e.g., UUID from Marzban
  configLink: text('config_link'),
  status: text('status').default('active').notNull(), // 'active', 'expired', 'cancelled'
  volumeUsedGb: real('volume_used_gb').default(0).notNull(),
  totalVolumeGb: real('total_volume_gb').notNull(),
  expiryDate: integer('expiry_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: real('amount').notNull(),
  gateway: text('gateway').notNull(), // 'card-to-card', 'nowpayments', 'aqayepardakht'
  transactionId: text('transaction_id'),
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'failed', 'rejected'
  receiptImage: text('receipt_image'), // for card-to-card
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  status: text('status').default('open').notNull(), // 'open', 'closed', 'pending_admin'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const ticketMessages = sqliteTable('ticket_messages', {
  id: integer('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  senderId: integer('sender_id'), // null for system, or telegramId
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false).notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
