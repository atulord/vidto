import { sqliteTable, AnySQLiteColumn, index, integer, uniqueIndex, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const vidtoPost = sqliteTable("vidto_post", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text({ length: 256 }),
	createdAt: integer().default(sql`(unixepoch())`).notNull(),
	updatedAt: integer(),
},
(table) => [
	index("name_idx").on(table.name),
]);

export const vidtoTag = sqliteTable("vidto_tag", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	color: text().notNull(),
},
(table) => [
	uniqueIndex("vidto_tag_name_unique").on(table.name),
	index("tags_id_idx").on(table.id),
]);

export const vidtoVideoTags = sqliteTable("vidto_video_tags", {
	videoId: text("video_id").notNull(),
	tagId: text("tag_id").notNull(),
},
(table) => [
	index("video_tags_tag_id_idx").on(table.tagId),
	index("video_tags_video_id_idx").on(table.videoId),
]);

export const vidtoVideo = sqliteTable("vidto_video", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	thumbnailUrl: text("thumbnail_url").notNull(),
	duration: integer().notNull(),
	views: integer().default(0).notNull(),
	createdAt: integer().default(sql`(unixepoch())`).notNull(),
	updatedAt: integer(),
},
(table) => [
	index("video_id_idx").on(table.id),
]);

