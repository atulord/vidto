import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, afterEach } from "vitest";

import * as schema from "~/server/db/schema";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = ":memory:";
process.env.SKIP_ENV_VALIDATION = "true";

// Create in-memory database for testing
export function createTestDb() {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });

  // Run migrations to set up schema
  migrate(db, { migrationsFolder: "./drizzle" });

  return { db, client };
}

// Test database instance
let testDbInstance: ReturnType<typeof createTestDb> | null = null;

export function getTestDb() {
  if (!testDbInstance) {
    testDbInstance = createTestDb();
  }
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
  testDbInstance = createTestDb();
});

afterEach(() => {
  // Clean up after each test
  closeTestDb();
});
