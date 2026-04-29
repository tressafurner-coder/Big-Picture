import { XIcon } from "lucide-react";
import { cn } from "./ui/utils";

type Props = {
  /** Visible label */
  children: string;
  /** Called when the dismiss control is activated */
  onRemove: () => void;
  className?: string;
};

/**
 * Neutral removable tag aligned with Atlaskit / BigPicture defaults:
 * compact height (~24px), radius 3px, neutral fill, inline remove without a vertical rule.
 */
export function BigPictureTag({
  children,
  onRemove,
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-h-6 items-stretch overflow-hidden rounded-[3px] bg-[#EBECF0] text-[12px] font-normal leading-none text-[#172B4D]",
        "hover:bg-[#DFE1E6]",
        className,
      )}
    >
      <span className="flex min-w-0 items-center truncate px-2">{children}</span>
      <button
        type="button"
        className={cn(
          "inline-flex shrink-0 items-center justify-center px-1 text-[#626F86]",
          "rounded-none hover:bg-[rgba(9,30,66,0.08)] hover:text-[#172B4D]",
          "focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/35",
        )}
        aria-label={`Remove ${children}`}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <XIcon className="size-3" strokeWidth={2} aria-hidden />
      </button>
    </span>
  );
}
