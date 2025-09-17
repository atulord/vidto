CREATE TABLE `vidto_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `vidto_post` (`name`);--> statement-breakpoint
CREATE TABLE `vidto_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tags_id_idx` ON `vidto_tag` (`id`);--> statement-breakpoint
CREATE TABLE `vidto_video_tags` (
	`video_id` text NOT NULL,
	`tag_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `video_tags_video_id_idx` ON `vidto_video_tags` (`video_id`);--> statement-breakpoint
CREATE INDEX `video_tags_tag_id_idx` ON `vidto_video_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `vidto_video` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`thumbnail_url` text NOT NULL,
	`duration` integer NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `video_id_idx` ON `vidto_video` (`id`);