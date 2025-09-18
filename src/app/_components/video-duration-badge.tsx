"use client";

import { formatDuration } from "~/lib/utils";

export const VideoDurationBadge = ({ duration }: { duration: number }) => {
  return (
    <div className="absolute right-2 bottom-2 rounded-md bg-black/50 p-2 text-white">
      <p>{formatDuration(duration)}</p>
    </div>
  );
};
