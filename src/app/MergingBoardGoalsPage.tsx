import {
  Battery,
  ChartColumnIncreasing,
  ChartGantt,
  ArrowLeft,
  Bookmark,
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
  Equal,
  Eye,
  Filter,
  Flame,
  Gauge,
  HelpCircle,
  Highlighter,
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
  "ml-auto shrink-0 rounded border border-[#C6C2F5] bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] font-normal uppercase leading-none text-[#5E4DB2]";
const blueNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-normal uppercase leading-none bg-[#DEEBFF] text-[#0747A6]";

const sidebarNavButton =
  "box-border flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left text-sm leading-5 text-[#172B4D] hover:bg-[#EBECF0]";
/** Selected row: full outline + light fill (BigPicture reference shell). */
const sidebarActive =
  "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4] hover:bg-[#E9F2FF]";

const SWIMLANES_VIEW_OPTIONS = [
  "Swimlanes",
  "Capacity planning",
  "Reports view",
] as const;

const ESSENTIALS_CARD_VIEWS = ["Essentials", "Hybrid", "Teams"] as const;
const CAPACITY_METRIC_OPTIONS = [
  "Story Points",
  "Man-days",
] as const;

/** Teams toggled in Team → All — each visible row renders a swimlane + sprint columns. */
const ALL_MENU_TEAMS = [
  { id: "unassigned", label: "Team unassigned" },
  { id: "north", label: "Squad North" },
  { id: "south", label: "Squad South" },
  { id: "design", label: "Design" },
] as const;

type TeamFilterId = (typeof ALL_MENU_TEAMS)[number]["id"];

function initialTeamFilter(): Record<TeamFilterId, boolean> {
  return {
    unassigned: true,
    north: true,
    south: true,
    design: true,
  };
}

function initialSwimlaneExpanded(): Record<TeamFilterId, boolean> {
  return {
    unassigned: true,
    north: true,
    south: true,
    design: true,
  };
}

/** Deterministic sprint column index 0–2 so demo cards do not jump on re-render. */
function sprintColumnForTeam(teamId: TeamFilterId): number {
  let h = 0;
  for (let i = 0; i < teamId.length; i++) {
    h = (h * 31 + teamId.charCodeAt(i)) >>> 0;
  }
  return h % 3;
}

function issueKeyForTeam(teamId: TeamFilterId): string {
  const n = sprintColumnForTeam(teamId) * 11 + teamId.length * 7;
  return `APP-${27 + (n % 60)}`;
}

const SWIMLANE_CARD_TITLE: Record<TeamFilterId, string> = {
  unassigned: "TEST 1",
  north: "API rollout",
  south: "QA checklist",
  design: "UX review",
};

function boardScopeLabel(scope: { tasks: boolean; goals: boolean }): string {
  if (scope.tasks && scope.goals) return "Tasks & Goals";
  if (scope.tasks) return "Tasks";
  return "Goals";
}

function SwimlaneIssueCard({
  issueKey,
  title,
}: {
  issueKey: string;
  title: string;
}) {
  return (
    <div className="w-full rounded-md border border-[#DFE1E6] bg-white p-2.5 shadow-[0_1px_2px_rgba(9,30,66,0.15)]">
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Bookmark
            className="size-4 shrink-0 fill-emerald-600 text-emerald-600"
            aria-hidden
          />
          <span className="truncate text-sm font-normal text-[#0C66E4]">
            {issueKey}
          </span>
        </div>
        <span className="shrink-0 rounded-md bg-[#F1F2F4] px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-[#44546F]">
          To do
        </span>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBECF0] text-[#626F86]"
          aria-label="More options"
        >
          <HelpCircle className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <div className="flex items-start gap-2 pt-0.5">
        <div
          className="flex size-6 shrink-0 items-center justify-center text-orange-500"
          aria-hidden
        >
          <Equal className="size-4" strokeWidth={2.5} />
        </div>
        <span className="min-w-0 flex-1 text-sm font-normal leading-snug text-[#172B4D]">
          {title}
        </span>
      </div>
    </div>
  );
}

const SWIMLANE_GOAL_TITLES = [
  "Q2 product delivery",
  "Reduce cycle time 20%",
  "OKR: customer satisfaction",
  "Stabilize sprint throughput",
  "Zero critical blockers",
  "Time-to-market −15%",
  "Flow predictability",
  "NPS & quality target",
] as const;

/** One goal per sprint column; stable hash per team + sprint index (1–3). */
function swimlaneGoalForSprint(
  teamId: TeamFilterId,
  sprintIndex: 0 | 1 | 2,
): {
  title: string;
  percent: number;
} {
  const seed = `${teamId}:sprint${sprintIndex + 1}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i) + 17) >>> 0;
  }
  const title = SWIMLANE_GOAL_TITLES[h % SWIMLANE_GOAL_TITLES.length];
  const percent = 28 + (h % 63);
  return { title, percent };
}

type SwimlaneStackItem =
  | { id: string; type: "task"; issueKey: string; title: string }
  | { id: string; type: "goal"; title: string; percent: number };

type SwimlaneCellStacks = Record<
  TeamFilterId,
  [SwimlaneStackItem[], SwimlaneStackItem[], SwimlaneStackItem[]]
>;

/** Extra goal rows in a cell (salt = occurrence index). */
function extraGoalFromSalt(
  teamId: TeamFilterId,
  sprintIndex: 0 | 1 | 2,
  salt: number,
): { title: string; percent: number } {
  const seed = `${teamId}:sprint${sprintIndex + 1}:extra:${salt}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i) + 23) >>> 0;
  }
  return {
    title: SWIMLANE_GOAL_TITLES[h % SWIMLANE_GOAL_TITLES.length],
    percent: 12 + (h % 86),
  };
}

