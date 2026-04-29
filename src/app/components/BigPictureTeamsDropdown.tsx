import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BigPictureTag } from "./BigPictureTag";
import { buttonVariants } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "./ui/utils";

/** Reference-style row variants (BigPicture / Atlaskit multi-select). */
export type TeamListItem =
  | { type: "simple"; id: string; label: string }
  | { type: "team"; id: string; name: string }
  | { type: "user"; id: string; name: string };

export type TeamGroup = {
  title: string;
  items: TeamListItem[];
};

/** Pass as `groups` when there are no teams configured (empty-state demo / production). */
export const EMPTY_TEAM_GROUPS: TeamGroup[] = [];

const DEFAULT_GROUPS: TeamGroup[] = [
  {
    title: "Global teams",
    items: [
      { type: "team", id: "t1", name: "Portfolio Delivery Guild" },
      { type: "team", id: "t2", name: "Program Increment Core" },
      { type: "team", id: "t3", name: "Release Train Engineers" },
      { type: "team", id: "t4", name: "Solution Architects Guild" },
      { type: "team", id: "t5", name: "Cross-Functional Alpha Squad" },
    ],
  },
];

function itemMatchesQuery(item: TeamListItem, q: string): boolean {
  if (!q) return true;
  const s = q.toLowerCase();
  if (item.type === "simple") return item.label.toLowerCase().includes(s);
  if (item.type === "team") return item.name.toLowerCase().includes(s);
  return item.name.toLowerCase().includes(s);
}

function flattenVisibleIds(groups: TeamGroup[]): string[] {
  return groups.flatMap((g) => g.items.map((i) => i.id));
}

function itemLabel(item: TeamListItem): string {
  if (item.type === "simple") return item.label;
  return item.name;
}

type Props = {
  groups?: TeamGroup[];
  globalTeamsTo?: string;
  className?: string;
  /** Shown in the list area when `groups` contains no items (no teams configured). */
  emptyMessage?: string;
  /** Open the menu as soon as this instance mounts (e.g. table “+ add teams”). */
  defaultMenuOpen?: boolean;
  /** Controlled open state for the dropdown menu. */
  open?: boolean;
  /** Controlled open-state callback for the dropdown menu. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Until at least one team is selected, shrink the trigger to an invisible 8×8 hit-area so a sibling “+” can stay visible (table rows).
   */
  compactTriggerUntilSelection?: boolean;
  /** Extra classes on the menu trigger (after defaults). */
  triggerClassName?: string;
  /** Controlled selection */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (ids: string[]) => void;
};

const checkboxClass =
  "size-4 shrink-0 rounded-[3px] border-[#C1C7D0] bg-white data-[state=checked]:border-[#0C66E4] data-[state=checked]:bg-[#0C66E4] data-[state=checked]:text-white";

const DEFAULT_EMPTY_MESSAGE = "No teams added yet.";

const TAG_GAP_PX = 6;

