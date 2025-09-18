"use client";

import { Home, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";

export function FloatingActionBar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md">
        <Button
          variant={pathname === "/" ? "default" : "ghost"}
          size="icon"
          asChild
          className="h-10 w-10 rounded-full"
        >
          <Link href="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant={pathname === "/new-video" ? "default" : "ghost"}
          size="icon"
          asChild
          className="h-10 w-10 rounded-full"
        >
          <Link href="/new-video">
            <Plus className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
