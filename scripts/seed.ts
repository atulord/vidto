import { z } from "zod";
import * as readline from "readline";
import "dotenv/config";

// Load environment variables from .env file

import { db } from "~/server/db";
import { tags, videos, videoTags } from "~/server/db/schema";
import videosJson from "../data/videos.json";
const InitialVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail_url: z.string(),
  duration: z.number(),
  created_at: z.string(),
  views: z.number(),
  tags: z.array(z.string()),
});

const InitialVideosSchema = z.object({ videos: z.array(InitialVideoSchema) });
console.log(videosJson);
type InitialVideo = z.infer<typeof InitialVideoSchema>;

// Use a more permissive type for the transaction to avoid complex type error
type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];

const getInitialVideos = (): InitialVideo[] => {
  const parsedData = InitialVideosSchema.safeParse(videosJson);
  if (!parsedData.success) {
    throw new Error("Failed to parse videos.json: " + parsedData.error.message);
  }
  return parsedData.data.videos;
};

const askConfirmation = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === "y");
    });
  });
};

const randomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
};

const createTagsInTransaction = async (
  tx: TransactionType,
  allVideoTags: string[],
) => {
  const uniqueTags = [...new Set(allVideoTags)];

  const tagData = uniqueTags.map((tagName) => ({
    id: crypto.randomUUID(),
    name: tagName,
    color: randomColor(),
  }));

  await tx.insert(tags).values(tagData);

  const tagMap = new Map<string, string>();
  tagData.forEach((tag) => {
    tagMap.set(tag.name, tag.id);
  });

  return tagMap;
};

const createVideosInTransaction = async (
  tx: TransactionType,
  initialVideos: InitialVideo[],
) => {
  const videoData = initialVideos.map((video) => ({
    id: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    views: video.views,
    createdAt: new Date(video.created_at),
  }));

  await tx.insert(videos).values(videoData);
};

const createVideoTagRelationsInTransaction = async (
  tx: TransactionType,
  initialVideos: InitialVideo[],
  tagMap: Map<string, string>,
) => {
  const relations = [];

  for (const video of initialVideos) {
    for (const tagName of video.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        relations.push({
          videoId: video.id,
          tagId: tagId,
        });
      }
    }
  }

  if (relations.length > 0) {
    await tx.insert(videoTags).values(relations);
  }
};

const clearDatabase = async (tx: TransactionType) => {
  console.log("🗑️  Clearing existing data...");

  // Delete in correct order due to foreign key constraints
  await tx.delete(videoTags);
  console.log("   ✅ Cleared video-tag relationships");

  await tx.delete(videos);
  console.log("   ✅ Cleared videos");

  await tx.delete(tags);
  console.log("   ✅ Cleared tags");
};

const seed = async () => {
  try {
    console.log("🌱 Starting seed process...");

    // Ask for confirmation before clearing database
    const shouldClear = await askConfirmation(
      "⚠️  This will delete ALL existing data in the database. Are you sure you want to continue?",
    );

    if (!shouldClear) {
      console.log("❌ Seed process cancelled by user");
      return;
    }

    console.log("📁 Loading videos from data/videos.json...");
    const initialVideos = getInitialVideos();
    console.log(`   ✅ Loaded ${initialVideos.length} videos`);

    await db.transaction(async (tx) => {
      // Clear existing data
      await clearDatabase(tx);

      // Extract all unique tags from videos
      console.log("🏷️  Processing tags...");
      const allVideoTags = initialVideos.flatMap((video) => video.tags);
      console.log(`   📝 Found ${allVideoTags.length} total tag references`);

      // Create tags and get the mapping
      const tagMap = await createTagsInTransaction(tx, allVideoTags);
      console.log(`   ✅ Created ${tagMap.size} unique tags`);

      // Create videos
      console.log("🎬 Creating videos...");
      await createVideosInTransaction(tx, initialVideos);
      console.log(`   ✅ Created ${initialVideos.length} videos`);

      // Create video-tag relationships
      console.log("🔗 Creating video-tag relationships...");
      await createVideoTagRelationsInTransaction(tx, initialVideos, tagMap);

      // Count relationships created
      const totalRelations = initialVideos.reduce(
        (acc, video) => acc + video.tags.length,
        0,
      );
      console.log(`   ✅ Created ${totalRelations} video-tag relationships`);
    });

    console.log("🎉 Seed process completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Videos: ${initialVideos.length}`);
    console.log(
      `   - Unique tags: ${[...new Set(initialVideos.flatMap((v) => v.tags))].length}`,
    );
    console.log(
      `   - Total relationships: ${initialVideos.reduce((acc, video) => acc + video.tags.length, 0)}`,
    );
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    console.error("🔄 All changes have been rolled back");
    throw error;
  }
};

seed()
  .catch((error) => {
    console.error("💥 Fatal error during seed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("🔚 Seed process finished");
    process.exit(0);
  });
