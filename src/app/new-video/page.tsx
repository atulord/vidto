"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { TagMultiselect } from "~/components/ui/tag-multiselect";
import { api } from "~/trpc/react";

// Helper function to generate random values
const generateRandomValues = () => ({
  views: Math.floor(Math.random() * 10000), // 0 to 9,999 views
  duration: Math.floor(Math.random() * 3600) + 30, // 30 seconds to 1 hour
});

// Helper function to format duration for display
const formatDurationInput = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to validate and parse duration from input
const validateAndParseDuration = (
  input: string,
): { isValid: boolean; duration: number; error?: string } => {
  if (!input.trim()) {
    return { isValid: false, duration: 0, error: "Duration is required" };
  }

  // Check for invalid characters (only allow digits, colons, and spaces)
  if (!/^[\d:\s]+$/.test(input.trim())) {
    return {
      isValid: false,
      duration: 0,
      error: "Duration can only contain numbers and colons (:)",
    };
  }

  const parts = input
    .trim()
    .split(":")
    .map((part) => {
      const num = parseInt(part, 10);
      return isNaN(num) ? -1 : num;
    });

  // Check if any part is invalid (NaN would be -1 from above)
  if (parts.some((part) => part < 0)) {
    return { isValid: false, duration: 0, error: "Invalid duration format" };
  }

  let totalSeconds = 0;

  if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    if (minutes! >= 0 && seconds! >= 0 && seconds! < 60) {
      totalSeconds = minutes! * 60 + seconds!;
    } else {
      return {
        isValid: false,
        duration: 0,
        error: "Invalid MM:SS format (seconds must be 0-59)",
      };
    }
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    if (
      hours! >= 0 &&
      minutes! >= 0 &&
      minutes! < 60 &&
      seconds! >= 0 &&
      seconds! < 60
    ) {
      totalSeconds = hours! * 3600 + minutes! * 60 + seconds!;
    } else {
      return {
        isValid: false,
        duration: 0,
        error: "Invalid HH:MM:SS format (minutes and seconds must be 0-59)",
      };
    }
  } else {
    return {
      isValid: false,
      duration: 0,
      error: "Use MM:SS or HH:MM:SS format",
    };
  }

  if (totalSeconds <= 0) {
    return {
      isValid: false,
      duration: 0,
      error: "Duration must be greater than 0",
    };
  }

  return { isValid: true, duration: totalSeconds };
};

// Helper function to parse duration from input (simplified for real-time updates)
const parseDurationInput = (input: string): number => {
  const parts = input.split(":").map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0]! * 60 + parts[1]!;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  }
  return 0;
};

export default function CreateVideoPage() {
  const [title, setTitle] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Initialize with random values
  const [randomValues] = useState(() => generateRandomValues());
  const [views, setViews] = useState(randomValues.views);
  const [duration, setDuration] = useState(randomValues.duration);
  const [durationInput, setDurationInput] = useState(() =>
    formatDurationInput(randomValues.duration),
  );

  const router = useRouter();

  const { data: tags = [] } = api.tag.listTags.useQuery();
  const { data: videoCount = 0, isLoading: isVideoCountLoading } =
    api.video.getVideoCount.useQuery();
  const createVideoMutation = api.video.createVideo.useMutation();

  // Generate thumbnail URL based on current video count + 1
  const thumbnailUrl = useMemo(() => {
    if (isVideoCountLoading) {
      return "";
    }
    const nextVideoNumber = videoCount + 1;
    setImageLoading(true); // Show skeleton when URL changes
    return `https://picsum.photos/seed/video${nextVideoNumber}/300/200`;
  }, [videoCount, isVideoCountLoading]);

  const handleDurationChange = (value: string) => {
    setDurationInput(value);
    const parsedDuration = parseDurationInput(value);
    if (parsedDuration > 0) {
      setDuration(parsedDuration);
    }
  };

  const handleViewsChange = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      toast.error("Views must be a valid number");
      return;
    }
    if (numValue < 0) {
      toast.error("Views cannot be negative");
      return;
    }
    setViews(numValue);
  };

  const validateForm = () => {
    // Validate title
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters long");
      return false;
    }

    if (title.trim().length > 200) {
      toast.error("Title cannot exceed 200 characters");
      return false;
    }

    // Validate duration
    const durationResult = validateAndParseDuration(durationInput);
    if (!durationResult.isValid) {
      toast.error(durationResult.error ?? "Invalid duration");
      return false;
    }

    // Validate views
    if (views < 0) {
      toast.error("Views cannot be negative");
      return false;
    }

    if (!Number.isInteger(views)) {
      toast.error("Views must be a whole number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run all validations
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const durationResult = validateAndParseDuration(durationInput);

      await createVideoMutation.mutateAsync({
        title: title.trim(),
        duration: durationResult.duration,
        views,
        tagIds: selectedTagIds,
      });

      toast.success("Video created successfully!");
      // Redirect to home page after successful creation
      router.push("/");
    } catch (error) {
      console.error("Failed to create video:", error);

      // Handle specific API errors
      if (error instanceof Error) {
        toast.error(`Failed to create video: ${error.message}`);
      } else {
        toast.error("Failed to create video. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center pt-20">
      <div className="container max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Create New Video</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side - Thumbnail Preview */}
          <div className="space-y-4">
            <Label>Thumbnail Preview</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              {(imageLoading || isVideoCountLoading || !thumbnailUrl) && (
                <Skeleton className="absolute inset-0 z-10" />
              )}
              {thumbnailUrl && (
                <Image
                  src={thumbnailUrl}
                  alt="Video thumbnail preview"
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter video title"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {title.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="text"
                  value={durationInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDurationChange(e.target.value)
                  }
                  placeholder="MM:SS or HH:MM:SS"
                />
                <p className="text-xs text-gray-500">
                  Format: MM:SS or HH:MM:SS (e.g., 2:30 or 1:45:30)
                </p>
              </div>

              {/* Views Input */}
              <div className="space-y-2">
                <Label htmlFor="views">Views</Label>
                <Input
                  id="views"
                  type="number"
                  value={views}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleViewsChange(e.target.value)
                  }
                  min="0"
                  step="1"
                />
              </div>

              {/* Tags Selection */}
              <div className="space-y-2">
                <Label>Tags (optional)</Label>
                <TagMultiselect
                  tags={tags}
                  selectedTagIds={selectedTagIds}
                  onSelectionChange={setSelectedTagIds}
                  placeholder="Type to search and select tags..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Video"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
