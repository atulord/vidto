"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagMultiselectProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  placeholder?: string;
}

export function TagMultiselect({
  tags,
  selectedTagIds,
  onSelectionChange,
  placeholder = "Type to search tags...",
}: TagMultiselectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id));
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleTagSelect = (tagId: string) => {
    onSelectionChange([...selectedTagIds, tagId]);
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleTagRemove = (tagId: string) => {
    onSelectionChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchValue("");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]!.id);
      }
    } else if (
      e.key === "Backspace" &&
      searchValue === "" &&
      selectedTags.length > 0
    ) {
      handleTagRemove(selectedTags[selectedTags.length - 1]!.id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex min-h-9 w-full flex-wrap gap-1 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-gray-950",
          isOpen && "ring-1 ring-gray-950",
        )}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected Tags */}
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
            style={{ backgroundColor: tag.color, opacity: 0.8 }}
          >
            <span className="text-white">{tag.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleTagRemove(tag.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Input Field */}
        <div className="flex flex-1 items-center">
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedTags.length === 0 ? placeholder : ""}
            className="border-0 p-0 shadow-none focus-visible:ring-0"
          />
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => handleTagSelect(tag.id)}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchValue ? "No tags found" : "No more tags available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
