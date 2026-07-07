import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG } from "@/lib/constants";
import type { Platform } from "@/lib/types";

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
