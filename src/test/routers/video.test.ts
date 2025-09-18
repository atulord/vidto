import { describe, it, expect, beforeEach } from "vitest";
import { type inferProcedureInput } from "@trpc/server";
import { createCallerFactory } from "~/server/api/trpc";
import { videoRouter } from "~/server/api/routers/video";
import { getTestDb } from "../setup";
import { tags } from "~/server/db/schema";
import { SortKey, type VideoItem } from "~/shared/types";

// Create a test caller
const createCaller = createCallerFactory(videoRouter);

function createTestCaller() {
  const db = getTestDb();
  return createCaller({
    db,
    headers: new Headers(),
  });
}

// Helper to create test tags
async function seedTestTags() {
  const db = getTestDb();
  const testTags = [
    { id: "tag1", name: "Education", color: "#3B82F6" },
    { id: "tag2", name: "Entertainment", color: "#EF4444" },
    { id: "tag3", name: "Technology", color: "#10B981" },
  ];
  await db.insert(tags).values(testTags);
  return testTags;
}

describe("videoRouter", () => {
  describe("createVideo procedure", () => {
    it("should create a video with basic data", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof videoRouter.createVideo> = {
        title: "Test Video",
        duration: 600,
        views: 500,
      };

      const result = await caller.createVideo(input);

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("string");
    });

    it("should create a video with tags", async () => {
      const caller = createTestCaller();
      await seedTestTags();

      const input: inferProcedureInput<typeof videoRouter.createVideo> = {
        title: "Tagged Video",
        duration: 300,
        views: 200,
        tagIds: ["tag1", "tag2"],
      };

      const result = await caller.createVideo(input);
      const video = await caller.getVideo({ id: result.id });

      expect(video).not.toBeNull();
      expect(video!.tags).toHaveLength(2);
      expect(video!.tags.map((t) => t.id)).toEqual(
        expect.arrayContaining(["tag1", "tag2"]),
      );
    });

    it("should reject video with empty title", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof videoRouter.createVideo> = {
        title: "",
        duration: 300,
        views: 0,
      };

      await expect(caller.createVideo(input)).rejects.toThrow();
    });

    it("should reject video with negative duration", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof videoRouter.createVideo> = {
        title: "Test Video",
        duration: -1,
        views: 0,
      };

      await expect(caller.createVideo(input)).rejects.toThrow();
    });

    it("should reject video with negative views", async () => {
      const caller = createTestCaller();
      const input: inferProcedureInput<typeof videoRouter.createVideo> = {
        title: "Test Video",
        duration: 300,
        views: -100,
      };

      await expect(caller.createVideo(input)).rejects.toThrow();
    });
  });

  describe("getVideo procedure", () => {
    it("should return null for non-existent video", async () => {
      const caller = createTestCaller();
      const result = await caller.getVideo({ id: "non-existent" });

      expect(result).toBeNull();
    });

    it("should return video with correct structure", async () => {
      const caller = createTestCaller();
      await seedTestTags();

      const created = await caller.createVideo({
        title: "Structured Video",
        duration: 450,
        views: 750,
        tagIds: ["tag1"],
      });

      const video = await caller.getVideo({ id: created.id });

      expect(video).toMatchObject({
        id: created.id,
        title: "Structured Video",
        duration: 450,
        views: 750,
        thumbnailUrl: expect.stringContaining("picsum.photos"),
        createdAt: expect.any(String),
        tags: expect.arrayContaining([
          expect.objectContaining({
            id: "tag1",
            name: "Education",
            color: "#3B82F6",
          }),
        ]),
      });
    });
  });

  describe("listVideos procedure", () => {
    beforeEach(async () => {
      const caller = createTestCaller();
      await seedTestTags();

      await caller.createVideo({
        title: "First Video",
        duration: 100,
        views: 500,
        tagIds: ["tag1"],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await caller.createVideo({
        title: "Second Video",
        duration: 200,
        views: 5000,
        tagIds: ["tag2"],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await caller.createVideo({
        title: "Third Video",
        duration: 300,
        views: 100,
        tagIds: ["tag1", "tag3"],
      });
    });

    it("should list videos sorted by newest first", async () => {
      const caller = createTestCaller();
      const result: VideoItem[] = await caller.listVideos({
        sort: SortKey.Newest,
        limit: 10,
      });
      expect(result).toHaveLength(3);
      expect(result[0]!.title).toBe("Third Video");
      expect(result[1]!.title).toBe("Second Video");
      expect(result[2]!.title).toBe("First Video");
    });

    it("should list videos sorted by most views", async () => {
      const caller = createTestCaller();
      const result = await caller.listVideos({
        sort: SortKey.MostViews,
        limit: 10,
      });

      expect(result[0].title).toBe("Second Video");
      expect(result[0].views).toBe(5000);
    });

    it("should filter videos by tags", async () => {
      const caller = createTestCaller();
      const result = await caller.listVideos({
        sort: SortKey.Newest,
        tagIds: ["tag1"],
        limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(result.every((v) => v.tags.some((t) => t.id === "tag1"))).toBe(
        true,
      );
    });

    it("should respect limit parameter", async () => {
      const caller = createTestCaller();
      const result = await caller.listVideos({
        sort: SortKey.Newest,
        limit: 2,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("getVideoCount procedure", () => {
    it("should return 0 when no videos exist", async () => {
      const caller = createTestCaller();
      const count = await caller.getVideoCount();

      expect(count).toBe(0);
    });

    it("should return correct count after creating videos", async () => {
      const caller = createTestCaller();

      await caller.createVideo({
        title: "Video 1",
        duration: 300,
        views: 100,
      });

      await caller.createVideo({
        title: "Video 2",
        duration: 400,
        views: 200,
      });

      const count = await caller.getVideoCount();
      expect(count).toBe(2);
    });
  });
});
