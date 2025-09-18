import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, afterEach } from "vitest";

import * as schema from "~/server/db/schema";

// Set test environment variables
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: ":memory:",
  SKIP_ENV_VALIDATION: "true",
});

// Create in-memory database for testing
export async function createTestDb() {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });

  // Run migrations to set up schema
  await migrate(db, { migrationsFolder: "./drizzle" });

  return { db, client };
}

// Test database instance
let testDbInstance: Awaited<ReturnType<typeof createTestDb>> | null = null;

export async function getTestDb() {
  testDbInstance ??= await createTestDb();
  return testDbInstance.db;
}

export function closeTestDb() {
  if (testDbInstance) {
    testDbInstance.client.close();
    testDbInstance = null;
  }
}

// Setup hooks for test cleanup
beforeEach(async () => {
  // Reset database state before each test
  if (testDbInstance) {
    closeTestDb();
  }
  testDbInstance = await createTestDb();
});

afterEach(() => {
  // Clean up after each test
  closeTestDb();
});
