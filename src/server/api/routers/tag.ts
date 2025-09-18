import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  listTags: publicProcedure.query(async ({ ctx }) => {
    const allTags = await ctx.db.query.tags.findMany({
      orderBy: (tags, { asc }) => [asc(tags.name)],
    });

    return allTags;
  }),
});
