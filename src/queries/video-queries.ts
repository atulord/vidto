import { api, type RouterInputs } from "~/trpc/react";
import { SortKey } from "~/shared/types";

export const useVideosQuery = ({ limit, sort }: { limit: number, sort: SortKey }) => {
  return api.video.listVideos.useQuery(
    { limit, sort },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  );
};
