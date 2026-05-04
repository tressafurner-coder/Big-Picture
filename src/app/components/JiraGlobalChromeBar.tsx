import {
  Bell,
  CircleHelp,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "./ui/utils";

/** Icon-only controls: 16px icon inside a 32×32 hit target (Jira chrome). */
const iconBtn =
  "flex size-8 shrink-0 items-center justify-center rounded-[3px] text-[#42526E] hover:bg-[#F4F5F7] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30";

/** Jira-style sidebar rail: rounded frame, divider on the right, chevron in the main pane. */
function JiraSidebarRailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        stroke="currentColor"
        strokeWidth={1.75}
      />
      <line
        x1="15.5"
        y1="5.5"
        x2="15.5"
        y2="18.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <path
        d="M8 9l4.25 3.5L8 16"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Atlassian-style app switcher: 2×2 grid of rounded outline squares. */
function JiraAppSwitcherIcon({ className }: { className?: string }) {
  const cell = {
    w: 8,
    h: 8,
    r: 1.75,
    sw: 1.75,
  } as const;
  const gap = 2;
  const x0 = 3;
  const y0 = 3;
  const x1 = x0 + cell.w + gap;
  const y1 = y0 + cell.h + gap;

  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x={x0}
        y={y0}
        width={cell.w}
        height={cell.h}
        rx={cell.r}
        stroke="currentColor"
        strokeWidth={cell.sw}
      />
      <rect
        x={x1}
        y={y0}
        width={cell.w}
        height={cell.h}
        rx={cell.r}
        stroke="currentColor"
        strokeWidth={cell.sw}
      />
      <rect
        x={x0}
        y={y1}
        width={cell.w}
        height={cell.h}
        rx={cell.r}
        stroke="currentColor"
        strokeWidth={cell.sw}
      />
      <rect
        x={x1}
        y={y1}
        width={cell.w}
        height={cell.h}
        rx={cell.r}
        stroke="currentColor"
        strokeWidth={cell.sw}
      />
    </svg>
  );
}

function JiraLogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-[3px] bg-[#0052CC]",
        className,
      )}
      aria-hidden
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        className="block"
      >
        <path
          fill="var(--icon-color, white)"
          d="M9.051 15.434H7.734c-1.988 0-3.413-1.218-3.413-3h7.085c.367 0 .605.26.605.63v7.13c-1.772 0-2.96-1.435-2.96-3.434zm3.5-3.543h-1.318c-1.987 0-3.413-1.196-3.413-2.978h7.085c.367 0 .627.239.627.608v7.13c-1.772 0-2.981-1.435-2.981-3.434zm3.52-3.522h-1.317c-1.987 0-3.413-1.217-3.413-3h7.085c.367 0 .605.262.605.61v7.129c-1.771 0-2.96-1.435-2.96-3.434z"
        />
      </svg>
    </span>
  );
}

/**
 * Jira product chrome (prototype) — stays visible at the top of the viewport.
 */
export function JiraGlobalChromeBar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-[200] flex h-14 w-full shrink-0 items-center gap-2 border-b bg-white px-3 md:gap-3 md:px-4",
        "border-[#DFE1E6]",
      )}
    >
      {/* Left: sidebar, app switcher, Jira mark */}
      <div className="flex min-w-0 shrink-0 items-center gap-0.5 md:gap-1">
        <button type="button" className={iconBtn} aria-label="Collapse sidebar">
          <JiraSidebarRailIcon className="shrink-0" />
        </button>
        <button type="button" className={iconBtn} aria-label="Switch apps">
          <JiraAppSwitcherIcon className="shrink-0" />
        </button>
        <JiraLogoMark className="ml-1 md:ml-2" />
      </div>

      {/* Center: search + Create (grouped next to each other) */}
      <div className="mx-auto flex min-w-0 flex-1 items-center justify-center px-2">
        <div className="flex w-full max-w-3xl min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[3px] border bg-white px-2.5",
              "border-[#DFE1E6]",
            )}
          >
            <Search className="size-4 shrink-0 text-[#626F86]" aria-hidden />
            <span className="text-sm text-[#626F86]">Search</span>
          </div>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[3px] bg-[#0052CC] px-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] sm:px-3"
            aria-label="Create"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
        <button
          type="button"
          className={cn(iconBtn, "relative")}
          aria-label="Notifications, 9 or more unread"
        >
          <Bell className="size-4" strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#DE350B] px-1 text-[10px] font-bold leading-none text-white">
            9+
          </span>
        </button>
        <button type="button" className={iconBtn} aria-label="Help">
          <CircleHelp className="size-4" strokeWidth={2} />
        </button>
        <button type="button" className={iconBtn} aria-label="Settings">
          <Settings className="size-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#DFE1E6] text-[#42526E] hover:bg-[#EBECF0] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30"
          aria-label="Your profile"
        >
          <UserRound className="size-4" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
