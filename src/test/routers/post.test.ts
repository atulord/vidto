import { describe, it, expect } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { createCallerFactory } from "~/server/api/trpc";
import { postRouter } from "~/server/api/routers/post";
import { getTestDb } from "../setup";

// Create a test caller
const createCaller = createCallerFactory(postRouter);

function createTestCaller() {
  const db = getTestDb();
  return createCaller({
    db,
    headers: new Headers(),
  });
}

describe("postRouter", () => {
  describe("hello procedure", () => {
    it("should return greeting with provided text", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof postRouter.hello> = {
        text: "World",
      };

      const result = await caller.hello(input);

      expect(result).toEqual({
        greeting: "Hello World",
      });
    });

    it("should handle empty string", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof postRouter.hello> = {
        text: "",
      };

      const result = await caller.hello(input);

      expect(result).toEqual({
        greeting: "Hello ",
      });
    });

    it("should handle special characters", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof postRouter.hello> = {
        text: "Test 123!@#",
      };

      const result = await caller.hello(input);

      expect(result).toEqual({
        greeting: "Hello Test 123!@#",
      });
    });
  });

  describe("create procedure", () => {
    it("should create a new post", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof postRouter.create> = {
        name: "Test Post",
      };

      // Should not throw
      await expect(caller.create(input)).resolves.toBeUndefined();
    });

    it("should reject empty name", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof postRouter.create> = {
        name: "",
      };

      await expect(caller.create(input)).rejects.toThrow();
    });

    it("should create post and make it retrievable", async () => {
      const caller = createTestCaller();
      const postName = "Retrievable Post";

      await caller.create({ name: postName });
      const latestPost = await caller.getLatest();

      expect(latestPost).not.toBeNull();
      expect(latestPost?.name).toBe(postName);
      expect(latestPost?.id).toBeDefined();
      expect(latestPost?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("getLatest procedure", () => {
    it("should return null when no posts exist", async () => {
      const caller = createTestCaller();

      const result = await caller.getLatest();

      expect(result).toBeNull();
    });

    it("should return the most recent post", async () => {
      const caller = createTestCaller();

      // Create multiple posts with longer delays to ensure different unix timestamps
      await caller.create({ name: "First Post" });
      await new Promise((resolve) => setTimeout(resolve, 1100)); // > 1 second
      await caller.create({ name: "Second Post" });
      await new Promise((resolve) => setTimeout(resolve, 1100)); // > 1 second
      await caller.create({ name: "Third Post" });

      const latestPost = await caller.getLatest();

      expect(latestPost).not.toBeNull();
      expect(latestPost?.name).toBe("Third Post");
    });

    it("should return post with correct structure", async () => {
      const caller = createTestCaller();
      const postName = "Structured Post";

      await caller.create({ name: postName });
      const latestPost = await caller.getLatest();

      expect(latestPost).toMatchObject({
        id: expect.any(Number),
        name: postName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should handle concurrent post creation", async () => {
      const caller = createTestCaller();

      // Create posts concurrently
      const promises = [
        caller.create({ name: "Concurrent Post 1" }),
        caller.create({ name: "Concurrent Post 2" }),
        caller.create({ name: "Concurrent Post 3" }),
      ];

      await Promise.all(promises);
      const latestPost = await caller.getLatest();

      expect(latestPost).not.toBeNull();
      expect(latestPost?.name).toMatch(/^Concurrent Post [1-3]$/);
    });
  });

  describe("integration tests", () => {
    it("should handle complete workflow: create multiple posts and get latest", async () => {
      const caller = createTestCaller();

      // Initially no posts
      expect(await caller.getLatest()).toBeNull();

      // Create first post
      await caller.create({ name: "First Post" });
      let latest = await caller.getLatest();
      expect(latest?.name).toBe("First Post");

      // Create second post with longer delay
      await new Promise((resolve) => setTimeout(resolve, 1100)); // > 1 second
      await caller.create({ name: "Second Post" });
      latest = await caller.getLatest();
      expect(latest?.name).toBe("Second Post");

      // Verify hello still works
      const greeting = await caller.hello({ text: "Integration Test" });
      expect(greeting.greeting).toBe("Hello Integration Test");
    });
  });
});
