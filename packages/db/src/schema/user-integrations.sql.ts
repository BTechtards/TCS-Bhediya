import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userIntegrationType = pgEnum('user_integration_type', [
    'codeforces',
    'github',
]);

export const userIntegrations = pgTable('user_integrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    type: userIntegrationType('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    externalId: text('external_id').notNull()
});
