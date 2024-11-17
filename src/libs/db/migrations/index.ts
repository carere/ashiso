import { sql } from "drizzle-orm";
import type { MigrationMeta } from "drizzle-orm/migrator";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { digestMessage } from "../../utils";
import type * as schema from "../schema";
import journal from "./meta/_journal.json";

const readMigrationFiles = async () => {
  const migrationQueries: MigrationMeta[] = [];

  if (!journal) {
    throw new Error(`Can't find meta/_journal.json file`);
  }

  for (const journalEntry of journal.entries) {
    const { default: query } = await (import(`./${journalEntry.tag}.sql?raw`) as Promise<{
      default: string;
    }>);
    const result = query.split("--> statement-breakpoint").map((it) => it);

    migrationQueries.push({
      sql: result,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash: await digestMessage(query),
    });
  }

  return migrationQueries;
};

export const migrate = async (db: SqliteRemoteDatabase<typeof schema>) => {
  const migrations = await readMigrationFiles();
  const migrationsTable = "__drizzle_migrations";
  const migrationTableCreate = sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `;

  await db.run(migrationTableCreate);

  const dbMigrations = await db.values<[number, string, string]>(
    sql`SELECT id, hash, created_at FROM ${sql.identifier(
      migrationsTable,
    )} ORDER BY created_at DESC LIMIT 1`,
  );

  const lastDbMigration = dbMigrations[0] ?? undefined;

  await db.transaction(async (tx) => {
    for (const migration of migrations) {
      if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
        for (const stmt of migration.sql) {
          await tx.run(sql.raw(stmt));
        }
        await tx.run(
          sql`INSERT INTO ${sql.identifier(
            migrationsTable,
          )} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`,
        );
      }
    }
  });
};
