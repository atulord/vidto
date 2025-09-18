import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { asc, desc, eq, count, inArray, and, gte, lte } from "drizzle-orm";
import { videos, videoTags } from "~/server/db/schema";
import { SortKey } from "~/shared/types";

const getVideoByIdRequestSchema = z.object({
  id: z.string(),
});

const createVideoRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.number().min(1),
  views: z.number().min(0),
  tagIds: z.array(z.string()).optional(),
});

type Tag = {
  id: string;
  name: string;
  color: string;
};
type VideoItemResponse = {
  id: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  views: number;
  createdAt: string;
  tags: Tag[];
};

const flattenTags = (tags: { tag: Tag }[]): Tag[] => {
  return tags.map((tag) => tag.tag);
};

const getOrderBy = (sort: SortKey) => {
  switch (sort) {
    case SortKey.Newest:
      return desc(videos.createdAt);
    case SortKey.Oldest:
      return asc(videos.createdAt);
    case SortKey.MostViews:
      return desc(videos.views);
    case SortKey.LeastViews:
      return asc(videos.views);
  }
};

export const videoRouter = createTRPCRouter({
  getVideo: publicProcedure
    .input(getVideoByIdRequestSchema)
    .query(async ({ ctx, input }) => {
      const video = await ctx.db.query.videos.findFirst({
        where: eq(videos.id, input.id),
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });
      return video
        ? {
            id: video.id,
            thumbnailUrl: video.thumbnailUrl,
            title: video.title,
            duration: video.duration,
            views: video.views,
            createdAt: video.createdAt.toISOString(),
            tags: flattenTags(video.tags),
          }
        : null;
    }),
  listVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        sort: z.nativeEnum(SortKey),
        tagIds: z.array(z.string()).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }): Promise<VideoItemResponse[]> => {
      // Build where conditions
      const whereConditions = [];

      // Date filtering
      if (input.dateFrom) {
        whereConditions.push(gte(videos.createdAt, new Date(input.dateFrom)));
      }
      if (input.dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(input.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        whereConditions.push(lte(videos.createdAt, endDate));
      }

      let allVideos;

      if (input.tagIds && input.tagIds.length > 0) {
        // If filtering by tags, we need to join with videoTags
        const videosWithTags = await ctx.db
          .select({
            id: videos.id,
            title: videos.title,
            thumbnailUrl: videos.thumbnailUrl,
            duration: videos.duration,
            views: videos.views,
            createdAt: videos.createdAt,
          })
          .from(videos)
          .innerJoin(videoTags, eq(videos.id, videoTags.videoId))
          .where(
            and(
              inArray(videoTags.tagId, input.tagIds),
              ...(whereConditions.length > 0 ? [and(...whereConditions)] : []),
            ),
          )
          .groupBy(videos.id)
          .orderBy(getOrderBy(input.sort))
          .limit(input.limit ?? 10);

        // Get the full video data with tags for the filtered videos
        const videoIds = videosWithTags.map((v) => v.id);

        if (videoIds.length === 0) {
          return [];
        }

        allVideos = await ctx.db.query.videos.findMany({
          where: inArray(videos.id, videoIds),
          orderBy: getOrderBy(input.sort),
          with: {
            tags: {
              with: {
                tag: true,
              },
            },
          },
        });
      } else {
        // No tag filtering, just date filtering if provided
        allVideos = await ctx.db.query.videos.findMany({
          limit: input.limit ?? 10,
          orderBy: getOrderBy(input.sort),
          where:
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          with: {
            tags: {
              with: {
                tag: true,
              },
            },
          },
        });
      }

      return allVideos.map(
        (video): VideoItemResponse => ({
          id: video.id,
          thumbnailUrl: video.thumbnailUrl,
          title: video.title,
          duration: video.duration,
          views: video.views,
          createdAt: video.createdAt.toISOString(),
          tags: flattenTags(video.tags),
        }),
      );
    }),
  getVideoCount: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select({ count: count() }).from(videos);
    return result[0]?.count ?? 0;
  }),

  createVideo: publicProcedure
    .input(createVideoRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const videoId = crypto.randomUUID();

      // Get current video count for thumbnail URL
      const result = await ctx.db.select({ count: count() }).from(videos);
      const currentCount = result[0]?.count ?? 0;
      const nextVideoNumber = currentCount + 1;
      const thumbnailUrl = `https://picsum.photos/seed/video${nextVideoNumber}/300/200`;

      // Create the video with provided values
      await ctx.db.insert(videos).values({
        id: videoId,
        title: input.title,
        thumbnailUrl,
        duration: input.duration,
        views: input.views,
        createdAt: new Date(), // Current timestamp
      });

      // Add tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        await ctx.db.insert(videoTags).values(
          input.tagIds.map((tagId) => ({
            videoId,
            tagId,
          })),
        );
      }

      return { id: videoId };
    }),
});
