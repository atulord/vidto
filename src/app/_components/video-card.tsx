"use client";

import { type VideoItem } from "~/shared/types";
import { formatCreatedAt } from "~/lib/utils";
import Image from "next/image";
import { VideoViewsBadge, VideoTagsList } from "./video-metadata";
import { VideoDurationBadge } from "./video-duration-badge";

const VideoPreview = ({ video }: { video: VideoItem }) => {
  return (
    <div className="relative w-full">
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        width={300}
        height={300}
        className="w-full rounded-xl object-cover"
      />
      <VideoDurationBadge duration={video.duration} />
    </div>
  );
};

export const VideoCard = ({ video }: { video: VideoItem }) => {
  const truncatedTitle =
    video.title.length > 120 ? video.title.slice(0, 120) + "..." : video.title;

  return (
    <div className="flex flex-col gap-2">
      <VideoPreview video={video} />
      <p className="h-12 text-lg font-bold">{truncatedTitle}</p>
      <div className="flex items-center gap-2">
        <VideoViewsBadge views={video.views} />
      </div>
      <p className="text-sm">{formatCreatedAt(video.createdAt)}</p>
      <VideoTagsList tags={video.tags} />
    </div>
  );
};
