import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./sql";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://shopcal:shopcal_dev_local@127.0.0.1:5432/shopcal";

const globalForDb = globalThis as unknown as {
  pg?: ReturnType<typeof postgres>;
  schemaReady?: Promise<void>;
};

export const client =
  globalForDb.pg ??
  postgres(connectionString, {
    max: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pg = client;
}

export const db = drizzle(client, { schema });

export async function ensureSchema() {
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = client.unsafe(SCHEMA_SQL).then(() => undefined);
  }
  await globalForDb.schemaReady;
}