function createInitialSwimlaneStacks(): SwimlaneCellStacks {
  const out = {} as SwimlaneCellStacks;
  for (const t of ALL_MENU_TEAMS) {
    const c = sprintColumnForTeam(t.id);
    const cols: [
      SwimlaneStackItem[],
      SwimlaneStackItem[],
      SwimlaneStackItem[],
    ] = [[], [], []];
    cols[c] = [
      {
        id: `seed-task-${t.id}`,
        type: "task",
        issueKey: issueKeyForTeam(t.id),
        title: SWIMLANE_CARD_TITLE[t.id],
      },
    ];
    out[t.id] = cols;
  }
  return out;
}

function SwimlaneGoalBar({
  title,
  percent,
  sprintLabel,
}: {
  title: string;
  percent: number;
  /** Shown above the goal title (per-column sprint). */
  sprintLabel?: string;
}) {
  return (
    <div className="rounded-md border border-[#DFE1E6] bg-[#F7F8F9] px-2 py-2 shadow-[0_1px_2px_rgba(9,30,66,0.06)]">
      {sprintLabel ? (
        <div className="mb-1 text-[10px] font-normal uppercase tracking-wide text-[#626F86]">
          {sprintLabel}
        </div>
      ) : null}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-normal leading-snug text-[#172B4D]">
          Goal: {title}
        </span>
        <span className="shrink-0 tabular-nums text-[11px] font-normal text-[#626F86]">
          {percent}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[#DFE1E6]"
        role="progressbar"
        aria-label={
          sprintLabel
            ? `${sprintLabel}: ${title}, ${percent}%`
            : `${title}, ${percent}%`
        }
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#0C66E4]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

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
  const [allTeamFilter, setAllTeamFilter] =
    useState<Record<TeamFilterId, boolean>>(initialTeamFilter);
  const [swimlaneExpanded, setSwimlaneExpanded] = useState<
    Record<TeamFilterId, boolean>
  >(initialSwimlaneExpanded);
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
  const [capacityMetricMenuOpen, setCapacityMetricMenuOpen] = useState(false);
  const [capacityMetricSelection, setCapacityMetricSelection] = useState<
    (typeof CAPACITY_METRIC_OPTIONS)[number]
  >("Story Points");
  const capacityMetricTriggerRef = useRef<HTMLButtonElement>(null);
  const capacityMetricMenuRef = useRef<HTMLDivElement>(null);
  const [capacityMetricMenuBox, setCapacityMetricMenuBox] = useState<{
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
  const [viewGoalsCompactMode, setViewGoalsCompactMode] = useState(false);
  const viewTriggerRef = useRef<HTMLButtonElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const [viewMenuBox, setViewMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [boardScopeMenuOpen, setBoardScopeMenuOpen] = useState(false);
  const [boardScope, setBoardScope] = useState<{
    tasks: boolean;
    goals: boolean;
  }>({ tasks: true, goals: false });
  const boardScopeTriggerRef = useRef<HTMLButtonElement>(null);
  const boardScopeMenuRef = useRef<HTMLDivElement>(null);
  const [boardScopeMenuBox, setBoardScopeMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const [swimlaneStacks, setSwimlaneStacks] = useState<SwimlaneCellStacks>(
    createInitialSwimlaneStacks,
  );
  const [sprintMixPicker, setSprintMixPicker] = useState<{
    teamId: TeamFilterId;
    sprintIdx: 0 | 1 | 2;
  } | null>(null);
  const sprintMixWrapRef = useRef<HTMLDivElement | null>(null);

  const boardAnchorRef = useRef<HTMLDivElement>(null);
  const boardFlyoutCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [boardFlyoutOpen, setBoardFlyoutOpen] = useState(false);
  const [boardFlyoutPos, setBoardFlyoutPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const clearBoardFlyoutCloseTimer = () => {
    if (boardFlyoutCloseTimer.current) {
      clearTimeout(boardFlyoutCloseTimer.current);
      boardFlyoutCloseTimer.current = null;
    }
  };

  const openBoardFlyout = () => {
    clearBoardFlyoutCloseTimer();
    const el = boardAnchorRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setBoardFlyoutPos({ top: r.top, left: r.right + 4 });
    }
    setBoardFlyoutOpen(true);
  };

  const scheduleCloseBoardFlyout = () => {
    clearBoardFlyoutCloseTimer();
    boardFlyoutCloseTimer.current = setTimeout(() => {
      setBoardFlyoutOpen(false);
      setBoardFlyoutPos(null);
      boardFlyoutCloseTimer.current = null;
    }, 120);
  };

  const closeBoardFlyoutNow = () => {
    clearBoardFlyoutCloseTimer();
    setBoardFlyoutOpen(false);
    setBoardFlyoutPos(null);
  };

  useEffect(() => {
    return () => {
      clearBoardFlyoutCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!boardFlyoutOpen) return;
    const update = () => {
      const el = boardAnchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBoardFlyoutPos({ top: r.top, left: r.right + 4 });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [boardFlyoutOpen]);

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
    if (!boardScopeMenuOpen) {
      setBoardScopeMenuBox(null);
      return;
    }
    const update = () => {
      const el = boardScopeTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBoardScopeMenuBox({
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
  }, [boardScopeMenuOpen]);

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
    if (!capacityMetricMenuOpen) {
      setCapacityMetricMenuBox(null);
      return;
    }
    const update = () => {
      const el = capacityMetricTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCapacityMetricMenuBox({
        top: r.bottom + 4,
        left: r.left,
        minWidth: Math.max(r.width, 200),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [capacityMetricMenuOpen]);

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
      !capacityMetricMenuOpen &&
      !tasksMenuOpen &&
      !viewMenuOpen &&
      !boardScopeMenuOpen
    )
      return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (swimlanesTriggerRef.current?.contains(t)) return;
      if (swimlanesMenuRef.current?.contains(t)) return;
      if (boardScopeTriggerRef.current?.contains(t)) return;
      if (boardScopeMenuRef.current?.contains(t)) return;
      if (teamTriggerRef.current?.contains(t)) return;
      if (teamMenuRef.current?.contains(t)) return;
      if (allTriggerRef.current?.contains(t)) return;
      if (allMenuRef.current?.contains(t)) return;
      if (essentialsTriggerRef.current?.contains(t)) return;
      if (essentialsMenuRef.current?.contains(t)) return;
      if (capacityMetricTriggerRef.current?.contains(t)) return;
      if (capacityMetricMenuRef.current?.contains(t)) return;
      if (tasksTriggerRef.current?.contains(t)) return;
      if (tasksMenuRef.current?.contains(t)) return;
      if (viewTriggerRef.current?.contains(t)) return;
      if (viewMenuRef.current?.contains(t)) return;
      setSwimlanesMenuOpen(false);
      setTeamMenuOpen(false);
      setAllMenuOpen(false);
      setEssentialsMenuOpen(false);
      setCapacityMetricMenuOpen(false);
      setTasksMenuOpen(false);
      setViewMenuOpen(false);
      setBoardScopeMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [
    swimlanesMenuOpen,
    teamMenuOpen,
    allMenuOpen,
    essentialsMenuOpen,
    capacityMetricMenuOpen,
    tasksMenuOpen,
    viewMenuOpen,
    boardScopeMenuOpen,
  ]);

  const goalsOnlyBoardScope = !boardScope.tasks && boardScope.goals;
  /** Goals on swimlanes ⇒ grouping stays Team-only (same UX as Goals-only mode). */
  const teamSwimlaneLocked = boardScope.goals;
  const isCapacityPlanningView = swimlanesSelection === "Capacity planning";

  useEffect(() => {
    if (teamSwimlaneLocked) {
      setTeamMenuOpen(false);
      setTeamDimension("team");
    }
  }, [teamSwimlaneLocked]);

  useEffect(() => {
    if (goalsOnlyBoardScope) {
      setTasksMenuOpen(false);
    }
  }, [goalsOnlyBoardScope]);

  useEffect(() => {
    if (!isCapacityPlanningView) {
      setCapacityMetricMenuOpen(false);
    } else {
      setTeamMenuOpen(false);
      setAllMenuOpen(false);
      setEssentialsMenuOpen(false);
      setTasksMenuOpen(false);
      setViewMenuOpen(false);
      setBoardScopeMenuOpen(false);
    }
  }, [isCapacityPlanningView]);

  useEffect(() => {
    if (!(boardScope.tasks && boardScope.goals)) {
      setSprintMixPicker(null);
    }
  }, [boardScope.tasks, boardScope.goals]);

  useEffect(() => {
    if (!sprintMixPicker) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (sprintMixWrapRef.current?.contains(t)) return;
      setSprintMixPicker(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [sprintMixPicker]);

  const appendJiraTask = (teamId: TeamFilterId, sprintIdx: 0 | 1 | 2) => {
    setSwimlaneStacks((prev) => {
      const row = prev[teamId];
      const next: [
        SwimlaneStackItem[],
        SwimlaneStackItem[],
        SwimlaneStackItem[],
      ] = [[...row[0]], [...row[1]], [...row[2]]];
      const n = next[sprintIdx].filter((x) => x.type === "task").length;
      next[sprintIdx].push({
        id: `task-${teamId}-${sprintIdx}-${Date.now()}-${n}`,
        type: "task",
        issueKey: `APP-${200 + ((n + teamId.length * 3 + sprintIdx * 11) % 700)}`,
        title: "New Jira task",
      });
      return { ...prev, [teamId]: next };
    });
  };

  const appendGoalItem = (teamId: TeamFilterId, sprintIdx: 0 | 1 | 2) => {
    setSwimlaneStacks((prev) => {
      const row = prev[teamId];
      const next: [
        SwimlaneStackItem[],
        SwimlaneStackItem[],
        SwimlaneStackItem[],
      ] = [[...row[0]], [...row[1]], [...row[2]]];
      const salt = next[sprintIdx].filter((x) => x.type === "goal").length;
      const meta = extraGoalFromSalt(teamId, sprintIdx, salt);
      next[sprintIdx].push({
        id: `goal-${teamId}-${sprintIdx}-${Date.now()}`,
        type: "goal",
        title: meta.title,
        percent: meta.percent,
      });
      return { ...prev, [teamId]: next };
    });
  };

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col font-sans antialiased",
        ads.canvas,
      )}
    >
      <JiraGlobalChromeBar />
      <div className="flex min-h-0 min-w-0 flex-1 pr-4">
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
                "min-w-0 flex-1 truncate text-sm font-normal",
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
          <div
            ref={boardAnchorRef}
            className="relative w-full"
            onMouseEnter={openBoardFlyout}
            onMouseLeave={scheduleCloseBoardFlyout}
          >
            <button type="button" className={cn(sidebarNavButton, sidebarActive)}>
              <Columns2 className="size-4 shrink-0" strokeWidth={2} />
              <span className="min-w-0 flex-1 truncate text-left">Board</span>
              <ChevronRight className="size-4 shrink-0 opacity-90" aria-hidden />
            </button>
          </div>
          {boardFlyoutOpen &&
            boardFlyoutPos &&
            createPortal(
              <div
                className="fixed z-[500] min-w-[220px] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                style={{ top: boardFlyoutPos.top, left: boardFlyoutPos.left }}
                role="menu"
                aria-label="Board views"
                onMouseEnter={openBoardFlyout}
                onMouseLeave={scheduleCloseBoardFlyout}
              >
                {SWIMLANES_VIEW_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    className="flex w-full px-3 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                    onClick={() => {
                      setSwimlanesSelection(label);
                      closeBoardFlyoutNow();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>,
              document.body,
            )}
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
          <div className={cn("border-t p-2", ads.border)}>
            <button type="button" className={sidebarNavButton}>
              <Cog className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
              <span className="truncate text-sm">Box Configuration</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#F4F5F7]">
        {/* Module header — same row height as sidebar BigPicture bar (52px) */}
        <header className="flex h-[52px] shrink-0 items-center gap-2 bg-[#F4F5F7] px-4">
          <Link
            to="/"
            className="flex size-8 shrink-0 items-center justify-center rounded-[3px] text-[#44546F] transition-colors hover:bg-[#EBECF0]"
            aria-label="All prototypes – back to hub"
            title="All prototypes"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
          </Link>
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
            <span className={cn("truncate text-sm text-[#626F86]", ads.bodySubtle)}>
              … / AGILE + HYBRID /{" "}
            </span>
            <span className={cn("truncate text-sm font-normal", ads.ink800)}>
              HYBR-1 New Hybrid Project
            </span>
            <span
              className="shrink-0 rounded px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-[#0747A6]"
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
                  setBoardScopeMenuOpen(false);
                  setTeamMenuOpen(false);
                  setAllMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setCapacityMetricMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setSwimlanesMenuOpen((open) => !open);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
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
                        className="flex w-full px-3 py-2 text-left text-sm font-normal text-[#172B4D] hover:bg-[#F1F2F4]"
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
            {isCapacityPlanningView ? (
              <div className="relative">
                <button
                  ref={capacityMetricTriggerRef}
                  type="button"
                  aria-expanded={capacityMetricMenuOpen}
                  aria-haspopup="listbox"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setCapacityMetricMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm outline-none transition-colors",
                    capacityMetricMenuOpen
                      ? "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                      : "border-[#DFE1E6] bg-white text-[#172B4D] hover:bg-[#EBECF0]",
                  )}
                >
                  {capacityMetricSelection}
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0",
                      capacityMetricMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                    )}
                  />
                </button>
                {capacityMetricMenuOpen &&
                  capacityMetricMenuBox &&
                  createPortal(
                    <div
                      ref={capacityMetricMenuRef}
                      className="fixed z-[500] min-w-[220px] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                      style={{
                        top: capacityMetricMenuBox.top,
                        left: capacityMetricMenuBox.left,
                      }}
                      role="listbox"
                      aria-label="Capacity metric"
                    >
                      <div className="px-6 pb-2 pt-1 text-[12px] font-normal uppercase tracking-wide text-[#44546F]">
                        Units
                      </div>
                      {CAPACITY_METRIC_OPTIONS.map((opt) => {
                        const selected = opt === capacityMetricSelection;
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className="flex w-full items-center gap-3 px-6 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                            onClick={() => {
                              setCapacityMetricSelection(opt);
                              setCapacityMetricMenuOpen(false);
                            }}
                          >
                            <span
                              className={cn(
                                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                                selected
                                  ? "border-[#246CCF] bg-white"
                                  : "border-[#8C8F97] bg-white",
                              )}
                              aria-hidden
                            >
                              {selected ? (
                                <span className="size-2.5 rounded-full bg-[#246CCF]" />
                              ) : null}
                            </span>
                            <span className="text-sm text-[#2E3138]">
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>,
                    document.body,
                  )}
              </div>
            ) : (
            <div className="relative">
              <button
                ref={boardScopeTriggerRef}
                type="button"
                aria-expanded={boardScopeMenuOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setTeamMenuOpen(false);
                  setAllMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setBoardScopeMenuOpen((open) => !open);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border border-[#DFE1E6] bg-white px-2 py-1.5 text-sm outline-none transition-colors",
                  boardScopeMenuOpen
                    ? "bg-[#E9F2FF] text-[#0C66E4]"
                    : "text-[#172B4D] hover:bg-[#F7F8F9]",
                )}
              >
                {boardScopeLabel(boardScope)}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0",
                    boardScopeMenuOpen ? "text-[#0C66E4]" : "opacity-70",
                  )}
                />
              </button>
              {boardScopeMenuOpen &&
                boardScopeMenuBox &&
                createPortal(
                  <div
                    ref={boardScopeMenuRef}
                    className="fixed z-[200] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                    style={{
                      top: boardScopeMenuBox.top,
                      left: boardScopeMenuBox.left,
                      minWidth: boardScopeMenuBox.minWidth,
                    }}
                    role="menu"
                    aria-label="Board content scope"
                  >
                    <div className="px-3 pb-1 text-[11px] font-normal uppercase tracking-wide text-[#44546F]">
                      Show on Swimlanes
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#F1F2F4]">
                      <input
                        type="checkbox"
                        className="size-4 shrink-0 rounded border-[#DFE1E6] text-[#0C66E4] accent-[#0C66E4]"
                        checked={boardScope.tasks}
                        onChange={() => {
                          setBoardScope((prev) => {
                            if (prev.tasks && !prev.goals) return prev;
                            return { ...prev, tasks: !prev.tasks };
                          });
                        }}
                      />
                      <span className="text-sm text-[#172B4D]">Tasks</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#F1F2F4]">
                      <input
                        type="checkbox"
                        className="size-4 shrink-0 rounded border-[#DFE1E6] text-[#0C66E4] accent-[#0C66E4]"
                        checked={boardScope.goals}
                        onChange={() => {
                          setBoardScope((prev) => {
                            if (!prev.tasks && prev.goals) return prev;
                            return { ...prev, goals: !prev.goals };
                          });
                        }}
                      />
                      <span className="text-sm text-[#172B4D]">Goals</span>
                    </label>
                  </div>,
                  document.body,
                )}
            </div>
            )}
            {!isCapacityPlanningView ? (
            <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-md border border-[#DFE1E6] bg-white">
              {teamSwimlaneLocked ? (
                <Tooltip
                  content="Goals are set per team"
                  className="inline-flex shrink-0 cursor-default"
                >
                  <div
                    ref={teamTriggerRef}
                    className="flex cursor-default select-none items-center gap-1.5 border-0 border-r border-[#DFE1E6] bg-white px-2 py-1.5 text-sm text-[#626F86]"
                    aria-label="Team swimlane (fixed while Goals are shown)"
                  >
                    <Waves
                      className="size-4 shrink-0 text-[#44546F]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Team
                  </div>
                </Tooltip>
              ) : (
                <button
                  ref={teamTriggerRef}
                  type="button"
                  aria-expanded={teamMenuOpen}
                  aria-haspopup="listbox"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setBoardScopeMenuOpen(false);
                    setAllMenuOpen(false);
                    setEssentialsMenuOpen(false);
                    setTasksMenuOpen(false);
                    setViewMenuOpen(false);
                    setTeamMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 border-0 border-r border-[#DFE1E6] px-2 py-1.5 text-sm outline-none transition-colors",
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
              )}
              <button
                ref={allTriggerRef}
                type="button"
                aria-expanded={allMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setBoardScopeMenuOpen(false);
                  setTeamMenuOpen(false);
                  setEssentialsMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setAllMenuOpen((open) => !open);
                }}
                className={cn(
                  "flex items-center gap-1 border-0 px-2 py-1.5 text-sm outline-none transition-colors",
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
            ) : null}
            {teamMenuOpen &&
              teamMenuBox &&
              !isCapacityPlanningView &&
              !teamSwimlaneLocked &&
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
              !isCapacityPlanningView &&
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
                  <button
                    type="button"
                    className="mb-1 mt-3 w-full px-1 py-1 text-left text-xs font-normal uppercase tracking-wide text-[#626F86] hover:bg-[#F1F2F4]"
                    onClick={() =>
                      setAllTeamFilter(() => {
                        const next = {} as Record<TeamFilterId, boolean>;
                        for (const t of ALL_MENU_TEAMS) next[t.id] = false;
                        return next;
                      })
                    }
                  >
                    Deselect all
                  </button>
                  {ALL_MENU_TEAMS.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-[3px] px-1 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                      onClick={() =>
                        setAllTeamFilter((prev) => ({
                          ...prev,
                          [team.id]: !prev[team.id],
                        }))
                      }
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                          allTeamFilter[team.id]
                            ? "border-[#0C66E4] bg-[#0C66E4]"
                            : "border-[#DFE1E6] bg-white",
                        )}
                        aria-hidden
                      >
                        {allTeamFilter[team.id] && (
                          <Check className="size-3 text-white" strokeWidth={3} />
                        )}
                      </span>
                      {team.label}
                    </button>
                  ))}
                </div>,
                document.body,
              )}
            {!isCapacityPlanningView ? (
            <div className="relative">
              <button
                ref={essentialsTriggerRef}
                type="button"
                aria-expanded={essentialsMenuOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setSwimlanesMenuOpen(false);
                  setBoardScopeMenuOpen(false);
                  setTeamMenuOpen(false);
                  setAllMenuOpen(false);
                  setTasksMenuOpen(false);
                  setViewMenuOpen(false);
                  setEssentialsMenuOpen((open) => !open);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm outline-none transition-colors",
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
                    <div className="px-3 pb-1 pt-0.5 text-[10px] font-normal uppercase tracking-wide text-[#626F86]">
                      Current view
                    </div>
                    <div className="px-3 py-2 text-sm text-[#172B4D]">
                      {essentialsCardView}
                    </div>
                    <div
                      className="my-1.5 border-t border-[#DFE1E6]"
                      role="separator"
                    />
                    <div className="px-3 pb-1 pt-1 text-[10px] font-normal uppercase tracking-wide text-[#626F86]">
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
                      className="w-full px-3 py-2 text-left text-sm text-[#0C66E4] hover:bg-[#F1F2F4]"
                      onClick={() => setEssentialsMenuOpen(false)}
                    >
                      Manage card views
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
            ) : null}
            {!isCapacityPlanningView ? (
            <div className="inline-flex items-center gap-1">
              {!goalsOnlyBoardScope && (
                <div className="relative">
                  <button
                    ref={tasksTriggerRef}
                    type="button"
                    aria-expanded={tasksMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setSwimlanesMenuOpen(false);
                      setBoardScopeMenuOpen(false);
                      setTeamMenuOpen(false);
                      setAllMenuOpen(false);
                      setEssentialsMenuOpen(false);
                      setViewMenuOpen(false);
                      setTasksMenuOpen((open) => !open);
                    }}
                    className={cn(
                      "inline-flex items-center rounded-md border-0 px-2 py-1.5 text-sm outline-none transition-colors",
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
                        <div className="px-3 pb-1 pt-0.5 text-[10px] font-normal uppercase tracking-wide text-[#626F86]">
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
              )}
              <div className="relative">
                <button
                  ref={viewTriggerRef}
                  type="button"
                  aria-expanded={viewMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setBoardScopeMenuOpen(false);
                    setTeamMenuOpen(false);
                    setAllMenuOpen(false);
                    setEssentialsMenuOpen(false);
                    setTasksMenuOpen(false);
                    setViewMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md border-0 px-2 py-1.5 text-sm outline-none transition-colors",
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
                      aria-label={
                        goalsOnlyBoardScope
                          ? "View options (Goals mode)"
                          : "View options"
                      }
                    >
                      {goalsOnlyBoardScope ? (
                        <>
                          {(
                            [
                              "Sort",
                              "Achievement",
                              "Heatmap mode",
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
                              setViewGoalsCompactMode((v) => !v)
                            }
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                                viewGoalsCompactMode
                                  ? "border-[#0C66E4] bg-[#0C66E4]"
                                  : "border-[#DFE1E6] bg-white",
                              )}
                              aria-hidden
                            >
                              {viewGoalsCompactMode && (
                                <Check
                                  className="size-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                            Compact mode
                          </button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>,
                    document.body,
                  )}
              </div>
            </div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-0.5 text-[#44546F]">
            {isCapacityPlanningView ? (
              <button
                type="button"
                className="rounded-md p-1.5 hover:bg-[#EBECF0]"
                aria-label="Highlight changes"
              >
                <Highlighter className="size-4" strokeWidth={2} />
              </button>
            ) : (
              <>
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
              </>
            )}
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
                "flex min-h-[min(520px,70vh)] flex-1 flex-col",
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
                        className="text-[11px] font-normal uppercase tracking-wide text-[#626F86]"
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

              {/* Sprint / stage headers */}
              <div
                className={cn(
                  "gap-2 border-b border-[#DFE1E6] px-4 py-3",
                  isCapacityPlanningView ? "grid grid-cols-2" : "grid grid-cols-3",
                )}
              >
                {(
                  isCapacityPlanningView
                    ? (["Stage 1", "Stage 2"] as const)
                    : (["Sprint 1", "Sprint 2", "Sprint 3"] as const)
                ).map((label) => (
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
                    <span className="min-w-0 flex-1 truncate text-sm font-normal">
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

              {isCapacityPlanningView ? (
                <section className="border-b border-[#DFE1E6] bg-white">
                  <div className="grid grid-cols-2 gap-2 p-4 pt-3">
                    {(["Stage 1", "Stage 2"] as const).map((stage) => (
                      <div
                        key={stage}
                        className="overflow-hidden rounded-md border border-[#DFE1E6] bg-white"
                      >
                        {([
                          { name: "Total", value: "0" },
                          { name: "ALPHA", value: "0" },
                        ] as const).map((row) => (
                          <div
                            key={row.name}
                            className="flex items-center justify-between gap-2 border-b border-[#F1F2F4] px-3 py-2 text-sm last:border-b-0"
                          >
                            <span className="text-[#172B4D]">{row.name}</span>
                            <span className="tabular-nums text-[#44546F]">
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
              /* Swimlanes — one block per team selected in Team → All */
              ALL_MENU_TEAMS.filter((t) => allTeamFilter[t.id]).map((team) => (
                <section key={team.id} className="border-b border-[#DFE1E6]">
                  <div className="bg-white px-4 py-2">
                    <button
                      type="button"
                      aria-expanded={swimlaneExpanded[team.id]}
                      onClick={() =>
                        setSwimlaneExpanded((prev) => ({
                          ...prev,
                          [team.id]: !prev[team.id],
                        }))
                      }
                      className="inline-flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm font-normal text-[#172B4D] hover:bg-[#F4F5F7] hover:text-[#0C66E4]"
                    >
                      {swimlaneExpanded[team.id] ? (
                        <ChevronDown className="size-4 shrink-0 text-[#626F86]" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-[#626F86]" />
                      )}
                      {team.label}
                    </button>
                  </div>
                  {swimlaneExpanded[team.id] ? (
                    <div className="grid grid-cols-3 gap-2 bg-white p-4 pt-3">
                      {(() => {
                        const tasksGoalsMix =
                          boardScope.tasks && boardScope.goals;
                        return [1, 2, 3].map((col) => {
                          const sprintIdx = (col - 1) as 0 | 1 | 2;
                          const rawStack = swimlaneStacks[team.id][sprintIdx];
                          const visibleStack = rawStack.filter((item) => {
                            if (boardScope.tasks && boardScope.goals)
                              return true;
                            if (boardScope.tasks) return item.type === "task";
                            return item.type === "goal";
                          });
                          const showMixPicker =
                            tasksGoalsMix &&
                            sprintMixPicker?.teamId === team.id &&
                            sprintMixPicker.sprintIdx === sprintIdx;
                          const addLabel = tasksGoalsMix
                            ? `${team.label}, Sprint ${col}: add Task or Goal`
                            : boardScope.tasks
                              ? `${team.label}, Sprint ${col}: add Jira task`
                              : `${team.label}, Sprint ${col}: add goal`;

                          const onAddClick = () => {
                            if (tasksGoalsMix) {
                              setSprintMixPicker((prev) =>
                                prev?.teamId === team.id &&
                                prev.sprintIdx === sprintIdx
                                  ? null
                                  : {
                                      teamId: team.id,
                                      sprintIdx,
                                    },
                              );
                              return;
                            }
                            if (boardScope.tasks) {
                              appendJiraTask(team.id, sprintIdx);
                            } else {
                              appendGoalItem(team.id, sprintIdx);
                            }
                          };

                          return (
                            <div
                              key={col}
                              className="flex min-h-0 flex-col gap-2"
                            >
                              {boardScope.goals ? (
                                <SwimlaneGoalBar
                                  sprintLabel={`Sprint ${col}`}
                                  {...swimlaneGoalForSprint(
                                    team.id,
                                    sprintIdx,
                                  )}
                                />
                              ) : null}
                              {visibleStack.map((item) =>
                                item.type === "task" ? (
                                  <SwimlaneIssueCard
                                    key={item.id}
                                    issueKey={item.issueKey}
                                    title={item.title}
                                  />
                                ) : (
                                  <SwimlaneGoalBar
                                    key={item.id}
                                    title={item.title}
                                    percent={item.percent}
                                  />
                                ),
                              )}
                              <div
                                className="relative shrink-0"
                                ref={
                                  showMixPicker
                                    ? sprintMixWrapRef
                                    : undefined
                                }
                              >
                                {showMixPicker ? (
                                  <div
                                    className="absolute bottom-full left-0 right-0 z-30 mb-1 rounded-md border border-[#DFE1E6] bg-white py-1 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                                    role="menu"
                                    aria-label="Add to sprint"
                                  >
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                                      onClick={() => {
                                        appendJiraTask(team.id, sprintIdx);
                                        setSprintMixPicker(null);
                                      }}
                                    >
                                      <Ticket
                                        className="size-4 shrink-0 text-[#0052CC]"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                      Jira task
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                                      onClick={() => {
                                        appendGoalItem(team.id, sprintIdx);
                                        setSprintMixPicker(null);
                                      }}
                                    >
                                      <Target
                                        className="size-4 shrink-0 text-[#44546F]"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                      Goal
                                    </button>
                                  </div>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={onAddClick}
                                  className="flex min-h-[72px] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-[#DFE1E6] bg-white transition-colors hover:border-[#0C66E4]/40 hover:bg-[#F7F8F9]"
                                  aria-label={addLabel}
                                >
                                  <Plus
                                    className="size-10 text-[#B3B9C4]"
                                    strokeWidth={1.25}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : null}
                </section>
              )))}

              {!isCapacityPlanningView ? (
                <div className="mt-auto px-4 py-3">
                  <button
                    type="button"
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-normal",
                      ads.border,
                      ads.surface,
                      ads.bodyMedium,
                      "hover:bg-[#F1F2F4]",
                    )}
                  >
                    Allocate Team
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Infobar rail — flush with canvas (white); left edge only + hover */}
          <aside
            className="flex w-8 shrink-0 flex-col items-center justify-center border-l border-[#DFE1E6] bg-white transition-colors hover:bg-[#EBECF0]"
            aria-label="Infobar"
          >
            <span
              className="flex items-center justify-center text-[10px] font-normal uppercase tracking-normal text-[#626F86]"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              INFOBAR
            </span>
          </aside>
        </main>
        </div>
      </div>
      </div>
    </div>
  );
}
