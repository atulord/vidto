"use client";

import { useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { TagMultiselect } from "~/components/ui/tag-multiselect";
import { Calendar as CalendarComponent } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { type VideoFilters } from "~/shared/types";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

interface VideoFilterControlsProps {
  filters: VideoFilters;
  onFiltersChange: (filters: VideoFilters) => void;
}

export function VideoFilterControls({
  filters,
  onFiltersChange,
}: VideoFilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Fetch all available tags
  const { data: allTags = [] } = api.tag.listTags.useQuery();

  const handleTagChange = (tagIds: string[]) => {
    onFiltersChange({
      ...filters,
      tagIds,
    });
  };

  const handleDateRangeChange = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      tagIds: [],
      dateRange: { from: undefined, to: undefined },
    });
  };

  const selectedTags = allTags.filter((tag) => filters.tagIds.includes(tag.id));
  const hasActiveFilters =
    filters.tagIds.length > 0
      ? (filters.dateRange.from ?? filters.dateRange.to)
      : false;

  const formatDateRange = () => {
    if (!filters.dateRange.from) return "Pick a date range";
    if (!filters.dateRange.to) return format(filters.dateRange.from, "PPP");
    return `${format(filters.dateRange.from, "PPP")} - ${format(filters.dateRange.to, "PPP")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2",
            hasActiveFilters && "border-primary text-primary",
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filters.tagIds.length + (filters.dateRange.from ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Videos</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagMultiselect
              tags={allTags}
              selectedTagIds={filters.tagIds}
              onSelectionChange={handleTagChange}
              placeholder="Select tags to filter by..."
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => {
                    handleDateRangeChange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
                <div className="border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDateRangeChange({ from: undefined, to: undefined });
                      setDatePickerOpen(false);
                    }}
                    className="w-full"
                  >
                    Clear dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ backgroundColor: tag.color, opacity: 0.8 }}
                  >
                    <span className="text-white">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 p-0 text-white hover:bg-white/20"
                      onClick={() => {
                        handleTagChange(
                          filters.tagIds.filter((id) => id !== tag.id),
                        );
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
                {filters.dateRange.from && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {filters.dateRange.to
                        ? `${format(filters.dateRange.from, "MMM dd")} - ${format(filters.dateRange.to, "MMM dd")}`
                        : format(filters.dateRange.from, "MMM dd, yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 p-0 hover:bg-gray-200"
                      onClick={() => {
                        handleDateRangeChange({
                          from: undefined,
                          to: undefined,
                        });
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
