import {
  Battery,
  ChartColumnIncreasing,
  ChartGantt,
  ChartNetwork,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleDot,
  CornerDownRight,
  Columns2,
  Compass,
  Cog,
  Eye,
  Filter,
  Flame,
  Gauge,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Target,
  Ticket,
  Undo2,
  Users,
  Waves,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BigPictureAppTile } from "./components/BigPictureAppTile";
import { BigPictureModuleMark } from "./components/BigPictureModuleMark";
import { JiraGlobalChromeBar } from "./components/JiraGlobalChromeBar";
import { Tooltip } from "./components/Tooltip";
import { cn } from "./components/ui/utils";
import { ads } from "./design/atlassianPageTokens";

const purpleNewBadge =
  "ml-auto shrink-0 rounded border border-[#C6C2F5] bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-[#5E4DB2]";
const blueNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none bg-[#DEEBFF] text-[#0747A6]";

const sidebarNavButton =
  "box-border flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left text-sm leading-5 text-[#172B4D] hover:bg-[#EBECF0]";
/** Selected row: full outline + light fill (BigPicture reference shell). */
const sidebarActive =
  "border-[#0C66E4] bg-[#E9F2FF] font-medium text-[#0C66E4] hover:bg-[#E9F2FF]";

const SWIMLANES_VIEW_OPTIONS = [
  "Swimlanes",
  "Capacity planning",
  "Reports view",
] as const;

const ESSENTIALS_CARD_VIEWS = ["Essentials", "Hybrid", "Teams"] as const;

/** Layout shell matching Goals / Swimlanes — base for Board + Goals merge work. */
export default function MergingBoardGoalsPage() {
  const [swimlanesMenuOpen, setSwimlanesMenuOpen] = useState(false);
  const [swimlanesSelection, setSwimlanesSelection] = useState<
    (typeof SWIMLANES_VIEW_OPTIONS)[number]
  >("Swimlanes");
  const swimlanesTriggerRef = useRef<HTMLButtonElement>(null);
  const swimlanesMenuRef = useRef<HTMLDivElement>(null);
  const [swimlanesMenuBox, setSwimlanesMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [teamDimension, setTeamDimension] = useState<
    "team" | "team-members" | "status" | "priority" | "color"
  >("team");
  const teamTriggerRef = useRef<HTMLButtonElement>(null);
  const teamMenuRef = useRef<HTMLDivElement>(null);
  const [teamMenuBox, setTeamMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [allMenuOpen, setAllMenuOpen] = useState(false);
  const [allTeamUnassigned, setAllTeamUnassigned] = useState(true);
  const allTriggerRef = useRef<HTMLButtonElement>(null);
  const allMenuRef = useRef<HTMLDivElement>(null);
  const [allMenuBox, setAllMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [essentialsMenuOpen, setEssentialsMenuOpen] = useState(false);
  const [essentialsCardView, setEssentialsCardView] = useState<
    (typeof ESSENTIALS_CARD_VIEWS)[number]
  >("Essentials");
  const essentialsTriggerRef = useRef<HTMLButtonElement>(null);
  const essentialsMenuRef = useRef<HTMLDivElement>(null);
  const [essentialsMenuBox, setEssentialsMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [tasksMenuOpen, setTasksMenuOpen] = useState(false);
  const tasksTriggerRef = useRef<HTMLButtonElement>(null);
  const tasksMenuRef = useRef<HTMLDivElement>(null);
  const [tasksMenuBox, setTasksMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [viewTaskWarnings, setViewTaskWarnings] = useState(false);
  const [viewGoals, setViewGoals] = useState(false);
  const viewTriggerRef = useRef<HTMLButtonElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const [viewMenuBox, setViewMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  useEffect(() => {
    if (!swimlanesMenuOpen) {
      setSwimlanesMenuBox(null);
      return;
    }
    const update = () => {
      const el = swimlanesTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSwimlanesMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 220),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [swimlanesMenuOpen]);

  useEffect(() => {
    if (!teamMenuOpen) {
      setTeamMenuBox(null);
      return;
    }
    const update = () => {
      const el = teamTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTeamMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 260),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [teamMenuOpen]);

  useEffect(() => {
    if (!allMenuOpen) {
      setAllMenuBox(null);
      return;
    }
    const update = () => {
      const el = allTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAllMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 300),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [allMenuOpen]);

  useEffect(() => {
    if (!essentialsMenuOpen) {
      setEssentialsMenuBox(null);
      return;
    }
    const update = () => {
      const el = essentialsTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setEssentialsMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 260),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [essentialsMenuOpen]);

  useEffect(() => {
    if (!tasksMenuOpen) {
      setTasksMenuBox(null);
      return;
    }
    const update = () => {
      const el = tasksTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTasksMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 240),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [tasksMenuOpen]);

  useEffect(() => {
    if (!viewMenuOpen) {
      setViewMenuBox(null);
      return;
    }
    const update = () => {
      const el = viewTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setViewMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 220),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [viewMenuOpen]);

  useEffect(() => {
    if (
      !swimlanesMenuOpen &&
      !teamMenuOpen &&
      !allMenuOpen &&
      !essentialsMenuOpen &&
      !tasksMenuOpen &&
      !viewMenuOpen
    )
      return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (swimlanesTriggerRef.current?.contains(t)) return;
      if (swimlanesMenuRef.current?.contains(t)) return;
      if (teamTriggerRef.current?.contains(t)) return;
      if (teamMenuRef.current?.contains(t)) return;
      if (allTriggerRef.current?.contains(t)) return;
      if (allMenuRef.current?.contains(t)) return;
      if (essentialsTriggerRef.current?.contains(t)) return;
      if (essentialsMenuRef.current?.contains(t)) return;
      if (tasksTriggerRef.current?.contains(t)) return;
      if (tasksMenuRef.current?.contains(t)) return;
      if (viewTriggerRef.current?.contains(t)) return;
      if (viewMenuRef.current?.contains(t)) return;
      setSwimlanesMenuOpen(false);
      setTeamMenuOpen(false);
      setAllMenuOpen(false);
      setEssentialsMenuOpen(false);
      setTasksMenuOpen(false);
      setViewMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [
    swimlanesMenuOpen,
    teamMenuOpen,
    allMenuOpen,
    essentialsMenuOpen,
    tasksMenuOpen,
    viewMenuOpen,
  ]);

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col font-sans antialiased",
        ads.canvas,
      )}
    >
      <JiraGlobalChromeBar />
      <div className="flex min-h-0 min-w-0 flex-1">
      <aside className="flex w-[188px] shrink-0 flex-col bg-[#F4F5F7]">
        <div className="flex h-[52px] w-full min-w-0 shrink-0 flex-col">
          <div className="flex min-h-0 flex-1 items-center gap-2 px-3">
            <span className="relative flex size-8 shrink-0 items-center justify-center">
              <BigPictureAppTile className="absolute inset-0 size-8" />
              <span className="relative z-[1] flex items-center justify-center">
                <BigPictureModuleMark height={22} />
              </span>
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm font-semibold",
                ads.ink800,
              )}
            >
              BigPicture
            </span>
            <Tooltip content="Collapse menu" className="ml-auto shrink-0">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-[3px] text-[#505258] hover:bg-[#EBECF0] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30"
                aria-label="Collapse menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={14}
                  viewBox="0 0 16 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 1.5C1.86739 1.5 1.74021 1.55268 1.64645 1.64645C1.55268 1.74021 1.5 1.86739 1.5 2V12C1.5 12.1326 1.55268 12.2598 1.64645 12.3536C1.74021 12.4473 1.86739 12.5 2 12.5H4V1.5H2ZM5.5 1.5V12.5H14C14.1326 12.5 14.2598 12.4473 14.3536 12.3536C14.4473 12.2598 14.5 12.1326 14.5 12V2C14.5 1.86739 14.4473 1.74021 14.3536 1.64645C14.2598 1.55268 14.1326 1.5 14 1.5H5.5ZM0 2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H14C14.5304 0 15.0391 0.210714 15.4142 0.585786C15.7893 0.960859 16 1.46957 16 2V12C16 12.5304 15.7893 13.0391 15.4142 13.4142C15.0391 13.7893 14.5304 14 14 14H2C1.46957 14 0.960859 13.7893 0.585786 13.4142C0.210714 13.0391 0 12.5304 0 12V2ZM7.97 6.47L10.47 3.97L11.53 5.03L9.56 7L11.53 8.97L10.47 10.03L7.97 7.53C7.82955 7.38937 7.75066 7.19875 7.75066 7C7.75066 6.80125 7.82955 6.61063 7.97 6.47Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
          <div className="shrink-0 px-3" aria-hidden role="separator">
            <div className="h-px w-full bg-[#DFE1E6]" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          <button type="button" className={sidebarNavButton}>
            <Compass className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Strategic Areas</span>
          </button>
          <div className="my-1.5 shrink-0 px-2" aria-hidden role="separator">
            <div className="h-px w-full bg-[#DFE1E6]" />
          </div>
          <button type="button" className={sidebarNavButton}>
            <ChartNetwork className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Overview</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <ChartGantt className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Gantt</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <List className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Scope</span>
          </button>
          <button type="button" className={cn(sidebarNavButton, sidebarActive)}>
            <Columns2 className="size-4 shrink-0" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-left">Board</span>
            <ChevronRight className="size-4 shrink-0 opacity-90" aria-hidden />
          </button>
          <button type="button" className={sidebarNavButton}>
            <Battery className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Resources</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <Users className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Teams</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <Gauge className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-left">Risk Man...</span>
            <span className={blueNewBadge}>New</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <Flame className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate">Risks</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <Target className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-left">OKR</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <ChartColumnIncreasing
              className="size-4 shrink-0 text-[#44546F]"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 truncate text-left">Priorities</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <button type="button" className={sidebarNavButton}>
            <CircleDollarSign className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-left">Financials</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <div className="my-1.5 shrink-0 px-2" aria-hidden role="separator">
            <div className="h-px w-full bg-[#DFE1E6]" />
          </div>
        </nav>

        <div className={cn("border-t p-2", ads.border)}>
          <button type="button" className={sidebarNavButton}>
            <Cog className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
            <span className="truncate text-sm">Box Configuration</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#F4F5F7]">
        {/* Module header — same row height as sidebar BigPicture bar (52px) */}
        <header className="flex h-[52px] shrink-0 items-center bg-[#F4F5F7] px-4">
          <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
            <span className={cn("truncate text-sm text-[#626F86]", ads.bodySubtle)}>
              … / AGILE + HYBRID /{" "}
            </span>
            <span className={cn("truncate text-sm font-semibold", ads.ink800)}>
              HYBR-1 New Hybrid Project
            </span>
            <span
              className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0747A6]"
              style={{ backgroundColor: "#DEEBFF" }}
            >
              In progress
            </span>
          </div>
        </header>

        {/* White module surface: rounded card (toolbar + board) on gray shell */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
        {/* Module toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                ref={swimlanesTriggerRef}
                type="button"
                aria-expanded={swimlanesMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setTeamMenuOpen(false);
                  setAllMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setSwimlanesMenuOpen((open) => !open);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold outline-none transition-colors",
                  swimlanesMenuOpen
                    ? "border border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                    : "border border-transparent text-[#172B4D] hover:bg-[#EBECF0]",
                )}
              >
                {swimlanesSelection}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0",
                    swimlanesMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                  )}
                />
              </button>
              {swimlanesMenuOpen &&
                swimlanesMenuBox &&
                createPortal(
                  <div
                    ref={swimlanesMenuRef}
                    className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-1.5 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                    style={{
                      top: swimlanesMenuBox.top,
                      left: swimlanesMenuBox.left,
                      minWidth: swimlanesMenuBox.minWidth,
                    }}
                    role="listbox"
                    aria-label="View type"
                  >
                    {SWIMLANES_VIEW_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="option"
                        aria-selected={opt === swimlanesSelection}
                        className={cn(
                          "flex w-full px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]",
                          opt === swimlanesSelection && "font-medium",
                        )}
                        onClick={() => {
                          setSwimlanesSelection(opt);
                          setSwimlanesMenuOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>
            <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-md border border-[#DFE1E6] bg-white">
              <button
                ref={teamTriggerRef}
                type="button"
                aria-expanded={teamMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setAllMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setTeamMenuOpen((open) => !open);
                }}
                className={cn(
                  "flex items-center gap-1.5 border-0 border-r border-[#DFE1E6] px-2 py-1.5 text-sm font-medium outline-none transition-colors",
                  teamMenuOpen
                    ? "bg-[#E9F2FF] text-[#0C66E4]"
                    : "bg-white text-[#172B4D] hover:bg-[#F7F8F9]",
                )}
              >
                <Waves
                  className={cn(
                    "size-4 shrink-0",
                    teamMenuOpen ? "text-[#0C66E4]" : "text-[#44546F]",
                  )}
                  strokeWidth={2}
                />
                Team
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0",
                    teamMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                  )}
                />
              </button>
              <button
                ref={allTriggerRef}
                type="button"
                aria-expanded={allMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setTeamMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setAllMenuOpen((open) => !open);
                }}
                className={cn(
                  "flex items-center gap-1 border-0 px-2 py-1.5 text-sm font-medium outline-none transition-colors",
                  allMenuOpen
                    ? "bg-[#E9F2FF] text-[#0C66E4]"
                    : "bg-white text-[#172B4D] hover:bg-[#F7F8F9]",
                )}
              >
                All
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0",
                    allMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                  )}
                />
              </button>
            </div>
            {teamMenuOpen &&
              teamMenuBox &&
              createPortal(
                <div
                  ref={teamMenuRef}
                  className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-1.5 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                  style={{
                    top: teamMenuBox.top,
                    left: teamMenuBox.left,
                    minWidth: teamMenuBox.minWidth,
                  }}
                  role="listbox"
                  aria-label="Group by"
                >
                  {(
                    [
                      { id: "team" as const, label: "Team" },
                      { id: "team-members" as const, label: "Team members", new: true },
                      { id: "status" as const, label: "Status", eye: true },
                      { id: "priority" as const, label: "Priority", new: true },
                      { id: "color" as const, label: "Color", new: true },
                    ] as const
                  ).map((row) => {
                    const selected = teamDimension === row.id;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => {
                          setTeamDimension(row.id);
                          setTeamMenuOpen(false);
                        }}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-[#0C66E4] bg-white"
                              : "border-[#DFE1E6] bg-white",
                          )}
                          aria-hidden
                        >
                          {selected && (
                            <span className="size-2 rounded-full bg-[#0C66E4]" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">{row.label}</span>
                        {"new" in row && row.new && (
                          <span className={purpleNewBadge}>New</span>
                        )}
                        {"eye" in row && row.eye && (
                          <Eye
                            className="size-4 shrink-0 text-[#44546F]"
                            strokeWidth={2}
                            aria-hidden
                          />
                        )}
                      </button>
                    );
                  })}
                </div>,
                document.body,
              )}
            {allMenuOpen &&
              allMenuBox &&
              createPortal(
                <div
                  ref={allMenuRef}
                  className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white p-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                  style={{
                    top: allMenuBox.top,
                    left: allMenuBox.left,
                    minWidth: allMenuBox.minWidth,
                  }}
                  role="dialog"
                  aria-label="Filter by team"
                >
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search... (at least 3 characters)"
                      className="w-full rounded-[3px] border border-[#0C66E4] bg-white py-1.5 pl-2.5 pr-8 text-sm text-[#172B4D] placeholder:text-[#626F86] outline-none"
                    />
                    <Search
                      className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-[#44546F]"
                      strokeWidth={2}
                    />
                  </div>
                  <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wide text-[#626F86]">
                    Deselect all
                  </p>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[3px] px-1 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                    onClick={() => setAllTeamUnassigned((v) => !v)}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                        allTeamUnassigned
                          ? "border-[#0C66E4] bg-[#0C66E4]"
                          : "border-[#DFE1E6] bg-white",
                      )}
                      aria-hidden
                    >
                      {allTeamUnassigned && (
                        <Check className="size-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                    Team unassigned
                  </button>
                </div>,
                document.body,
              )}
            <div className="relative">
              <button
                ref={essentialsTriggerRef}
                type="button"
                aria-expanded={essentialsMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setTeamMenuOpen(false);
                  setAllMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setEssentialsMenuOpen((open) => !open);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm font-medium outline-none transition-colors",
                  essentialsMenuOpen
                    ? "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                    : "border-[#DFE1E6] bg-white text-[#172B4D] hover:bg-[#EBECF0]",
                )}
              >
                {essentialsCardView}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0",
                    essentialsMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                  )}
                />
              </button>
              {essentialsMenuOpen &&
                essentialsMenuBox &&
                createPortal(
                  <div
                    ref={essentialsMenuRef}
                    className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                    style={{
                      top: essentialsMenuBox.top,
                      left: essentialsMenuBox.left,
                      minWidth: essentialsMenuBox.minWidth,
                    }}
                    role="listbox"
                    aria-label="Card views"
                  >
                    <div className="px-3 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#626F86]">
                      Current view
                    </div>
                    <div className="px-3 py-2 text-sm text-[#172B4D]">
                      {essentialsCardView}
                    </div>
                    <div
                      className="my-1.5 border-t border-[#DFE1E6]"
                      role="separator"
                    />
                    <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-[#626F86]">
                      Available
                    </div>
                    {ESSENTIALS_CARD_VIEWS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={name === essentialsCardView}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => {
                          setEssentialsCardView(name);
                          setEssentialsMenuOpen(false);
                        }}
                      >
                        <span>{name}</span>
                        <Star
                          className="size-4 shrink-0 text-[#626F86]"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                    ))}
                    <div
                      className="my-1.5 border-t border-[#DFE1E6]"
                      role="separator"
                    />
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm font-medium text-[#0C66E4] hover:bg-[#F1F2F4]"
                      onClick={() => setEssentialsMenuOpen(false)}
                    >
                      Manage card views
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
            <div className="inline-flex items-center gap-1">
              <div className="relative">
                <button
                  ref={tasksTriggerRef}
                  type="button"
                  aria-expanded={tasksMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setTeamMenuOpen(false);
                    setAllMenuOpen(false);
                    setEssentialsMenuOpen(false);
                    setViewMenuOpen(false);
                    setTasksMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md border-0 px-2 py-1.5 text-sm font-medium outline-none transition-colors",
                    tasksMenuOpen
                      ? "bg-[#E9F2FF] text-[#0C66E4]"
                      : "bg-transparent text-[#172B4D] hover:bg-[#EBECF0]",
                  )}
                >
                  Tasks
                </button>
                {tasksMenuOpen &&
                  tasksMenuBox &&
                  createPortal(
                    <div
                      ref={tasksMenuRef}
                      className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                      style={{
                        top: tasksMenuBox.top,
                        left: tasksMenuBox.left,
                        minWidth: tasksMenuBox.minWidth,
                      }}
                      role="menu"
                      aria-label="Create task"
                    >
                      <div className="px-3 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#626F86]">
                        Create new
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => setTasksMenuOpen(false)}
                      >
                        <Ticket
                          className="size-4 shrink-0 text-[#0052CC]"
                          strokeWidth={2}
                          aria-hidden
                        />
                        Jira issue
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => setTasksMenuOpen(false)}
                      >
                        <span className="relative block size-4 shrink-0 overflow-hidden rounded-[3px]">
                          <BigPictureAppTile className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-[0.5]" />
                        </span>
                        BigPicture task
                      </button>
                      <div
                        className="my-1.5 border-t border-[#DFE1E6]"
                        role="separator"
                      />
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => setTasksMenuOpen(false)}
                      >
                        Add work items from Jira
                      </button>
                    </div>,
                    document.body,
                  )}
              </div>
              <div className="relative">
                <button
                  ref={viewTriggerRef}
                  type="button"
                  aria-expanded={viewMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setTeamMenuOpen(false);
                    setAllMenuOpen(false);
                    setEssentialsMenuOpen(false);
                    setTasksMenuOpen(false);
                    setViewMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md border-0 px-2 py-1.5 text-sm font-medium outline-none transition-colors",
                    viewMenuOpen
                      ? "bg-[#E9F2FF] text-[#0C66E4]"
                      : "bg-transparent text-[#172B4D] hover:bg-[#EBECF0]",
                  )}
                >
                  View
                </button>
                {viewMenuOpen &&
                  viewMenuBox &&
                  createPortal(
                    <div
                      ref={viewMenuRef}
                      className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-1.5 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                      style={{
                        top: viewMenuBox.top,
                        left: viewMenuBox.left,
                        minWidth: viewMenuBox.minWidth,
                      }}
                      role="menu"
                      aria-label="View options"
                    >
                      {(
                        [
                          "Dependencies",
                          "Sort",
                          "Layout",
                          "Aggregation",
                        ] as const
                      ).map((item) => (
                        <button
                          key={item}
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                          onClick={() => setViewMenuOpen(false)}
                        >
                          <span>{item}</span>
                          <ChevronRight
                            className="size-4 shrink-0 text-[#626F86]"
                            strokeWidth={2}
                            aria-hidden
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() =>
                          setViewTaskWarnings((v) => !v)
                        }
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                            viewTaskWarnings
                              ? "border-[#0C66E4] bg-[#0C66E4]"
                              : "border-[#DFE1E6] bg-white",
                          )}
                          aria-hidden
                        >
                          {viewTaskWarnings && (
                            <Check className="size-3 text-white" strokeWidth={3} />
                          )}
                        </span>
                        Task warnings
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                        onClick={() => setViewGoals((v) => !v)}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                            viewGoals
                              ? "border-[#0C66E4] bg-[#0C66E4]"
                              : "border-[#DFE1E6] bg-white",
                          )}
                          aria-hidden
                        >
                          {viewGoals && (
                            <Check className="size-3 text-white" strokeWidth={3} />
                          )}
                        </span>
                        Goals
                      </button>
                    </div>,
                    document.body,
                  )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-0.5 text-[#44546F]">
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-[#EBECF0]"
              aria-label="Search"
            >
              <Search className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-[#EBECF0]"
              aria-label="Filter"
            >
              <Filter className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-[#EBECF0]"
              aria-label="Undo"
            >
              <Undo2 className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-[#EBECF0]"
              aria-label="Share"
            >
              <Share2 className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Swimlanes canvas + infobar */}
        <main className="flex min-h-0 flex-1 flex-row overflow-hidden bg-white">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
            <div
              className={cn(
                "flex min-h-[min(520px,70vh)] flex-1 flex-col border-b",
                ads.border,
                ads.surface,
              )}
            >
              {/* Timeline row: prev/next + axis + focus / zoom */}
              <div className="flex items-center gap-2 px-3 py-2 md:px-4">
                <button
                  type="button"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#44546F] hover:bg-[#EBECF0]"
                  aria-label="Earlier on timeline"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex justify-between px-2">
                    {(["MAY", "JUN", "JUL"] as const).map((m) => (
                      <span
                        key={m}
                        className="text-[11px] font-semibold uppercase tracking-wide text-[#626F86]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-1.5 h-px w-full bg-[#DFE1E6]">
                    <span className="absolute inset-x-0 -top-2 flex justify-between px-[12.5%]">
                      <span className="h-2 w-px bg-[#DFE1E6]" />
                      <span className="h-2 w-px bg-[#DFE1E6]" />
                      <span className="h-2 w-px bg-[#DFE1E6]" />
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#44546F] hover:bg-[#EBECF0]"
                  aria-label="Later on timeline"
                >
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
                <div className="flex shrink-0 items-center gap-0.5 border-l border-[#DFE1E6] pl-2">
                  <button
                    type="button"
                    className="rounded-md p-1.5 hover:bg-[#EBECF0]"
                    aria-label="Focus / today"
                  >
                    <CircleDot className="size-4 text-[#44546F]" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 hover:bg-[#EBECF0]"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="size-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 hover:bg-[#EBECF0]"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Sprint column headers */}
              <div className="grid grid-cols-3 gap-2 border-b border-[#DFE1E6] px-4 py-3">
                {(["Sprint 1", "Sprint 2", "Sprint 3"] as const).map((label) => (
                  <div
                    key={label}
                    className="flex min-h-[40px] items-center gap-2 rounded-md bg-[#44546F] px-2.5 py-2 text-white"
                  >
                    <button
                      type="button"
                      className="box-border flex h-7 shrink-0 items-center justify-center rounded-[4px] bg-white/10 px-1.5 leading-none text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/35"
                      aria-label={`Otwórz strukturę sprintu: ${label}`}
                    >
                      <CornerDownRight
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {label}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-md p-0.5 hover:bg-white/10"
                      aria-label={`More for ${label}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Swimlane: Team unassigned */}
              <div className="border-b border-[#DFE1E6] bg-white px-4 py-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#172B4D] hover:text-[#0C66E4]"
                >
                  <ChevronDown className="size-4 shrink-0 text-[#626F86]" />
                  Team unassigned
                </button>
              </div>

              <div className="grid flex-1 grid-cols-3 gap-2 bg-white p-4">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-md border border-dashed border-[#DFE1E6] bg-white transition-colors hover:border-[#0C66E4]/40 hover:bg-[#F7F8F9]"
                    aria-label={`Add item in Sprint column ${i}`}
                  >
                    <Plus className="size-10 text-[#B3B9C4]" strokeWidth={1.25} />
                  </button>
                ))}
              </div>

              <div className="mt-auto border-t border-[#DFE1E6] px-4 py-3">
                <button
                  type="button"
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium",
                    ads.border,
                    ads.surface,
                    ads.bodyMedium,
                    "hover:bg-[#F1F2F4]",
                  )}
                >
                  Allocate Team
                </button>
              </div>
            </div>
          </div>

          {/* Infobar rail */}
          <aside
            className="flex w-8 shrink-0 flex-col items-center border-l border-[#DFE1E6] bg-[#EBECF0] py-3"
            aria-hidden
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#626F86]"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              INFOBAR
            </span>
          </aside>
        </main>
        </div>

        {/* Prototypes hub — outside app chrome; footer escape hatch */}
        <div
          className={cn(
            "mt-auto shrink-0 border-t border-dashed px-4 py-3",
            ads.border,
            "bg-[#F7F8F9]",
          )}
        >
          <Link
            to="/"
            className={cn(ads.linkUi, "text-xs font-semibold")}
          >
            ← All prototypes
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
