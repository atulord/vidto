"use client";

import { SortKey, type Tag, type VideoItem } from "~/shared/types";

import { ChevronDownIcon, Eye, Check } from "lucide-react";
import { formatCreatedAt, formatDuration } from "~/lib/utils";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { useEffect, useState } from "react";
import { useVideosQuery } from "~/queries/video-queries";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { videos } from "../server/db/schema";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from "~/components/ui/dropdown-menu";

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
    <div className="absolute right-2 bottom-2 rounded-md bg-black/50 p-2 text-white">
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
      {tags.length > 2 && (
        <p className="text-[12px]">+ {tags.length - 2} more</p>
      )}
    </div>
  );
};
const VideoCard = ({ video }: { video: VideoItem }) => {
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

function VideoGallery({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid w-full grid-cols-1 items-center justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export default function Home() {
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<SortKey>(SortKey.Newest);
  
  const {
    data: videos,
    isLoading,
    isError,
  } = api.video.listVideos.useQuery(
    { limit, sort },
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const getSortLabel = (sortKey: SortKey) => {
    switch (sortKey) {
      case SortKey.Newest:
        return "Newest to Oldest";
      case SortKey.Oldest:
        return "Oldest to Newest";
      case SortKey.MostViews:
        return "Most to Least Views";
      case SortKey.LeastViews:
        return "Least to Most Views";
    }
  };

  const handleSortChange = (value: string) => {
    setSort(value as SortKey);
    setLimit(10); 
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        setLimit((prev) => prev + 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center text-black">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort by {getSortLabel(sort).toLowerCase()}
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={handleSortChange}
              >
                <DropdownMenuLabel>Date Created</DropdownMenuLabel>
                <DropdownMenuRadioItem
                  value={SortKey.Newest}
                  className="flex items-center gap-2"
                >
                  Newest to Oldest
                  {sort === SortKey.Newest && <Check className="size-4" />}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value={SortKey.Oldest}
                  className="flex items-center gap-2"
                >
                  Oldest to Newest
                  {sort === SortKey.Oldest && <Check className="size-4" />}
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Views</DropdownMenuLabel>
                <DropdownMenuRadioItem
                  value={SortKey.MostViews}
                  className="flex items-center gap-2"
                >
                  Most to Least Views
                  {sort === SortKey.MostViews && <Check className="size-4" />}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value={SortKey.LeastViews}
                  className="flex items-center gap-2"
                >
                  Least to Most Views
                  {sort === SortKey.LeastViews && <Check className="size-4" />}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-full border-b border-gray-200"></div>
          <VideoGallery videos={videos ?? []} />
          {isLoading && limit > 10 && (
            <div className="flex items-center gap-2">
              <p>Loading more...</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
