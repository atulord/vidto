import { z } from "zod";
import { db } from "~/server/db";
import { tags, videos, videoTags } from "~/server/db/schema";

const API_URL =
  "https://file.notion.so/f/f/69277768-5815-4715-8188-871eac2f782b/d56b1c8b-2528-4e2d-b8c3-0f1c165ee0af/videos.json?table=block&id=1f2cd243-3784-8034-9853-d0a76012ccc5&spaceId=69277768-5815-4715-8188-871eac2f782b&expirationTimestamp=1758168000000&signature=pNPkB49DwJ0DCIGn2yvN-FWxQ2U5zCElmurIQnNQssc&downloadName=videos.json";

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

type InitialVideos = z.infer<typeof InitialVideosSchema>;
type InitialVideo = z.infer<typeof InitialVideoSchema>;

class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

const fetchInitialVideos = async (): Promise<InitialVideo[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new FetchError(
      "Failed to fetch initial videos: " + response.statusText,
      response.status,
      response.statusText,
    );
  }

  const data = await response.json();
  const parsedData = InitialVideosSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(
      "Failed to parse initial videos: " + parsedData.error.message,
    );
  }
  return parsedData.data.videos;
};

const randomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
};

const createTagsInTransaction = async (tx: any, allVideoTags: string[]) => {
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
  tx: any,
  initialVideos: InitialVideo[],
) => {
  const videoData = initialVideos.map((video) => ({
    id: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    views: video.views,
  }));

  await tx.insert(videos).values(videoData);
};

const createVideoTagRelationsInTransaction = async (
  tx: any,
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

const seed = async () => {
  try {
    console.log("🌱 Starting seed process...");

    await db.transaction(async (tx) => {
      // Fetch initial data
      console.log("📥 Fetching initial videos...");
      const initialVideos = await fetchInitialVideos();
      console.log(`✅ Fetched ${initialVideos.length} videos`);

      // Create tags
      console.log("🏷️ Creating tags...");
      const allTags = initialVideos.flatMap((video) => video.tags);
      const tagMap = await createTagsInTransaction(tx, allTags);
      console.log(`✅ Created ${tagMap.size} unique tags`);

      // Create videos
      console.log("🎥 Creating videos...");
      await createVideosInTransaction(tx, initialVideos);
      console.log(`✅ Created ${initialVideos.length} videos`);

      // Create video-tag relationships
      console.log("🔗 Creating video-tag relationships...");
      await createVideoTagRelationsInTransaction(tx, initialVideos, tagMap);
      console.log("✅ Created video-tag relationships");
    });

    console.log("🎉 Seed process completed successfully!");
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
