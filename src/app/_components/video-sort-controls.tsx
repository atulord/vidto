"use client";

import { ChevronDownIcon, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SortKey } from "~/shared/types";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from "~/components/ui/dropdown-menu";

interface VideoSortControlsProps {
  sort: SortKey;
  onSortChange: (value: string) => void;
}

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

export function VideoSortControls({
  sort,
  onSortChange,
}: VideoSortControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          Sort by {getSortLabel(sort).toLowerCase()}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
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
  );
}
