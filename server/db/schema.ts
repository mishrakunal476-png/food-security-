import { boolean, datetime, int, json, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  openId: varchar('open_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 24 }).notNull().default('donor'),
  organizationName: varchar('organization_name', { length: 180 }),
  area: varchar('area', { length: 180 }),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date()),
});

export const appSessions = mysqlTable('app_sessions', {
  tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date()),
});

export const donations = mysqlTable('donations', {
  id: varchar('id', { length: 40 }).primaryKey(),
  donorId: varchar('donor_id', { length: 64 }).notNull(),
  donorName: varchar('donor_name', { length: 180 }).notNull(),
  ngoId: varchar('ngo_id', { length: 64 }),
  ngoName: varchar('ngo_name', { length: 180 }),
  partnerId: varchar('partner_id', { length: 64 }),
  partnerName: varchar('partner_name', { length: 180 }),
  foodName: varchar('food_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  quantity: int('quantity').notNull(),
  unit: varchar('unit', { length: 32 }).notNull(),
  servings: int('servings').notNull(),
  area: varchar('area', { length: 255 }).notNull(),
  pickupLocation: varchar('pickup_location', { length: 255 }).notNull(),
  pickupWindow: varchar('pickup_window', { length: 180 }).notNull(),
  storage: varchar('storage', { length: 255 }).notNull(),
  foodSafetyNotes: text('food_safety_notes').notNull(),
  allergens: json('allergens').$type<string[]>().notNull(),
  preparedAt: datetime('prepared_at', { mode: 'date' }).notNull(),
  useBy: datetime('use_by', { mode: 'date' }).notNull(),
  etaMinutes: int('eta_minutes').notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  deliveredQuantity: int('delivered_quantity'),
  needsReassignment: boolean('needs_reassignment').notNull().default(false),
  assignmentHistory: json('assignment_history').$type<{ partnerId: string; partnerName: string; assignedAt: string; outcome: 'active' | 'failed' | 'completed' }[]>().notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull(),
});

export const activityEvents = mysqlTable('activity_events', {
  id: varchar('id', { length: 64 }).primaryKey(),
  donationId: varchar('donation_id', { length: 40 }).notNull(),
  actorId: varchar('actor_id', { length: 64 }).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(),
  title: varchar('title', { length: 180 }).notNull(),
  detail: text('detail').notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull(),
});

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  recipientId: varchar('recipient_id', { length: 64 }).notNull(),
  title: varchar('title', { length: 180 }).notNull(),
  detail: text('detail').notNull(),
  tone: varchar('tone', { length: 20 }).notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: datetime('created_at', { mode: 'date' }).notNull(),
});
