import { api, HydrateClient } from "~/trpc/server";
import type { Tag, VideoItem } from "~/shared/types";


import { Eye } from "lucide-react";
import { formatCreatedAt, formatDuration } from "~/lib/utils";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";


const VideoPreview = ({ video }: { video: VideoItem }) => {
  return (
    <div className="w-full relative ">
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        width={300}
        height={300}
        className="w-full object-cover rounded-xl"
      />
      <VideoDurationBadge duration={video.duration} />
    </div>
  );
};

const VideoViewsBadge = ({ views }: { views: number }) => {
  return (
    <>
      <Eye size={12} />
      <span className="text-sm">{views} views</span>
    </>
  );
};


const VideoTag = ({ tag }: { tag: Tag }) => {
  const color = tag.color.toLowerCase();
  return (
    <Badge variant="secondary" style={{ backgroundColor: color, opacity: 0.8 }}>
      <span className="text-white">{tag.name}</span>
    </Badge>
  );
};
const VideoDurationBadge = ({ duration }: { duration: number }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-md">
      <p>{formatDuration(duration)}</p>
    </div>
  );
};

const VideoTagsList = ({ tags }: { tags: Tag[] }) => {
  return (
    <div className="flex items-center gap-2">
      {tags.slice(0, 2).map((tag) => (
        <VideoTag key={tag.id} tag={tag} />
      ))}
      {tags.length > 2 && <p className="text-[12px]">+ {tags.length - 2} more</p>}
    </div>
  );
};
const VideoCard = async ({ video }: { video: VideoItem }) => {
  const truncatedTitle =
    video.title.length > 120 ? video.title.slice(0, 120) + "..." : video.title;
  return (
    <div className="flex flex-col gap-2">
      <VideoPreview video={video} />
      <p className="text-lg font-bold h-12">
        {truncatedTitle}
      </p>
      <div className="flex items-center gap-2 ">
        <VideoViewsBadge views={video.views} />
      </div>
      <p className="text-sm">{formatCreatedAt(video.createdAt)}</p>
      <VideoTagsList tags={video.tags} />
    </div>
  );
};


async function VideoGallery({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full items-center justify-center">
    {videos.map((video) => (
      <VideoCard key={video.id} video={video} />
    ))}
  </div>
  );
}
export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const videos = await api.video.listVideos();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center text-black">
        <div className="container flex flex-col items-center  gap-12 px-4 py-16">
          <VideoGallery videos={videos} />
        </div>
      </main>
    </HydrateClient>
  );
}
