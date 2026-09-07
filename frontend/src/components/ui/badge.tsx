import { useState } from "react";
import type { HTMLAttributes } from "react";
import { cn, initials } from "@/lib/utils";

export function Badge({
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
      {...rest}
    />
  );
}

const avatarPalette = [
  "bg-primary/15 text-primary dark:bg-primary/20",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return avatarPalette[Math.abs(hash) % avatarPalette.length]!;
}

const avatarSizes = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-16 w-16 text-xl",
} as const;

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string | null;
  src?: string | null;
  size?: keyof typeof avatarSizes;
}

export function Avatar({ name, src, size = "md", className, ...rest }: AvatarProps) {
  // Image can fail (blocked by extensions, dead URL, offline) — fall back to
  // initials instead of the browser's broken-image icon.
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src) && !imgFailed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        avatarSizes[size],
        name ? colorFor(name) : "bg-muted text-muted-foreground",
        className
      )}
      {...rest}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name ?? ""}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