/** Renders selected tags in one row; chips that do not fit are folded into a trailing “+N”. */
function TriggerSelectedTags({
  selectedIds,
  idToLabel,
  onRemove,
  bare = false,
}: {
  selectedIds: string[];
  idToLabel: Map<string, string>;
  onRemove: (id: string) => void;
  /** Table cell: chips read as plain inline values (no gray fills). */
  bare?: boolean;
}) {
  const selectionSignature = selectedIds.join("\0");

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [chipWidths, setChipWidths] = useState<number[]>([]);
  const [layout, setLayout] = useState<{ show: number; overflow: number }>(
    () => ({ show: selectedIds.length, overflow: 0 }),
  );

  useLayoutEffect(() => {
    const row = measureRef.current;
    if (!row) return;
    const children = Array.from(row.children) as HTMLElement[];
    const next = children.map((c) =>
      Math.ceil(c.getBoundingClientRect().width),
    );
    setChipWidths((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i])
        ? prev
        : next,
    );
  }, [selectionSignature]);

  const estimateOverflowPillWidth = useCallback((overflow: number) => {
    // Mirrors trailing “+N” pill (padding + tabular digits); avoids mis-layout when many hidden.
    const t = `+${overflow}`;
    return Math.ceil(16 + t.length * 7);
  }, []);

  const recomputeLayout = useCallback(() => {
    const container = rowRef.current;
    const n = chipWidths.length;
    if (!container) return;
    if (n !== selectedIds.length) return;
    if (n === 0) {
      setLayout({ show: 0, overflow: 0 });
      return;
    }

    const maxW = container.clientWidth;
    if (maxW <= 0) return;

    for (let show = n; show >= 0; show--) {
      const overflow = n - show;
      let w = 0;
      for (let i = 0; i < show; i++) {
        w += chipWidths[i] + (i > 0 ? TAG_GAP_PX : 0);
      }
      if (overflow > 0) {
        w += TAG_GAP_PX + estimateOverflowPillWidth(overflow);
      }
      if (w <= maxW || show === 0) {
        setLayout((prev) =>
          prev.show === show && prev.overflow === overflow
            ? prev
            : { show, overflow },
        );
        return;
      }
    }
  }, [chipWidths, estimateOverflowPillWidth, selectedIds.length]);

  useLayoutEffect(() => {
    recomputeLayout();
  }, [recomputeLayout]);

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recomputeLayout());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recomputeLayout]);

  const visibleIds = selectedIds.slice(0, layout.show);
  const overflow = layout.overflow;

  return (
    <div
      className={cn(
        "relative min-w-0 flex-1",
        bare ? "min-h-0" : "min-h-6",
      )}
    >
      <div
        ref={measureRef}
        className="pointer-events-none absolute left-0 top-0 z-[-1] flex w-max gap-1.5 opacity-0"
        aria-hidden
      >
        {selectedIds.map((id) => (
          <BigPictureTag key={id} bare={bare} onRemove={() => {}}>
            {idToLabel.get(id) ?? id}
          </BigPictureTag>
        ))}
      </div>
      <div
        ref={rowRef}
        className={cn(
          "flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden",
          bare ? "min-h-0" : "min-h-6",
        )}
      >
        {visibleIds.map((id) => (
          <BigPictureTag key={id} bare={bare} onRemove={() => onRemove(id)}>
            {idToLabel.get(id) ?? id}
          </BigPictureTag>
        ))}
        {overflow > 0 ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-[3px] bg-[#EBECF0] px-2 py-1 tabular-nums leading-none text-[#626F86]",
              bare ? "text-[13px]" : "text-[12px]",
            )}
            title={`${overflow} more`}
          >
            +{overflow}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function BigPictureTeamsDropdown({
  groups = DEFAULT_GROUPS,
  globalTeamsTo = "/global-teams",
  className,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  defaultMenuOpen = false,
  open: openProp,
  onOpenChange,
  compactTriggerUntilSelection = false,
  triggerClassName,
  value: valueProp,
  defaultValue,
  onValueChange,
}: Props) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<Set<string>>(
    () => new Set(defaultValue ?? []),
  );

  const selected = isControlled ? new Set(valueProp!) : internal;

  function setSelected(next: Set<string>) {
    if (!isControlled) setInternal(next);
    onValueChange?.([...next]);
  }

  const isOpenControlled = openProp !== undefined;
  const [menuOpenInternal, setMenuOpenInternal] = useState(defaultMenuOpen);
  const menuOpen = isOpenControlled ? openProp : menuOpenInternal;

  function handleMenuOpenChange(nextOpen: boolean) {
    if (!isOpenControlled) setMenuOpenInternal(nextOpen);
    onOpenChange?.(nextOpen);
  }
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => itemMatchesQuery(item, q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, search]);

  const visibleIds = useMemo(
    () => flattenVisibleIds(filteredGroups),
    [filteredGroups],
  );

  const configuredItemCount = useMemo(
    () => groups.reduce((n, g) => n + g.items.length, 0),
    [groups],
  );

  const hasConfiguredTeams = configuredItemCount > 0;
  const hasListToShow = filteredGroups.length > 0;

  const idToLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups) {
      for (const item of g.items) {
        m.set(item.id, itemLabel(item));
      }
    }
    return m;
  }, [groups]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function selectAllVisible() {
    const next = new Set(selected);
    visibleIds.forEach((id) => next.add(id));
    setSelected(next);
  }

  function deselectVisible() {
    const next = new Set(selected);
    visibleIds.forEach((id) => next.delete(id));
    setSelected(next);
  }

  function removeSelected(id: string) {
    const next = new Set(selected);
    next.delete(id);
    setSelected(next);
  }

  function renderRow(item: TeamListItem) {
    const checked = selected.has(item.id);
    const row = (
      <div
        key={item.id}
        className="flex min-w-0 items-center gap-2 px-3 py-2"
      >
        <Checkbox
          checked={checked}
          onCheckedChange={() => toggle(item.id)}
          className={checkboxClass}
          aria-label={
            item.type === "simple"
              ? item.label
              : item.type === "team"
                ? item.name
                : item.type === "user"
                  ? item.name
                  : undefined
          }
        />
        {item.type === "simple" && (
          <span className="min-w-0 flex-1 text-sm text-[#172B4D]">{item.label}</span>
        )}
        {item.type === "team" && (
          <span className="min-w-0 flex-1 truncate text-sm text-[#172B4D]">{item.name}</span>
        )}
        {item.type === "user" && (
          <span className="min-w-0 flex-1 truncate text-sm text-[#172B4D]">
            {item.name}
          </span>
        )}
      </div>
    );
    return row;
  }

  const hasSelection = selected.size > 0;
  const selectedIds = [...selected];

  const compactEmptyAnchor =
    compactTriggerUntilSelection && !hasSelection;

  const tableCompactShell = Boolean(compactTriggerUntilSelection);

  return (
    <div
      className={cn(
        className,
        compactTriggerUntilSelection &&
          "flex h-9 max-h-9 min-h-9 min-w-0 flex-col justify-center",
      )}
    >
      <DropdownMenu
        modal={false}
        open={menuOpen}
        onOpenChange={handleMenuOpenChange}
      >
        {compactEmptyAnchor ? (
          <Tooltip delayDuration={250}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <div
                  className={cn(
                    "flex h-9 max-h-9 min-h-9 w-full max-w-full min-w-0 shrink-0 cursor-pointer flex-row items-center justify-center rounded-md border border-transparent bg-transparent px-0 py-0 opacity-0 shadow-none outline-none transition-[opacity,background-color,border-color] duration-150 group-hover:border-[#DFE1E6] group-hover:bg-[#F1F2F4] group-hover:opacity-100 group-hover:shadow-none hover:bg-[#EBECF0] focus-visible:border-[#DFE1E6] focus-visible:bg-[#F1F2F4] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30 aria-expanded:border-[#DFE1E6] aria-expanded:bg-[#F1F2F4] aria-expanded:opacity-100 data-[state=open]:border-[#DFE1E6] data-[state=open]:bg-[#F1F2F4] data-[state=open]:opacity-100 [&_button_svg]:pointer-events-auto",
                    triggerClassName,
                  )}
                >
                  <div className="flex h-full min-h-9 w-full min-w-0 items-center justify-center gap-2">
                    <span className="sr-only">Select teams</span>
                    <PlusIcon
                      className="size-5 shrink-0 text-[#172B4D]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="border-0 bg-[#42526E] px-3 py-2 text-xs font-normal text-white shadow-lg [&_svg]:fill-[#42526E]"
            >
              Add teams
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>
            <div
              title={
                compactTriggerUntilSelection && !compactEmptyAnchor
                  ? "Add teams"
                  : undefined
              }
              className={cn(
                tableCompactShell &&
                  cn(
                    "flex h-9 max-h-9 min-h-9 w-full max-w-full min-w-0 shrink-0 cursor-pointer flex-row items-center px-0 py-0 shadow-none outline-none focus-visible:outline-none [&_button_svg]:pointer-events-auto",
                    hasSelection &&
                      cn(
                        "justify-start gap-1.5 rounded-[3px] border border-transparent bg-transparent px-1 py-0.5 transition-[border-color] hover:bg-transparent",
                        /* Inline-edit cue on row hover (`group` = `<tr>` in TeamsDemoPage table). */
                        "group-hover:border-[#DFE1E6]",
                        "focus-visible:border-[#0C66E4]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30",
                      ),
                  ),
                !tableCompactShell && buttonVariants({ variant: "outline", size: "default" }),
                !tableCompactShell &&
                  "flex h-auto min-h-9 w-full min-w-[240px] cursor-pointer flex-row items-center justify-between gap-2 border-[#DFE1E6] bg-white px-3 py-2 text-left font-normal text-[#172B4D] shadow-none whitespace-normal hover:bg-[#F7F8F9] hover:text-[#172B4D]",
                !tableCompactShell &&
                  "focus-visible:ring-[#0C66E4]/30 [&_button_svg]:pointer-events-auto",
                triggerClassName,
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 items-center gap-2",
                  tableCompactShell && hasSelection && "min-w-0 flex-1",
                  tableCompactShell && !hasSelection && "w-full justify-center",
                  !tableCompactShell && "flex-1",
                )}
              >
                {hasSelection ? (
                  <TriggerSelectedTags
                    bare={compactTriggerUntilSelection}
                    selectedIds={selectedIds}
                    idToLabel={idToLabel}
                    onRemove={removeSelected}
                  />
                ) : (
                  <span className="truncate text-sm font-normal text-[#97A0AF]">
                    Select teams
                  </span>
                )}
              </div>
              {!compactTriggerUntilSelection ? (
                <ChevronDownIcon className="size-4 shrink-0 text-[#44546F]" />
              ) : null}
            </div>
          </DropdownMenuTrigger>
        )}

        <DropdownMenuContent
          align="start"
          collisionPadding={8}
          sticky={compactTriggerUntilSelection ? "always" : undefined}
          updatePositionStrategy={
            compactTriggerUntilSelection ? "always" : undefined
          }
          className="w-[min(calc(100vw-2rem),420px)] border-[#DFE1E6] bg-white p-0 text-[#172B4D] shadow-lg"
          sideOffset={6}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {hasConfiguredTeams ? (
            <div className="border-b border-[#DFE1E6] p-2">
              <div className="relative min-w-0">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-9 border-[#DFE1E6] bg-white pr-8 text-sm"
                />
                {search ? (
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-[#626F86] hover:bg-[#F1F2F4]"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <XIcon className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {hasConfiguredTeams ? (
            <div className="flex items-center gap-4 px-3 py-2">
              <button
                type="button"
                className="text-sm font-medium text-[#0C66E4] hover:underline"
                onClick={selectAllVisible}
              >
                Select all
              </button>
              <button
                type="button"
                className="text-sm font-medium text-[#0C66E4] hover:underline"
                onClick={deselectVisible}
              >
                Deselect all
              </button>
            </div>
          ) : null}

          <div
            className={cn(
              "max-h-[min(45vh,280px)] overflow-y-auto overscroll-contain [scrollbar-width:thin]",
              hasConfiguredTeams && "border-t border-[#DFE1E6]",
            )}
          >
            {!hasConfiguredTeams ? (
              <div className="px-4 py-5 text-center text-sm leading-snug text-[#626F86]">
                {emptyMessage}
              </div>
            ) : !hasListToShow ? (
              <div className="px-4 py-5 text-center text-sm text-[#626F86]">
                No teams match your search.
              </div>
            ) : (
              <div className="py-1">
                {filteredGroups.map((group, gi) => (
                  <div key={`${group.title}-${gi}`}>
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#626F86]">
                      {group.title}
                    </div>
                    {group.items.map((item) => renderRow(item))}
                    {gi < filteredGroups.length - 1 ? (
                      <div className="my-1 h-px bg-[#DFE1E6]" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="m-0 bg-[#DFE1E6]" />
          <div className="bg-[#F7F8F9] px-3 py-3">
            <p className="text-xs leading-snug text-[#626F86]">
              Go to{" "}
              <Link
                to={globalTeamsTo}
                className="font-semibold text-[#0C66E4] underline-offset-2 hover:underline"
                onPointerDown={(e) => e.stopPropagation()}
              >
                Global teams
              </Link>{" "}
              to create and manage your teams.
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
