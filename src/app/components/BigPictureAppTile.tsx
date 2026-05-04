import { useId } from "react";
import { cn } from "./ui/utils";

type Props = {
  className?: string;
};

/**
 * 32×32 BigPicture app tile — dark face + cyan ring (Figma export).
 * Clip path id is scoped so multiple tiles do not break each other.
 */
export function BigPictureAppTile({ className }: Props) {
  const clipId = useId().replace(/:/g, "");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M26.6671 0.400391H5.33372C2.60912 0.400391 0.400391 2.60912 0.400391 5.33372V26.6671C0.400391 29.3917 2.60912 31.6004 5.33372 31.6004H26.6671C29.3917 31.6004 31.6004 29.3917 31.6004 26.6671V5.33372C31.6004 2.60912 29.3917 0.400391 26.6671 0.400391Z"
          fill="#1C1B1C"
        />
        <path
          d="M26.6667 0.8C29.1662 0.8 31.2 2.83378 31.2 5.33333V26.6667C31.2 29.1662 29.1662 31.2 26.6667 31.2H5.33333C2.83378 31.2 0.8 29.1662 0.8 26.6667V5.33333C0.8 2.83378 2.83378 0.8 5.33333 0.8H26.6667ZM26.6667 0H5.33333C2.388 0 0 2.388 0 5.33333V26.6667C0 29.612 2.388 32 5.33333 32H26.6667C29.612 32 32 29.612 32 26.6667V5.33333C32 2.388 29.612 0 26.6667 0Z"
          fill="#03AAFE"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width={32} height={32} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
