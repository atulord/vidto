"use client";

import { Eye } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { type Tag } from "~/shared/types";

export const VideoViewsBadge = ({ views }: { views: number }) => {
  return (
    <>
      <Eye size={12} />
      <span className="text-sm">{views} views</span>
    </>
  );
};

export const VideoTag = ({ tag }: { tag: Tag }) => {
  const color = tag.color.toLowerCase();
  return (
    <Badge variant="secondary" style={{ backgroundColor: color, opacity: 0.8 }}>
      <span className="text-white">{tag.name}</span>
    </Badge>
  );
};

export const VideoTagsList = ({ tags }: { tags: Tag[] }) => {
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
