import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  deletedAt: text('deleted_at'),
  markedForDeletion: integer('marked_for_deletion', {
    mode: 'boolean',
  }).default(false),
  // Email verification fields
  verificationCode: text('verification_code'),
  verificationCodeExpiresAt: text('verification_code_expires_at'),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .default(false)
    .notNull(),
});

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  title: text('title'),
  contentPreview: text('content_preview').notNull(),
  contentBlobKey: text('content_blob_key').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  tags: text('tags'),
});

export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  promptId: text('prompt_id')
    .notNull()
    .references(() => prompts.id),
  modelName: text('model_name').notNull(),
  contentPreview: text('content_preview').notNull(),
  contentBlobKey: text('content_blob_key').notNull(),
  isMarkdown: integer('is_markdown', { mode: 'boolean' })
    .notNull()
    .default(true),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
