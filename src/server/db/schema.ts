// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `vidto_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const videos = createTable(
  "video",
  (d) => ({
    id: d.text("id").primaryKey(),
    title: d.text("title").notNull(),
    thumbnailUrl: d.text("thumbnail_url").notNull(),
    duration: d.integer("duration").notNull(),
    views: d.integer("views").notNull().default(0),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("video_id_idx").on(t.id)],
);

export const tags = createTable(
  "tag",
  (d) => ({
    id: d.text("id").primaryKey(),
    name: d.text("name").notNull().unique(),
    color: d.text("color").notNull(),
  }),
  (t) => [index("tags_id_idx").on(t.id)], // Changed name
);

export const videoTags = createTable(
  "video_tags",
  (d) => ({
    videoId: d.text("video_id").notNull(),
    tagId: d.text("tag_id").notNull(),
  }),
  (t) => [
    index("video_tags_video_id_idx").on(t.videoId), // More specific name
    index("video_tags_tag_id_idx").on(t.tagId), // More specific name
  ],
);

export const videoRelations = relations(videos, ({ many }) => ({
  tags: many(videoTags),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  videos: many(videoTags),
}));

export const videoTagRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, { fields: [videoTags.videoId], references: [videos.id] }),
  tag: one(tags, { fields: [videoTags.tagId], references: [tags.id] }),
}));
