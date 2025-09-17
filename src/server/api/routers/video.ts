import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { videos } from "~/server/db/schema";

const getVideoByIdRequestSchema = z.object({
  id: z.string(),
});

type Tag = {
  id: string;
  name: string;
  color: string;
};
type VideoItemResponse = {
  id: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  createdAt: string;
  tags: Tag[];
};

const flattenTags = (tags: { tag: Tag }[]): Tag[] => {
  return tags.map((tag) => tag.tag);
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
            duration: video.duration,
            views: video.views,
            createdAt: video.createdAt.toISOString(),
            tags: flattenTags(video.tags),
          }
        : null;
    }),
  listVideos: publicProcedure.query(
    async ({ ctx }): Promise<VideoItemResponse[]> => {
      const allVideos = await ctx.db.query.videos.findMany({
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      return allVideos.map(
        (video): VideoItemResponse => ({
          id: video.id,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          views: video.views,
          createdAt: video.createdAt.toISOString(),
          tags: flattenTags(video.tags),
        }),
      );
    },
  ),
});
