import { ChevronDownIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import { useMemo, useState } from "react";
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
  /** Controlled selection */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (ids: string[]) => void;
};

const checkboxClass =
  "size-4 shrink-0 rounded-[3px] border-[#C1C7D0] bg-white data-[state=checked]:border-[#0C66E4] data-[state=checked]:bg-[#0C66E4] data-[state=checked]:text-white";

const DEFAULT_EMPTY_MESSAGE = "No teams added yet.";

export function BigPictureTeamsDropdown({
  groups = DEFAULT_GROUPS,
  globalTeamsTo = "/global-teams",
  className,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
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

  return (
    <div className={cn(className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "flex h-auto min-h-9 w-full min-w-[240px] cursor-pointer flex-row items-center justify-between gap-2 border-[#DFE1E6] bg-white px-3 py-2 text-left font-normal text-[#172B4D] shadow-none",
              "whitespace-normal hover:bg-[#F7F8F9] hover:text-[#172B4D]",
              "focus-visible:ring-[#0C66E4]/30 [&_button_svg]:pointer-events-auto",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {hasSelection ? (
                <div className="max-h-[281px] min-w-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                  <div className="flex flex-wrap content-start gap-1.5 py-0.5">
                    {selectedIds.map((id) => {
                      const label = idToLabel.get(id) ?? id;
                      return (
                        <BigPictureTag
                          key={id}
                          onRemove={() => removeSelected(id)}
                        >
                          {label}
                        </BigPictureTag>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <span className="truncate text-sm font-normal text-[#97A0AF]">
                  Select teams
                </span>
              )}
            </div>
            <ChevronDownIcon className="size-4 shrink-0 text-[#44546F]" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
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
