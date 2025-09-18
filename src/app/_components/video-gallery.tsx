"use client";

import { type VideoItem } from "~/shared/types";
import { VideoCard } from "./video-card";

export function VideoGallery({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid w-full grid-cols-1 items-center justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
