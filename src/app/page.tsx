"use client";

import { SortKey, type VideoFilters } from "~/shared/types";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { VideoGallery } from "./_components/video-gallery";
import { VideoSortControls } from "./_components/video-sort-controls";
import { VideoFilterControls } from "./_components/video-filter-controls";

export default function Home() {
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<SortKey>(SortKey.Newest);
  const [filters, setFilters] = useState<VideoFilters>({
    tagIds: [],
    dateRange: { from: undefined, to: undefined },
  });

  const { data: videos, isLoading } = api.video.listVideos.useQuery(
    {
      limit,
      sort,
      tagIds: filters.tagIds.length > 0 ? filters.tagIds : undefined,
      dateFrom: filters.dateRange.from?.toISOString(),
      dateTo: filters.dateRange.to?.toISOString(),
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const handleSortChange = (value: string) => {
    setSort(value as SortKey);
    setLimit(10);
  };

  const handleFiltersChange = (newFilters: VideoFilters) => {
    setFilters(newFilters);
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
      <main className="flex min-h-screen flex-col items-center bg-zinc-300/50 text-black">
        <div className="container flex flex-col items-center gap-12 px-4 py-20">
          <div className="flex w-full justify-end gap-4">
            <VideoFilterControls
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
            <VideoSortControls sort={sort} onSortChange={handleSortChange} />
          </div>
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
