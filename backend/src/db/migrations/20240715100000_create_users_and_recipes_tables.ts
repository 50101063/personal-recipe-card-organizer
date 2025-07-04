import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if uuid-ossp extension exists, if not, create it
  const hasUuidExtension = await knex.raw("SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'");
  if (hasUuidExtension.rows.length === 0) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('recipes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('ingredients').notNullable();
    table.text('instructions').notNullable();
    table.string('category').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('name');
    table.index('category');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recipes');
  await knex.schema.dropTableIfExists('users');
  // Consider dropping extension only if it was created by this migration and no other tables use it
  // For simplicity, we'll keep it for now or rely on manual cleanup if desired.
  // await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
