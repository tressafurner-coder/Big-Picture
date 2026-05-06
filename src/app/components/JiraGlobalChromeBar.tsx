import * as React from "react";
import {
  Bell,
  ChevronLeft,
  Grid3x3,
  HelpCircle,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "./ui/utils";

export type AtlassianTopBarProps = {
  isNavCollapsed: boolean;
  onToggleNav: () => void;
};

/** Jira / ADS-aligned top bar layout (prototype). */
export function AtlassianTopBar({
  isNavCollapsed,
  onToggleNav,
}: AtlassianTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[200] flex h-12 w-full shrink-0 items-center gap-4 border-b bg-white",
        "border-[#DFE1E6]",
      )}
    >
      <div className="flex h-full w-[240px] shrink-0 items-center gap-2 border-r border-[#DFE1E6] px-3">
        <button
          type="button"
          className="rounded-[3px] p-1 text-[#44546F] transition-colors hover:bg-[#EBECF0]"
          aria-label="Switch apps"
        >
          <Grid3x3 className="size-5" strokeWidth={2} aria-hidden />
        </button>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-6 items-center justify-center rounded-[3px] bg-[rgb(24,104,219)]">
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              className="text-white"
              aria-hidden
            >
              <path
                d="M2 2h5.5v5.5H2V2zm0 6.5h5.5V14H2V8.5zM8.5 2H14v5.5H8.5V2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold leading-5 text-[#172B4D]">
            Jira
          </span>
        </div>
        <button
          type="button"
          className="rounded-[3px] p-1 text-[#44546F] transition-colors hover:bg-[#EBECF0]"
          onClick={onToggleNav}
          aria-label={isNavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              isNavCollapsed && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>

      <div className="relative min-w-0 max-w-[400px] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#626F86]"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search"
          className={cn(
            "h-8 w-full rounded-[3px] border border-[#DFE1E6] bg-white pl-8 pr-3 text-sm leading-5 text-[#172B4D]",
            "placeholder:text-[#626F86]",
            "transition-[border-color,box-shadow] focus:border-[#0C66E4] focus:outline-none focus:ring-2 focus:ring-[#0C66E4]/20",
          )}
        />
      </div>

      <button
        type="button"
        className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-[3px] bg-[rgb(24,104,219)] px-2.5 text-sm font-medium leading-5 text-white hover:bg-[rgb(21,88,188)] active:bg-[rgb(0,87,217)]"
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden />
        Create
      </button>

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-0.5 pr-3">
        <button
          type="button"
          className="relative flex size-8 items-center justify-center rounded-[3px] text-[#44546F] transition-colors hover:bg-[#EBECF0] active:bg-[#DFE1E6]"
          aria-label="Notifications"
        >
          <Bell className="size-5" strokeWidth={2} aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#DE350B] px-[5px] text-[10px] font-bold leading-none text-white">
            9+
          </span>
        </button>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-[3px] text-[#44546F] transition-colors hover:bg-[#EBECF0] active:bg-[#DFE1E6]"
          aria-label="Help"
        >
          <HelpCircle className="size-5" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-[3px] text-[#44546F] transition-colors hover:bg-[#EBECF0] active:bg-[#DFE1E6]"
          aria-label="Settings"
        >
          <Settings className="size-5" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="ml-1 flex size-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-200 via-rose-100 to-amber-100 ring-2 ring-white hover:opacity-95"
          aria-label="User profile"
        >
          <span className="text-[11px] font-semibold text-[#42526E]">K</span>
        </button>
      </div>
    </header>
  );
}

export type JiraGlobalChromeBarProps = Partial<AtlassianTopBarProps>;

/**
 * Sticky Jira-style chrome for prototypes — uses {@link AtlassianTopBar}.
 * Omit props to keep sidebar-toggle state internally (chevron only).
 */
export function JiraGlobalChromeBar({
  isNavCollapsed: isNavCollapsedProp,
  onToggleNav: onToggleNavProp,
}: JiraGlobalChromeBarProps = {}) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const isNavCollapsed = isNavCollapsedProp ?? internalCollapsed;
  const onToggleNav =
    onToggleNavProp ?? (() => setInternalCollapsed((c) => !c));

  return (
    <AtlassianTopBar
      isNavCollapsed={isNavCollapsed}
      onToggleNav={onToggleNav}
    />
  );
}
