import { describe, it, expect, beforeEach } from "vitest";
import { createCallerFactory } from "~/server/api/trpc";
import { tagRouter } from "~/server/api/routers/tag";
import { getTestDb } from "../setup";
import { tags } from "~/server/db/schema";
import { sql } from "drizzle-orm";

// Create a test caller
const createCaller = createCallerFactory(tagRouter);

async function createTestCaller() {
  const db = await getTestDb();
  return createCaller({
    db,
    headers: new Headers(),
  });
}

describe("tagRouter", () => {
  describe("listTags procedure", () => {
    beforeEach(async () => {
      const db = await getTestDb();
      await db.insert(tags).values([
        { id: "tag1", name: "Education", color: "#3B82F6" },
        { id: "tag2", name: "Entertainment", color: "#EF4444" },
        { id: "tag3", name: "Technology", color: "#10B981" },
        { id: "tag4", name: "Art", color: "#8B5CF6" },
      ]);
    });

    it("should return all tags", async () => {
      const caller = await createTestCaller();
      const result = await caller.listTags();

      expect(result).toHaveLength(4);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringMatching(/.+/) as string,
            name: expect.stringMatching(/.+/) as string,
            color: expect.stringMatching(/^#[0-9A-F]{6}$/i) as string,
          }),
        ]),
      );
    });

    it("should return tags sorted alphabetically by name", async () => {
      const caller = await createTestCaller();
      const result = await caller.listTags();

      const names = result.map((tag) => tag.name);
      expect(names).toEqual([
        "Art",
        "Education",
        "Entertainment",
        "Technology",
      ]);
    });

    it("should return empty array when no tags exist", async () => {
      const db = await getTestDb();
      await db.delete(tags).where(sql`1=1`);

      const caller = await createTestCaller();
      const result = await caller.listTags();

      expect(result).toEqual([]);
    });
  });
});
