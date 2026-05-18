import {
  Battery,
  ChartColumnIncreasing,
  ChartGantt,
  ArrowLeft,
  Bookmark,
  Bug,
  ChartNetwork,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  CircleDollarSign,
  CircleDot,
  CornerDownRight,
  Columns2,
  Compass,
  Cog,
  Equal,
  Eye,
  Flag,
  Filter,
  Flame,
  Gauge,
  Highlighter,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Target,
  Undo2,
  Users,
  X,
  Waves,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { RadioGroup } from "@atlaskit/radio";
import { createPortal } from "react-dom";
import { Fragment, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
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
const CAPACITY_METRIC_OPTIONS = ["Story Points", "Man-days"] as const;

/** View → Tasks board scope (non–Goals-only): top-level rows match product chrome; flyouts are prototype stubs. */
const VIEW_TASKS_MENU_KEYS = ["reports-type", "aggregation"] as const;
type ViewTasksMenuKey = (typeof VIEW_TASKS_MENU_KEYS)[number];

const VIEW_TASKS_MENU_LABEL: Record<ViewTasksMenuKey, string> = {
  "reports-type": "Reports type",
  aggregation: "Aggregation",
};

/** View flyout — section + radio row (Reports type / Aggregation panels). */
function ViewFlyoutRadioRow({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-1.5 hover:bg-[#F1F2F4]">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 border-[#DFE1E6] accent-[#0C66E4]"
      />
      <span className="text-sm text-[#172B4D]">{label}</span>
    </label>
  );
}

function ViewFlyoutFieldset({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-b border-[#DFE1E6] px-2 pb-2 pt-2 last:border-b-0">
      <legend className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-[#626F86]">
        {title}
      </legend>
      <div className="flex flex-col">{children}</div>
    </fieldset>
  );
}

function ViewReportsTypeOptionsPanel({
  chartType,
  setChartType,
  dataSource,
  setDataSource,
  groupBy,
  setGroupBy,
  countBy,
  setCountBy,
}: {
  chartType: "pie" | "bar";
  setChartType: (v: "pie" | "bar") => void;
  dataSource: "tasks" | "capacities";
  setDataSource: (v: "tasks" | "capacities") => void;
  groupBy:
    | "status"
    | "assignee"
    | "priority"
    | "status-categories";
  setGroupBy: (
    v: "status" | "assignee" | "priority" | "status-categories",
  ) => void;
  countBy:
    | "tasks"
    | "story-points"
    | "remaining-estimate"
    | "original-estimate";
  setCountBy: (
    v:
      | "tasks"
      | "story-points"
      | "remaining-estimate"
      | "original-estimate",
  ) => void;
}) {
  return (
    <>
      <ViewFlyoutFieldset title="Chart type">
        <ViewFlyoutRadioRow
          name="view-reports-chart"
          label="Pie"
          checked={chartType === "pie"}
          onChange={() => setChartType("pie")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-chart"
          label="Bar"
          checked={chartType === "bar"}
          onChange={() => setChartType("bar")}
        />
      </ViewFlyoutFieldset>
      <ViewFlyoutFieldset title="Data source">
        <ViewFlyoutRadioRow
          name="view-reports-datasource"
          label="Tasks"
          checked={dataSource === "tasks"}
          onChange={() => setDataSource("tasks")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-datasource"
          label="Capacities"
          checked={dataSource === "capacities"}
          onChange={() => setDataSource("capacities")}
        />
      </ViewFlyoutFieldset>
      <ViewFlyoutFieldset title="Group by">
        <ViewFlyoutRadioRow
          name="view-reports-groupby"
          label="Status"
          checked={groupBy === "status"}
          onChange={() => setGroupBy("status")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-groupby"
          label="Assignee"
          checked={groupBy === "assignee"}
          onChange={() => setGroupBy("assignee")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-groupby"
          label="Priority"
          checked={groupBy === "priority"}
          onChange={() => setGroupBy("priority")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-groupby"
          label="Status categories"
          checked={groupBy === "status-categories"}
          onChange={() => setGroupBy("status-categories")}
        />
      </ViewFlyoutFieldset>
      <ViewFlyoutFieldset title="Count">
        <ViewFlyoutRadioRow
          name="view-reports-count"
          label="Tasks"
          checked={countBy === "tasks"}
          onChange={() => setCountBy("tasks")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-count"
          label="Story Points"
          checked={countBy === "story-points"}
          onChange={() => setCountBy("story-points")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-count"
          label="Remaining Estimate"
          checked={countBy === "remaining-estimate"}
          onChange={() => setCountBy("remaining-estimate")}
        />
        <ViewFlyoutRadioRow
          name="view-reports-count"
          label="Original Estimate"
          checked={countBy === "original-estimate"}
          onChange={() => setCountBy("original-estimate")}
        />
      </ViewFlyoutFieldset>
    </>
  );
}

function ViewAggregationOptionsPanel({
  aggType,
  setAggType,
  aggregateBy,
  setAggregateBy,
}: {
  aggType: "none" | "work-progress" | "capacity-allocation";
  setAggType: (v: "none" | "work-progress" | "capacity-allocation") => void;
  aggregateBy:
    | "story-points"
    | "original-estimates"
    | "remaining-estimates";
  setAggregateBy: (
    v: "story-points" | "original-estimates" | "remaining-estimates",
  ) => void;
}) {
  return (
    <>
      <ViewFlyoutFieldset title="Type">
        <ViewFlyoutRadioRow
          name="view-agg-type"
          label="None"
          checked={aggType === "none"}
          onChange={() => setAggType("none")}
        />
        <ViewFlyoutRadioRow
          name="view-agg-type"
          label="Work progress"
          checked={aggType === "work-progress"}
          onChange={() => setAggType("work-progress")}
        />
        <ViewFlyoutRadioRow
          name="view-agg-type"
          label="Capacity allocation"
          checked={aggType === "capacity-allocation"}
          onChange={() => setAggType("capacity-allocation")}
        />
      </ViewFlyoutFieldset>
      <ViewFlyoutFieldset title="Aggregate by">
        <ViewFlyoutRadioRow
          name="view-agg-by"
          label="Story Points"
          checked={aggregateBy === "story-points"}
          onChange={() => setAggregateBy("story-points")}
        />
        <ViewFlyoutRadioRow
          name="view-agg-by"
          label="Original Estimates"
          checked={aggregateBy === "original-estimates"}
          onChange={() => setAggregateBy("original-estimates")}
        />
        <ViewFlyoutRadioRow
          name="view-agg-by"
          label="Remaining Estimates"
          checked={aggregateBy === "remaining-estimates"}
          onChange={() => setAggregateBy("remaining-estimates")}
        />
      </ViewFlyoutFieldset>
    </>
  );
}

/** View → Reports + Goals: top-level rows + flyout stubs (screen 2). */
const VIEW_REPORTS_GOALS_MENU_KEYS = [
  "achievement",
  "reports-type",
] as const;
type ViewReportsGoalsMenuKey =
  (typeof VIEW_REPORTS_GOALS_MENU_KEYS)[number];

const VIEW_REPORTS_GOALS_MENU_LABEL: Record<
  ViewReportsGoalsMenuKey,
  string
> = {
  achievement: "Achievement",
  "reports-type": "Reports Type",
};

const VIEW_REPORTS_GOALS_ACHIEVEMENT_SUBITEMS = [
  "Portfolio rollup",
  "Team breakdown",
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

const SPRINT_LABELS = ["Sprint 1", "Sprint 2"] as const;
const TASK_ROWS_PER_SPRINT = 2;
type SprintIndex = 0 | 1;

function issueKeyForTeamRow(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
  row: number,
): string {
  let h = 0;
  for (let i = 0; i < teamId.length; i++) {
    h = (h * 31 + teamId.charCodeAt(i)) >>> 0;
  }
  const n = h * 11 + teamId.length * 7 + sprintIndex * 13 + row * 17;
  return `ONE-${245900 + (n % 12000)}`;
}

const DEMO_TASK_TITLES = [
  '"+" not showing in some inline edit fields…',
  "Cannot open Column Layout in Overview…",
  "Disallow creating a TEXT custom field wit…",
  "FE: display custom fields in side-panel",
  "Handle changing allowed values in select/…",
  "Regression pass for sprint scope",
  "API rollout hardening",
  "QA checklist for release train",
  "UX review for board swimlanes",
  "Sync dependency graph with Jira",
  "Spike: capacity planning metrics",
  "Fix flaky e2e on merge board",
] as const;

const DEMO_TASK_ASSIGNEES = [
  { initials: "AK", bg: "#E9F2FF", color: "#0C66E4" },
  { initials: "ML", bg: "#F3F0FF", color: "#5E4DB2" },
  { initials: "PB", bg: "#DCFFF1", color: "#164B35" },
  { initials: "JR", bg: "#FFF7D6", color: "#974F0C" },
  { initials: "LS", bg: "#FFECEB", color: "#AE2E24" },
] as const;

type TaskStatus = "To do" | "In progress" | "Done" | "Canceled";
type TaskPriority = "low" | "medium" | "high";
type TaskIssueType = "bug" | "story";

type SwimlaneTaskItem = {
  id: string;
  type: "task";
  issueKey: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  issueType: TaskIssueType;
  points: number;
  assignee: (typeof DEMO_TASK_ASSIGNEES)[number];
  /** Local BigPicture task not linked to Jira. */
  source?: "jira" | "basic";
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i) + 11) >>> 0;
  }
  return h;
}

function pickFromConst<T>(items: readonly T[], seed: string, salt = 0): T {
  const h = hashSeed(`${seed}:${salt}`);
  return items[h % items.length]!;
}

function swimlaneTaskVisualMeta(
  seed: string,
  salt = 0,
): Pick<
  SwimlaneTaskItem,
  "status" | "priority" | "issueType" | "points" | "assignee"
> {
  const h = hashSeed(`${seed}:${salt}`);
  const statuses: TaskStatus[] = [
    "Done",
    "Canceled",
    "In progress",
    "To do",
    "Done",
    "In progress",
  ];
  const priorities: TaskPriority[] = ["low", "low", "medium", "high", "medium"];
  const issueTypes: TaskIssueType[] = ["bug", "bug", "story", "story", "story"];
  return {
    status: statuses[h % statuses.length]!,
    priority: priorities[h % priorities.length]!,
    issueType: issueTypes[h % issueTypes.length]!,
    points: h % 4,
    assignee: pickFromConst(DEMO_TASK_ASSIGNEES, seed, salt + 3),
  };
}

function swimlaneTaskTitle(seed: string, salt = 0): string {
  return pickFromConst(DEMO_TASK_TITLES, seed, salt);
}

function createSwimlaneTask(input: {
  id: string;
  issueKey: string;
  title: string;
  seed: string;
  salt?: number;
  source?: "jira" | "basic";
}): SwimlaneTaskItem {
  return {
    id: input.id,
    type: "task",
    issueKey: input.issueKey,
    title: input.title,
    source: input.source ?? "jira",
    ...swimlaneTaskVisualMeta(input.seed, input.salt ?? 0),
  };
}

function boardScopeLabel(scope: { tasks: boolean; goals: boolean }): string {
  if (scope.tasks && scope.goals) return "Tasks & Goals";
  if (scope.tasks) return "Tasks";
  return "Goals";
}

/** Compact Jira mark matching chrome header tile (`AtlassianTopBar`), scaled for menu rows. */
function JiraIssueMenuIcon() {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-[rgb(24,104,219)]"
      aria-hidden
    >
      <svg width={11} height={11} viewBox="0 0 16 16" fill="none" className="text-white">
        <path
          d="M2 2h5.5v5.5H2V2zm0 6.5h5.5V14H2V8.5zM8.5 2H14v5.5H8.5V2z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

/** Same composition as sidebar BP branding (`BigPictureAppTile` + `BigPictureModuleMark`), half scale for menus. */
function BigPictureTaskMenuIcon() {
  return (
    <span
      className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[3px]"
      aria-hidden
    >
      <BigPictureAppTile className="pointer-events-none absolute inset-0 size-4" />
      <span className="relative z-[1] flex items-center justify-center">
        <BigPictureModuleMark height={11} />
      </span>
    </span>
  );
}

const TASK_STATUS_BADGE: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  "To do": {
    label: "TO DO",
    className: "bg-[#F1F2F4] text-[#44546F]",
  },
  "In progress": {
    label: "IN PROGRESS",
    className: "bg-[#E9F2FF] text-[#0C66E4]",
  },
  Done: {
    label: "DONE",
    className: "bg-[#DCFFF1] text-[#164B35]",
  },
  Canceled: {
    label: "CANCELED",
    className: "bg-[#E6F9ED] text-[#216E4E]",
  },
};

function SwimlaneIssueTypeIcon({ issueType }: { issueType: TaskIssueType }) {
  if (issueType === "bug") {
    return <Bug className="size-4 shrink-0 text-[#E34935]" strokeWidth={2} aria-hidden />;
  }
  return (
    <Bookmark
      className="size-4 shrink-0 fill-emerald-600 text-emerald-600"
      aria-hidden
    />
  );
}

function SwimlanePriorityIcon({ priority }: { priority: TaskPriority }) {
  if (priority === "low") {
    return (
      <ChevronDown
        className="size-4 shrink-0 text-[#0C66E4]"
        strokeWidth={2.5}
        aria-hidden
      />
    );
  }
  if (priority === "high") {
    return (
      <ChevronsUp
        className="size-4 shrink-0 text-[#E56910]"
        strokeWidth={2.5}
        aria-hidden
      />
    );
  }
  return (
    <Equal className="size-4 shrink-0 text-[#E56910]" strokeWidth={2.5} aria-hidden />
  );
}

function SwimlaneAssigneeAvatar({
  assignee,
}: {
  assignee: SwimlaneTaskItem["assignee"];
}) {
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none"
      style={{ backgroundColor: assignee.bg, color: assignee.color }}
      aria-label={`Assignee ${assignee.initials}`}
      title={assignee.initials}
    >
      {assignee.initials}
    </span>
  );
}

function SwimlaneIssueCard({ task }: { task: SwimlaneTaskItem }) {
  const statusBadge = TASK_STATUS_BADGE[task.status];
  const isBasic = task.source === "basic";
  return (
    <div className="w-full rounded-md border border-[#DFE1E6] bg-white p-2.5 shadow-[0_1px_2px_rgba(9,30,66,0.15)]">
      <div className="flex items-center gap-1.5">
        <SwimlaneIssueTypeIcon issueType={task.issueType} />
        {isBasic ? (
          <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
            <BigPictureTaskMenuIcon />
            <span className="truncate text-sm font-semibold text-[#626F86]">
              Basic task
            </span>
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0C66E4]">
            {task.issueKey}
          </span>
        )}
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            statusBadge.className,
          )}
        >
          {statusBadge.label}
        </span>
        <SwimlaneAssigneeAvatar assignee={task.assignee} />
      </div>
      <div className="mt-1.5 flex items-start gap-1.5">
        <SwimlanePriorityIcon priority={task.priority} />
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-[#172B4D] line-clamp-2">
          {task.title}
        </span>
      </div>
      <div className="mt-1.5 text-xs font-semibold tabular-nums text-[#44546F]">
        {task.points}
      </div>
    </div>
  );
}

/** Reports donut statuses: gray / blue / green (prototype aggregation). */
const REPORT_VIEW_STATUS_ORDER = [
  { label: "Not started", color: "#8993A4" },
  { label: "In progress", color: "#0C66E4" },
  { label: "Done", color: "#36B37E" },
] as const;

function reportViewSegmentsForTasks(
  tasks: { issueKey: string }[],
): { label: string; color: string; count: number }[] {
  if (tasks.length === 0) return [];
  if (tasks.length === 1) {
    return [{ label: "Not started", color: "#8993A4", count: 1 }];
  }
  const counts = new Map<string, { color: string; count: number }>();
  for (const t of tasks) {
    let h = 0;
    const keyForHash = t.issueKey || "basic";
    for (let i = 0; i < keyForHash.length; i++) {
      h = (h * 31 + keyForHash.charCodeAt(i)) >>> 0;
    }
    const meta = REPORT_VIEW_STATUS_ORDER[h % REPORT_VIEW_STATUS_ORDER.length];
    const cur = counts.get(meta.label);
    if (cur) cur.count += 1;
    else counts.set(meta.label, { color: meta.color, count: 1 });
  }
  return REPORT_VIEW_STATUS_ORDER.filter((m) => counts.has(m.label)).map(
    (m) => ({
      label: m.label,
      color: counts.get(m.label)!.color,
      count: counts.get(m.label)!.count,
    }),
  );
}

function reportViewConicGradient(
  segments: { color: string; count: number }[],
  total: number,
): string {
  if (segments.length === 0) return "conic-gradient(#DFE1E6 0deg 360deg)";
  let deg = 0;
  const stops: string[] = [];
  for (const s of segments) {
    const sweep = (s.count / total) * 360;
    const next = deg + sweep;
    stops.push(`${s.color} ${deg}deg ${next}deg`);
    deg = next;
  }
  return `conic-gradient(${stops.join(", ")})`;
}

/** Goal completion % → same three-status palette as task donuts. */
const REPORT_GOAL_BUCKET_ORDER = [
  {
    label: "Not started",
    color: "#8993A4",
    test: (p: number) => p < 34,
  },
  {
    label: "In progress",
    color: "#0C66E4",
    test: (p: number) => p >= 34 && p < 85,
  },
  { label: "Done", color: "#36B37E", test: (p: number) => p >= 85 },
] as const;

function reportViewSegmentsForGoals(
  goals: { percent: number }[],
): { label: string; color: string; count: number }[] {
  if (goals.length === 0) return [];
  const counts = new Map<string, { color: string; count: number }>();
  for (const g of goals) {
    const bucket =
      REPORT_GOAL_BUCKET_ORDER.find((b) => b.test(g.percent)) ??
      REPORT_GOAL_BUCKET_ORDER[REPORT_GOAL_BUCKET_ORDER.length - 1];
    const cur = counts.get(bucket.label);
    if (cur) cur.count += 1;
    else counts.set(bucket.label, { color: bucket.color, count: 1 });
  }
  return REPORT_GOAL_BUCKET_ORDER.filter((b) => counts.has(b.label)).map(
    (b) => ({
      label: b.label,
      color: counts.get(b.label)!.color,
      count: counts.get(b.label)!.count,
    }),
  );
}

/** Reports view: shared donut + legend (centered row). */
function SwimlaneReportDonutCard({
  segments,
  total,
  ariaLabel,
}: {
  segments: { label: string; color: string; count: number }[];
  total: number;
  ariaLabel: string;
}) {
  const singleSlice = segments.length === 1 && segments[0].count === total;

  return (
    <div
      className="flex min-h-[138px] w-full rounded-md border border-[#DFE1E6] bg-[#F4F5F7] px-3 py-3 shadow-[0_1px_2px_rgba(9,30,66,0.15)]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex w-full flex-wrap items-center justify-center gap-4">
        <div className="relative grid size-[112px] shrink-0 place-items-center">
          <div
            className="col-start-1 row-start-1 size-[112px] rounded-full"
            style={{
              background: reportViewConicGradient(segments, total),
            }}
          />
          <div className="col-start-1 row-start-1 flex size-[72px] flex-col items-center justify-center rounded-full bg-[#F4F5F7] text-center">
            <span className="text-[11px] font-medium leading-none text-[#626F86]">
              Total
            </span>
            <span className="text-lg font-semibold leading-tight text-[#172B4D]">
              {total}
            </span>
          </div>
          {singleSlice ? (
            <span
              className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold leading-none text-white drop-shadow-[0_1px_1px_rgba(9,30,66,0.45)]"
              aria-hidden
            >
              100%
            </span>
          ) : null}
        </div>
        <ul className="flex shrink-0 flex-col gap-1.5 py-0.5">
          {segments.map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2 text-sm text-[#172B4D]"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SwimlaneSprintTasksDonut({
  tasks,
}: {
  tasks: { issueKey: string }[];
}) {
  const segments = reportViewSegmentsForTasks(tasks);
  const total = tasks.length;
  return (
    <SwimlaneReportDonutCard
      segments={segments}
      total={total}
      ariaLabel={`Task status breakdown: ${segments.map((s) => `${s.label} ${Math.round((s.count / total) * 100)}%`).join(", ")}`}
    />
  );
}

function SwimlaneSprintGoalsDonut({
  goals,
}: {
  goals: { percent: number }[];
}) {
  const segments = reportViewSegmentsForGoals(goals);
  const total = goals.length;
  return (
    <SwimlaneReportDonutCard
      segments={segments}
      total={total}
      ariaLabel={`Goal health breakdown: ${segments.map((s) => `${s.label} ${Math.round((s.count / total) * 100)}%`).join(", ")}`}
    />
  );
}

/** Reports view: empty sprint cell — no task cards ⇒ no status donut. */
function ReportsSprintTasksReportEmptySplash({ sprintCol }: { sprintCol: number }) {
  return (
    <div
      className="flex min-h-[138px] w-full items-center justify-center rounded-md border border-[#DFE1E6] bg-white px-4 text-center shadow-[0_1px_2px_rgba(9,30,66,0.06)]"
      role="status"
      aria-live="polite"
      aria-label={`Sprint ${sprintCol}: no tasks to report`}
    >
      <p className="text-[15px] leading-normal text-[#172B4D]">
        No tasks to report. Display a chart by{" "}
        <span className="font-medium text-[#0C66E4]">adding the first one</span>
        .
      </p>
    </div>
  );
}

/** Parent outcome goals — unique per team × sprint via pickFromConst seed. */
const SWIMLANE_GOAL_TEXT_TITLES = [
  "Ship consolidated PI reporting",
  "Cut average cycle time by 20%",
  "Raise NPS on planning workflows",
  "Deliver AI-assisted roadmap views",
  "Stabilize cross-team dependency map",
  "Reduce escaped defects in release train",
  "Hit quarterly committed value (PBV)",
  "Improve capacity forecast accuracy",
  "Finish platform integration milestone",
  "Expand self-serve board configuration",
] as const;

/** KR / outcome group rows (separator). */
const SWIMLANE_GOAL_SEPARATOR_TITLES = [
  'KR-2736 — AI Assistant in BigPicture by 2026',
  "KR-2810 — Self-serve portfolio setup",
  "KR-2901 — Enterprise access controls",
  "KR-2944 — Goals ↔ Jira traceability",
  "KR-3012 — Executive report under 5 min",
  "KR-3088 — Mobile-ready planning views",
  "KR-3155 — Capacity planning at scale",
  "KR-3202 — Risk heatmap in swimlanes",
  "KR-3271 — OKR rollup for leadership",
  "KR-3319 — Automated dependency alerts",
] as const;

/** Linked Jira work under a goal group. */
const SWIMLANE_GOAL_JIRA_TITLES = [
  "[FE] Users can access and continue saved views",
  "Disallow TEXT custom field without validation",
  "Handle allowed-value changes in select fields",
  "FE: display custom fields in side panel",
  "Cannot open Column Layout in Overview mode",
  "Sync sprint capacity with team calendars",
  "Add bulk edit for swimlane assignments",
  "Improve load time on large boards",
  "Expose goal progress in team dashboard",
  "Fix drag-and-drop between sprint columns",
  "Support read-only guests on shared boards",
  "Migrate legacy goal keys to new schema",
  "Validate PBV rollup against child issues",
  "Surface blockers on dependency edges",
  "Align status categories with Jira workflow",
] as const;

/** User-added goals from the + control — separate pool from seeded rows. */
const SWIMLANE_GOAL_EXTRA_TITLES = [
  "Adopt quarterly outcome planning",
  "Pilot value stream mapping",
  "Standardize definition of done",
  "Track unplanned work ratio",
  "Improve sprint commitment reliability",
  "Document cross-team interfaces",
  "Reduce WIP limits violations",
  "Measure flow efficiency weekly",
] as const;

function swimlaneGoalTextTitle(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
): string {
  return pickFromConst(
    SWIMLANE_GOAL_TEXT_TITLES,
    `${teamId}:goals:text`,
    sprintIndex,
  );
}

function swimlaneGoalSeparatorTitle(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
): string {
  return pickFromConst(
    SWIMLANE_GOAL_SEPARATOR_TITLES,
    `${teamId}:goals:sep`,
    sprintIndex,
  );
}

function swimlaneGoalJiraTitle(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
  childIndex: number,
): string {
  return pickFromConst(
    SWIMLANE_GOAL_JIRA_TITLES,
    `${teamId}:goals:jira`,
    sprintIndex * 10 + childIndex,
  );
}

type GoalProgressState = "complete" | "at-risk" | "in-progress";

type SwimlaneGoalTextRow = {
  id: string;
  type: "goal";
  kind: "text";
  title: string;
  percent: number;
  pbv: number;
  abv: number;
  progressState: GoalProgressState;
  children?: SwimlaneGoalJiraRow[];
};

type SwimlaneGoalJiraRow = {
  id: string;
  type: "goal";
  kind: "jira";
  issueKey: string;
  title: string;
  workflowStatus: string;
  workflowTone: "blue" | "green" | "lime" | "dark";
  percent: number;
  pbv: number;
  abv: number;
  assignee: (typeof DEMO_TASK_ASSIGNEES)[number];
  progressState: GoalProgressState;
  issueType: TaskIssueType;
};

type SwimlaneGoalSeparatorRow = {
  id: string;
  type: "goal";
  kind: "separator";
  title: string;
  percent: number;
  pbv: number;
  abv: number;
  progressState: GoalProgressState;
  children?: SwimlaneGoalJiraRow[];
};

function separatorMetricsFromChildren(
  children: SwimlaneGoalJiraRow[],
): Pick<SwimlaneGoalSeparatorRow, "percent" | "pbv" | "abv" | "progressState"> {
  if (children.length === 0) {
    return { percent: 0, pbv: 0, abv: 0, progressState: "in-progress" };
  }
  const percent = Math.round(
    children.reduce((sum, child) => sum + child.percent, 0) / children.length,
  );
  const progressState: GoalProgressState = children.some(
    (child) => child.progressState === "at-risk",
  )
    ? "at-risk"
    : percent >= 100
      ? "complete"
      : "in-progress";
  return { percent, pbv: 0, abv: 0, progressState };
}

type SwimlaneGoalTableGroup =
  | (SwimlaneGoalTextRow & { children: SwimlaneGoalJiraRow[] })
  | (SwimlaneGoalSeparatorRow & { children: SwimlaneGoalJiraRow[] });

type SwimlaneGoalItem =
  | SwimlaneGoalTextRow
  | SwimlaneGoalJiraRow
  | SwimlaneGoalSeparatorRow;

type SwimlaneStackItem = SwimlaneTaskItem | SwimlaneGoalItem;

const GOAL_WORKFLOW_STATUS_CLASS: Record<string, string> = {
  ACCEPTANCE: "bg-[#E9F2FF] text-[#0C66E4]",
  "WAITING FOR RELEASE": "bg-[#E3FCEF] text-[#216E4E]",
  DONE: "bg-[#DCFFF1] text-[#164B35]",
  "IN PROGRESS": "bg-[#0747A6] text-white",
};

function goalProgressStateFromPercent(
  percent: number,
  salt: number,
): GoalProgressState {
  if (percent >= 100) return "complete";
  if (percent > 0 && percent < 75 && salt % 4 === 0) return "at-risk";
  return "in-progress";
}

function goalProgressBarColor(state: GoalProgressState, percent: number): string {
  if (state === "complete" || percent >= 100) return "#36B37E";
  if (state === "at-risk") return "#E34935";
  if (percent === 0) return "#DFE1E6";
  return "#0C66E4";
}

function goalRowBackground(state: GoalProgressState): string {
  if (state === "complete") return "bg-[#E3FCEF]/60";
  if (state === "at-risk") return "bg-[#FFEBE6]/80";
  return "bg-white";
}

function enrichSwimlaneGoal(
  item: Extract<SwimlaneStackItem, { type: "goal" }>,
  salt = 0,
): SwimlaneGoalItem {
  if ("kind" in item && item.kind) return item as SwimlaneGoalItem;
  const legacy = item as { id: string; type: "goal"; title: string; percent: number };
  const progressState = goalProgressStateFromPercent(legacy.percent, salt);
  return {
    id: legacy.id,
    type: "goal",
    kind: "text",
    title: legacy.title,
    percent: legacy.percent,
    pbv: 0,
    abv: 0,
    progressState,
  };
}

function nestGoalRows(flat: SwimlaneGoalItem[]): SwimlaneGoalTableGroup[] {
  const groups: SwimlaneGoalTableGroup[] = [];
  let current: SwimlaneGoalTableGroup | null = null;

  for (const row of flat) {
    if (row.kind === "text") {
      current = { ...row, children: [] };
      groups.push(current);
      continue;
    }
    if (row.kind === "separator") {
      current = { ...row, children: [] };
      groups.push(current);
      continue;
    }
    if (row.kind === "jira" && current) {
      current.children.push(row);
    }
  }

  for (const group of groups) {
    if (group.kind === "separator") {
      Object.assign(group, separatorMetricsFromChildren(group.children));
    }
  }

  return groups;
}

function flattenGoalGroups(groups: SwimlaneGoalTableGroup[]): SwimlaneGoalItem[] {
  const out: SwimlaneGoalItem[] = [];
  for (const group of groups) {
    const { children, ...parent } = group;
    out.push(parent as SwimlaneGoalItem);
    out.push(...children);
  }
  return out;
}

type GoalContextWorkflowStatus =
  | "open"
  | "completed"
  | "failed"
  | "abandoned";

const GOAL_CONTEXT_STATUS_ITEMS: {
  id: GoalContextWorkflowStatus;
  label: string;
}[] = [
  { id: "open", label: "Open" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
  { id: "abandoned", label: "Abandoned" },
];

const GOAL_CONTEXT_ACTION_ITEMS = [
  "Continue",
  "Set as uncommitted",
  "Details",
  "Add associated work",
  "Remove",
] as const;

function defaultGoalContextWorkflowStatus(
  progressState: GoalProgressState,
  percent: number,
): GoalContextWorkflowStatus {
  if (progressState === "complete" || percent >= 100) return "completed";
  if (progressState === "at-risk") return "failed";
  return "open";
}

function patchSwimlaneGoalJiraRowFromContextStatus(
  row: SwimlaneGoalJiraRow,
  status: GoalContextWorkflowStatus,
): SwimlaneGoalJiraRow {
  switch (status) {
    case "completed":
      return {
        ...row,
        progressState: "complete",
        percent: 100,
        workflowStatus: "DONE",
        workflowTone: "green",
      };
    case "open": {
      const nextPercent =
        row.percent >= 100 ? 45 : row.percent < 1 ? 28 : Math.min(row.percent, 90);
      return {
        ...row,
        progressState: "in-progress",
        percent: nextPercent,
        workflowStatus: "IN PROGRESS",
        workflowTone: "dark",
      };
    }
    case "failed": {
      const nextPercent =
        row.percent >= 100 ? 55 : Math.min(Math.max(row.percent, 15), 72);
      return {
        ...row,
        progressState: "at-risk",
        percent: nextPercent,
        workflowStatus: "IN PROGRESS",
        workflowTone: "dark",
      };
    }
    case "abandoned":
      return {
        ...row,
        progressState: "in-progress",
        percent: 0,
        workflowStatus: "ACCEPTANCE",
        workflowTone: "blue",
      };
    default:
      return row;
  }
}

function patchSwimlaneGoalNonJiraFromContextStatus(
  row: SwimlaneGoalTextRow | SwimlaneGoalSeparatorRow,
  status: GoalContextWorkflowStatus,
): SwimlaneGoalTextRow | SwimlaneGoalSeparatorRow {
  switch (status) {
    case "completed":
      return { ...row, progressState: "complete", percent: 100 };
    case "open": {
      const nextPercent =
        row.percent >= 100 ? 40 : row.percent < 1 ? 30 : Math.min(row.percent, 90);
      return { ...row, progressState: "in-progress", percent: nextPercent };
    }
    case "failed": {
      const nextPercent =
        row.percent >= 100 ? 50 : Math.min(Math.max(row.percent, 12), 72);
      return { ...row, progressState: "at-risk", percent: nextPercent };
    }
    case "abandoned":
      return { ...row, progressState: "in-progress", percent: 0 };
    default:
      return row;
  }
}

function applyGoalContextWorkflowToStackItem(
  item: Extract<SwimlaneStackItem, { type: "goal" }>,
  status: GoalContextWorkflowStatus,
): SwimlaneGoalItem {
  const resolved: SwimlaneGoalItem =
    "kind" in item && item.kind
      ? (item as SwimlaneGoalItem)
      : enrichSwimlaneGoal(item, 0);
  if (resolved.kind === "jira") {
    return patchSwimlaneGoalJiraRowFromContextStatus(resolved, status);
  }
  if (resolved.kind === "text" || resolved.kind === "separator") {
    return patchSwimlaneGoalNonJiraFromContextStatus(resolved, status);
  }
  return resolved;
}

function createSprintGoalRows(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
): SwimlaneGoalTableGroup[] {
  const s = `${teamId}:goals:${sprintIndex}`;
  const pickStatus = (i: number) =>
    (["ACCEPTANCE", "WAITING FOR RELEASE", "DONE", "IN PROGRESS"] as const)[
      (hashSeed(`${s}:wf:${i}`) + i) % 4
    ]!;
  const jira1 = (() => {
    const percent = 0;
    return {
      id: `goal-jira-${s}-1`,
      type: "goal" as const,
      kind: "jira" as const,
      issueKey: `ONE-${257600 + hashSeed(`${s}:1`) % 200}`,
      title: swimlaneGoalJiraTitle(teamId, sprintIndex, 1),
      workflowStatus: pickStatus(1),
      workflowTone: "blue" as const,
      percent,
      pbv: 0,
      abv: 0,
      assignee: pickFromConst(DEMO_TASK_ASSIGNEES, s, 1),
      progressState: goalProgressStateFromPercent(percent, 1),
      issueType: "story" as const,
    };
  })();
  const jira2 = (() => {
    const percent = 100;
    return {
      id: `goal-jira-${s}-2`,
      type: "goal" as const,
      kind: "jira" as const,
      issueKey: `ONE-${256400 + hashSeed(`${s}:2`) % 200}`,
      title: swimlaneGoalJiraTitle(teamId, sprintIndex, 2),
      workflowStatus: "WAITING FOR RELEASE",
      workflowTone: "lime" as const,
      percent,
      pbv: 0,
      abv: 0,
      assignee: pickFromConst(DEMO_TASK_ASSIGNEES, s, 2),
      progressState: "complete" as const,
      issueType: "story" as const,
    };
  })();
  const jira3 = (() => {
    const percent = 100;
    return {
      id: `goal-jira-${s}-3`,
      type: "goal" as const,
      kind: "jira" as const,
      issueKey: `ONE-${255000 + hashSeed(`${s}:3`) % 200}`,
      title: swimlaneGoalJiraTitle(teamId, sprintIndex, 3),
      workflowStatus: "DONE",
      workflowTone: "green" as const,
      percent,
      pbv: 0,
      abv: 0,
      assignee: pickFromConst(DEMO_TASK_ASSIGNEES, s, 3),
      progressState: "complete" as const,
      issueType: "story" as const,
    };
  })();
  const jira4 = (() => {
    const percent = 80;
    return {
      id: `goal-jira-${s}-4`,
      type: "goal" as const,
      kind: "jira" as const,
      issueKey: `ONE-${256600 + hashSeed(`${s}:4`) % 200}`,
      title: swimlaneGoalJiraTitle(teamId, sprintIndex, 4),
      workflowStatus: "IN PROGRESS",
      workflowTone: "dark" as const,
      percent,
      pbv: 0,
      abv: 0,
      assignee: pickFromConst(DEMO_TASK_ASSIGNEES, s, 4),
      progressState: "in-progress" as const,
      issueType: "story" as const,
    };
  })();
  const jira5 = (() => {
    const percent = 70;
    return {
      id: `goal-jira-${s}-5`,
      type: "goal" as const,
      kind: "jira" as const,
      issueKey: `ONE-${255200 + hashSeed(`${s}:5`) % 200}`,
      title: swimlaneGoalJiraTitle(teamId, sprintIndex, 5),
      workflowStatus: "ACCEPTANCE",
      workflowTone: "blue" as const,
      percent,
      pbv: 0,
      abv: 0,
      assignee: pickFromConst(DEMO_TASK_ASSIGNEES, s, 5),
      progressState: "at-risk" as const,
      issueType: "bug" as const,
    };
  })();

  return [
    {
      id: `goal-text-${s}-0`,
      type: "goal",
      kind: "text",
      title: swimlaneGoalTextTitle(teamId, sprintIndex),
      percent: 100,
      pbv: 0,
      abv: 0,
      progressState: "complete",
      children: [jira1, jira2],
    },
    (() => {
      const children = [jira3, jira4, jira5];
      return {
        id: `goal-sep-${s}`,
        type: "goal" as const,
        kind: "separator" as const,
        title: swimlaneGoalSeparatorTitle(teamId, sprintIndex),
        children,
        ...separatorMetricsFromChildren(children),
      };
    })(),
  ];
}

function enrichSwimlaneTask(
  task: Extract<SwimlaneStackItem, { type: "task" }>,
  salt = 0,
): SwimlaneTaskItem {
  if (
    "status" in task &&
    "priority" in task &&
    "issueType" in task &&
    "assignee" in task &&
    task.status &&
    task.priority &&
    task.issueType &&
    task.assignee
  ) {
    return task as SwimlaneTaskItem;
  }
  return createSwimlaneTask({
    id: task.id,
    issueKey: task.issueKey,
    title: task.title,
    seed: `${task.issueKey}:${task.title}`,
    salt,
  });
}

type SwimlaneTaskColumns = [SwimlaneStackItem[], SwimlaneStackItem[]];

type SwimlaneSprintCell = {
  taskColumns: SwimlaneTaskColumns;
  goals: SwimlaneStackItem[];
};

type SwimlaneCellStacks = Record<
  TeamFilterId,
  [SwimlaneSprintCell, SwimlaneSprintCell]
>;

function emptySprintCell(): SwimlaneSprintCell {
  return { taskColumns: [[], []], goals: [] };
}

function sprintCellItems(cell: SwimlaneSprintCell): SwimlaneStackItem[] {
  return [...cell.taskColumns[0], ...cell.taskColumns[1], ...cell.goals];
}

function normalizeSprintCell(raw: unknown): SwimlaneSprintCell {
  if (
    raw &&
    typeof raw === "object" &&
    "taskColumns" in raw &&
    Array.isArray((raw as SwimlaneSprintCell).taskColumns)
  ) {
    const cell = raw as SwimlaneSprintCell;
    const mapCol = (col: SwimlaneStackItem[], salt: number) =>
      Array.isArray(col)
        ? col.map((item, i) =>
            item.type === "task" ? enrichSwimlaneTask(item, salt + i) : item,
          )
        : [];
    return {
      taskColumns: [
        mapCol(cell.taskColumns[0], 0),
        mapCol(cell.taskColumns[1], 10),
      ],
      goals: Array.isArray(cell.goals)
        ? cell.goals.map((item, i) =>
            item.type === "goal" ? enrichSwimlaneGoal(item, i) : item,
          )
        : [],
    };
  }

  if (!Array.isArray(raw)) return emptySprintCell();

  const tasks = raw.filter(
    (x): x is Extract<SwimlaneStackItem, { type: "task" }> =>
      x != null && typeof x === "object" && (x as SwimlaneStackItem).type === "task",
  );
  const goals = raw.filter(
    (x): x is Extract<SwimlaneStackItem, { type: "goal" }> =>
      x != null && typeof x === "object" && (x as SwimlaneStackItem).type === "goal",
  );
  const taskColumns: SwimlaneTaskColumns = [[], []];
  for (const [i, task] of tasks.entries()) {
    const targetCol =
      taskColumns[0].length <= taskColumns[1].length ? 0 : 1;
    taskColumns[targetCol].push(enrichSwimlaneTask(task, i));
  }
  return { taskColumns, goals };
}

function normalizeTeamSprints(
  row: unknown,
): [SwimlaneSprintCell, SwimlaneSprintCell] {
  if (!Array.isArray(row)) {
    return [emptySprintCell(), emptySprintCell()];
  }
  if (row.length >= 2 && row[0] != null && typeof row[0] === "object") {
    return [normalizeSprintCell(row[0]), normalizeSprintCell(row[1])];
  }
  return [emptySprintCell(), emptySprintCell()];
}

/** Two vertical task stacks side by side under each sprint. */
function SwimlaneTaskColumns({ columns }: { columns: SwimlaneTaskColumns }) {
  return (
    <div className="grid grid-cols-2 items-start gap-2">
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="flex min-w-0 flex-col gap-2">
          {column.map((item) =>
            item.type === "task" ? (
              <SwimlaneIssueCard
                key={item.id}
                task={enrichSwimlaneTask(item)}
              />
            ) : null,
          )}
        </div>
      ))}
    </div>
  );
}

/** Extra goal rows in a cell (salt = occurrence index). */
function extraGoalFromSalt(
  teamId: TeamFilterId,
  sprintIndex: SprintIndex,
  salt: number,
): { title: string; percent: number } {
  const h = hashSeed(`${teamId}:${sprintIndex}:extra:${salt}`);
  return {
    title: pickFromConst(
      SWIMLANE_GOAL_EXTRA_TITLES,
      `${teamId}:goals:extra`,
      salt + sprintIndex * 3,
    ),
    percent: 12 + (h % 86),
  };
}

function createInitialSwimlaneStacks(): SwimlaneCellStacks {
  const out = {} as SwimlaneCellStacks;
  for (const t of ALL_MENU_TEAMS) {
    const sprints: [SwimlaneSprintCell, SwimlaneSprintCell] = [
      emptySprintCell(),
      emptySprintCell(),
    ];
    for (const sprintIdx of [0, 1] as const) {
      for (let col = 0; col < TASK_ROWS_PER_SPRINT; col++) {
        const seed = `${t.id}:${sprintIdx}:${col}`;
        sprints[sprintIdx].taskColumns[col as 0 | 1].push(
          createSwimlaneTask({
            id: `seed-task-${t.id}-${sprintIdx}-${col}`,
            issueKey: issueKeyForTeamRow(t.id, sprintIdx, col),
            title: swimlaneTaskTitle(seed, col),
            seed,
            salt: col,
          }),
        );
      }
      sprints[sprintIdx].goals = flattenGoalGroups(
        createSprintGoalRows(t.id, sprintIdx),
      );
    }
    out[t.id] = sprints;
  }
  return out;
}

function SwimlaneGoalProgressCell({
  percent,
  progressState,
}: {
  percent: number;
  progressState: GoalProgressState;
}) {
  const barColor = goalProgressBarColor(progressState, percent);
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <div
        className="h-1 min-w-[36px] flex-1 overflow-hidden rounded-full bg-[#DFE1E6]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="shrink-0 tabular-nums text-[11px] text-[#44546F]">
        {percent} %
      </span>
    </div>
  );
}

function SwimlaneGoalStatusIcon({ state }: { state: GoalProgressState }) {
  if (state === "complete") {
    return (
      <span
        className="flex size-5 items-center justify-center text-[#22A06B]/80"
        aria-label="Complete"
      >
        <Check className="size-3.5" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  if (state === "at-risk") {
    return (
      <span
        className="flex size-5 items-center justify-center text-[#C9372C]/75"
        aria-label="At risk"
      >
        <X className="size-3.5" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  return <span className="block size-5" aria-hidden />;
}


function sprintGoalTableRows(
  goals: SwimlaneStackItem[],
  teamId: TeamFilterId,
  sprintIdx: SprintIndex,
): SwimlaneGoalTableGroup[] {
  const enriched = goals
    .filter(
      (g): g is Extract<SwimlaneStackItem, { type: "goal" }> => g.type === "goal",
    )
    .map((g, i) => enrichSwimlaneGoal(g, i));
  return enriched.length > 0
    ? nestGoalRows(enriched)
    : createSprintGoalRows(teamId, sprintIdx);
}

function isSwimlaneGoalDone(item: SwimlaneGoalItem): boolean {
  return item.progressState === "complete" || item.percent >= 100;
}

/** Matches goal rows shown in the swimlane Goals table (including demo data when empty). */
function sprintGoalsCompletionStats(
  teamId: TeamFilterId,
  sprintIdx: SprintIndex,
  cell: SwimlaneSprintCell,
): { done: number; total: number; pct: number } {
  const groups = sprintGoalTableRows(cell.goals, teamId, sprintIdx);
  const flat = flattenGoalGroups(groups);
  const total = flat.length;
  const done = flat.filter(isSwimlaneGoalDone).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function SwimlaneTeamSprintGoalStat({
  teamId,
  teamLabel,
  sprintIdx,
  stacks,
}: {
  teamId: TeamFilterId;
  teamLabel: string;
  sprintIdx: SprintIndex;
  stacks: SwimlaneCellStacks;
}) {
  const cell = normalizeSprintCell(stacks[teamId]?.[sprintIdx]);
  const { done, total, pct } = sprintGoalsCompletionStats(
    teamId,
    sprintIdx,
    cell,
  );
  return (
    <div
      className="shrink-0 text-right text-xs tabular-nums text-[#172B4D]"
      aria-label={`${SPRINT_LABELS[sprintIdx]} goals for ${teamLabel}: ${done} of ${total} complete, ${pct} percent`}
    >
      <span className="font-medium">{done}/{total}</span>
      <span className="text-[#626F86]"> {pct}%</span>
    </div>
  );
}

function SwimlaneGoalsTable({
  rows,
  onGoalContextStatusCommit,
}: {
  rows: SwimlaneGoalTableGroup[];
  onGoalContextStatusCommit?: (
    goalId: string,
    status: GoalContextWorkflowStatus,
  ) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(rows.map((row) => row.id)),
  );
  const goalContextMenuRef = useRef<HTMLDivElement>(null);
  const [goalContextMenu, setGoalContextMenu] = useState<null | {
    x: number;
    y: number;
    goalId: string;
    title: string;
  }>(null);
  const [goalContextWorkflowStatus, setGoalContextWorkflowStatus] =
    useState<GoalContextWorkflowStatus>("open");

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openGoalContextMenu = (
    e: ReactMouseEvent,
    meta: {
      id: string;
      title: string;
      progressState: GoalProgressState;
      percent: number;
    },
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const menuW = 200;
    const menuH = 360;
    const x = Math.max(8, Math.min(e.clientX, window.innerWidth - menuW - 8));
    const y = Math.max(8, Math.min(e.clientY, window.innerHeight - menuH - 8));
    setGoalContextMenu({
      x,
      y,
      goalId: meta.id,
      title: meta.title,
    });
    setGoalContextWorkflowStatus(
      defaultGoalContextWorkflowStatus(meta.progressState, meta.percent),
    );
  };

  useEffect(() => {
    if (!goalContextMenu) return;
    const close = () => setGoalContextMenu(null);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
    };
    const onPointerDown = (ev: PointerEvent) => {
      const el = goalContextMenuRef.current;
      if (el?.contains(ev.target as Node)) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [goalContextMenu]);

  const renderJiraRow = (row: SwimlaneGoalJiraRow, nested: boolean) => {
    const bg = goalRowBackground(row.progressState);
    return (
      <tr
        key={row.id}
        className={cn("border-b border-[#EBECF0] last:border-b-0", bg)}
        onContextMenu={(e) =>
          openGoalContextMenu(e, {
            id: row.id,
            title: row.title,
            progressState: row.progressState,
            percent: row.percent,
          })
        }
      >
        <td className={cn("px-2 py-1.5 align-middle", nested && "pl-6")}>
          <div className="flex min-w-0 items-center gap-1">
            <SwimlaneIssueTypeIcon issueType={row.issueType} />
            <span className="shrink-0 text-xs font-semibold text-[#0C66E4]">
              {row.issueKey}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-[#172B4D]">
              {row.title}
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase leading-none",
                GOAL_WORKFLOW_STATUS_CLASS[row.workflowStatus] ??
                  "bg-[#F1F2F4] text-[#44546F]",
              )}
            >
              {row.workflowStatus}
            </span>
            <SwimlaneAssigneeAvatar assignee={row.assignee} />
          </div>
        </td>
        <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
          {row.pbv}
        </td>
        <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
          {row.abv === 0 ? "" : row.abv}
        </td>
        <td className="px-2 py-1.5 align-middle">
          <SwimlaneGoalProgressCell
            percent={row.percent}
            progressState={row.progressState}
          />
        </td>
        <td className="px-1 py-1.5 align-middle">
          <SwimlaneGoalStatusIcon state={row.progressState} />
        </td>
      </tr>
    );
  };

  const renderExpandChevron = (id: string, isExpanded: boolean) => (
    <button
      type="button"
      className="flex size-4 shrink-0 items-center justify-center rounded hover:bg-[#EBECF0]"
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
      onClick={() => toggleExpanded(id)}
    >
      <ChevronRight
        className={cn(
          "size-3.5 text-[#626F86] transition-transform",
          isExpanded && "rotate-90",
        )}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );

  return (
    <>
      <div className="w-full overflow-hidden rounded-md border border-[#DFE1E6] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.06)]">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="min-w-0" />
            <col className="w-9" />
            <col className="w-9" />
            <col className="w-[92px]" />
            <col className="w-7" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#DFE1E6] bg-[#F7F8F9] text-[10px] font-bold uppercase tracking-wide text-[#626F86]">
              <th className="px-2 py-1.5 font-bold">Goals</th>
              <th className="px-1 py-1.5 text-right font-bold">PBV</th>
              <th className="px-1 py-1.5 text-right font-bold">ABV</th>
              <th className="px-2 py-1.5 font-bold">Progress</th>
              <th className="px-1 py-1.5" aria-label="Status" />
            </tr>
          </thead>
          <tbody>
            {rows.map((group) => {
              const isExpanded = expanded.has(group.id);
              const hasChildren = group.children.length > 0;

              if (group.kind === "separator") {
                const sepBg = goalRowBackground(group.progressState);
                return (
                  <Fragment key={group.id}>
                    <tr
                      className={cn("border-b border-[#EBECF0]", sepBg)}
                      onContextMenu={(e) =>
                        openGoalContextMenu(e, {
                          id: group.id,
                          title: group.title,
                          progressState: group.progressState,
                          percent: group.percent,
                        })
                      }
                    >
                      <td className="min-w-0 px-2 py-1.5 align-middle">
                        <span
                          className="block w-full truncate text-xs font-medium text-[#172B4D]"
                          title={group.title}
                        >
                          {group.title}
                        </span>
                      </td>
                      <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
                        {group.pbv}
                      </td>
                      <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
                        {group.abv === 0 ? "" : group.abv}
                      </td>
                      <td className="px-2 py-1.5 align-middle">
                        <SwimlaneGoalProgressCell
                          percent={group.percent}
                          progressState={group.progressState}
                        />
                      </td>
                      <td className="px-1 py-1.5 align-middle">
                        <SwimlaneGoalStatusIcon state={group.progressState} />
                      </td>
                    </tr>
                    {group.children.map((child) => renderJiraRow(child, true))}
                  </Fragment>
                );
              }

              const bg = goalRowBackground(group.progressState);
              return (
                <Fragment key={group.id}>
                  <tr
                    className={cn("border-b border-[#EBECF0]", bg)}
                    onContextMenu={(e) =>
                      openGoalContextMenu(e, {
                        id: group.id,
                        title: group.title,
                        progressState: group.progressState,
                        percent: group.percent,
                      })
                    }
                  >
                    <td className="px-2 py-1.5 align-middle">
                      <div className="flex min-w-0 items-center gap-1">
                        {hasChildren
                          ? renderExpandChevron(group.id, isExpanded)
                          : <span className="size-4 shrink-0" aria-hidden />}
                        <span className="truncate text-xs font-medium text-[#172B4D]">
                          {group.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
                      {group.pbv}
                    </td>
                    <td className="px-1 py-1.5 text-right align-middle tabular-nums text-xs text-[#44546F]">
                      {group.abv === 0 ? "" : group.abv}
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <SwimlaneGoalProgressCell
                        percent={group.percent}
                        progressState={group.progressState}
                      />
                    </td>
                    <td className="px-1 py-1.5 align-middle">
                      <SwimlaneGoalStatusIcon state={group.progressState} />
                    </td>
                  </tr>
                  {isExpanded
                    ? group.children.map((child) => renderJiraRow(child, true))
                    : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {goalContextMenu &&
        createPortal(
          <div
            ref={goalContextMenuRef}
            role="menu"
            aria-label={`Goal: ${goalContextMenu.title}`}
            className="fixed z-[320] w-max min-w-[160px] max-w-[200px] rounded-md border border-[#DFE1E6] bg-white py-1 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
            style={{
              left: goalContextMenu.x,
              top: goalContextMenu.y,
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {GOAL_CONTEXT_STATUS_ITEMS.map(({ id, label }) => {
              const selected = goalContextWorkflowStatus === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                  onClick={() => {
                    setGoalContextWorkflowStatus(id);
                    if (goalContextMenu && onGoalContextStatusCommit) {
                      onGoalContextStatusCommit(goalContextMenu.goalId, id);
                    }
                  }}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                      selected
                        ? "border-[#0C66E4]"
                        : "border-[#B3B9C4]",
                    )}
                    aria-hidden
                  >
                    {selected ? (
                      <span className="size-2 rounded-full bg-[#0C66E4]" />
                    ) : null}
                  </span>
                  {label}
                </button>
              );
            })}
            <div className="my-1 border-t border-[#DFE1E6]" role="separator" />
            {GOAL_CONTEXT_ACTION_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="w-full px-2.5 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                onClick={() => setGoalContextMenu(null)}
              >
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
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

  const [createWorkModal, setCreateWorkModal] = useState(false);
  const [createModalTeamId, setCreateModalTeamId] =
    useState<TeamFilterId>("unassigned");
  const [createModalSprintIdx, setCreateModalSprintIdx] =
    useState<SprintIndex>(0);
  const [createModalTaskLink, setCreateModalTaskLink] = useState<
    "jira" | "basic"
  >("jira");
  const [createModalTaskTitle, setCreateModalTaskTitle] = useState("");

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [viewGoalsCompactMode, setViewGoalsCompactMode] = useState(false);
  const [viewTasksFlyout, setViewTasksFlyout] = useState<ViewTasksMenuKey | null>(
    null,
  );
  const [viewTasksFlyoutBox, setViewTasksFlyoutBox] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const viewTriggerRef = useRef<HTMLButtonElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const viewReportsFlyoutTriggerRef = useRef<HTMLButtonElement>(null);
  const viewAggregationFlyoutTriggerRef = useRef<HTMLButtonElement>(null);
  const viewTasksFlyoutMenuRef = useRef<HTMLDivElement>(null);

  const [viewTasksReportsChartType, setViewTasksReportsChartType] = useState<
    "pie" | "bar"
  >("pie");
  const [viewTasksReportsDataSource, setViewTasksReportsDataSource] =
    useState<"tasks" | "capacities">("tasks");
  const [viewTasksReportsGroupBy, setViewTasksReportsGroupBy] = useState<
    "status" | "assignee" | "priority" | "status-categories"
  >("status");
  const [viewTasksReportsCountBy, setViewTasksReportsCountBy] = useState<
    | "tasks"
    | "story-points"
    | "remaining-estimate"
    | "original-estimate"
  >("tasks");
  const [viewTasksAggType, setViewTasksAggType] = useState<
    "none" | "work-progress" | "capacity-allocation"
  >("capacity-allocation");
  const [viewTasksAggAggregateBy, setViewTasksAggAggregateBy] = useState<
    "story-points" | "original-estimates" | "remaining-estimates"
  >("story-points");

  const [viewReportsGoalsFlyout, setViewReportsGoalsFlyout] =
    useState<ViewReportsGoalsMenuKey | null>(null);
  const [viewReportsGoalsFlyoutBox, setViewReportsGoalsFlyoutBox] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const viewRgAchievementFlyoutTriggerRef = useRef<HTMLButtonElement>(null);
  const viewRgReportsTypeFlyoutTriggerRef = useRef<HTMLButtonElement>(null);
  const viewReportsGoalsFlyoutMenuRef = useRef<HTMLDivElement>(null);
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
    sprintIdx: SprintIndex;
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
    if (!viewMenuOpen) {
      setViewTasksFlyout(null);
      setViewReportsGoalsFlyout(null);
    }
  }, [viewMenuOpen]);

  useEffect(() => {
    if (!viewMenuOpen || !viewReportsGoalsFlyout) {
      setViewReportsGoalsFlyoutBox(null);
      return;
    }
    const update = () => {
      const el =
        viewReportsGoalsFlyout === "achievement"
          ? viewRgAchievementFlyoutTriggerRef.current
          : viewRgReportsTypeFlyoutTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setViewReportsGoalsFlyoutBox({ top: r.top, left: r.right + 4 });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [viewMenuOpen, viewReportsGoalsFlyout]);

  useEffect(() => {
    if (!viewMenuOpen || !viewTasksFlyout) {
      setViewTasksFlyoutBox(null);
      return;
    }
    const update = () => {
      const el =
        viewTasksFlyout === "reports-type"
          ? viewReportsFlyoutTriggerRef.current
          : viewAggregationFlyoutTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setViewTasksFlyoutBox({ top: r.top, left: r.right + 4 });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [viewMenuOpen, viewTasksFlyout]);

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
      if (viewTasksFlyoutMenuRef.current?.contains(t)) return;
      if (viewReportsGoalsFlyoutMenuRef.current?.contains(t)) return;
      setSwimlanesMenuOpen(false);
      setTeamMenuOpen(false);
      setAllMenuOpen(false);
      setEssentialsMenuOpen(false);
      setCapacityMetricMenuOpen(false);
      setTasksMenuOpen(false);
      setViewMenuOpen(false);
      setBoardScopeMenuOpen(false);
      setViewTasksFlyout(null);
      setViewTasksFlyoutBox(null);
      setViewReportsGoalsFlyout(null);
      setViewReportsGoalsFlyoutBox(null);
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
  /** Any Goals on swimlanes ⇒ Team row grouping is fixed (same as Goals-only UX). */
  const teamSwimlaneLocked = boardScope.goals;
  const isCapacityPlanningView = swimlanesSelection === "Capacity planning";
  const isReportsView = swimlanesSelection === "Reports view";
  const reportsGoalsToolbar = isReportsView && goalsOnlyBoardScope;

  useEffect(() => {
    if (!reportsGoalsToolbar) {
      setViewReportsGoalsFlyout(null);
      setViewReportsGoalsFlyoutBox(null);
    }
  }, [reportsGoalsToolbar]);

  useEffect(() => {
    if (teamSwimlaneLocked) {
      setTeamMenuOpen(false);
      setTeamDimension("team");
    }
  }, [teamSwimlaneLocked]);

  useEffect(() => {
    if (boardScope.goals) {
      setEssentialsMenuOpen(false);
    }
  }, [boardScope.goals]);

  /** Reports view: only Tasks or Goals (no combined scope). */
  useEffect(() => {
    if (!isReportsView) return;
    setBoardScope((prev) => {
      if (prev.tasks && prev.goals) return { tasks: true, goals: false };
      return prev;
    });
  }, [isReportsView]);

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
    if (!createWorkModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateWorkModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createWorkModal]);

  const openCreateWorkModal = () => {
    const firstVisible =
      ALL_MENU_TEAMS.find((t) => allTeamFilter[t.id])?.id ?? "unassigned";
    setCreateModalTeamId(firstVisible);
    setCreateModalSprintIdx(0);
    setCreateModalTaskLink("jira");
    setCreateModalTaskTitle("");
    setCreateWorkModal(true);
    setTasksMenuOpen(false);
  };

  const appendJiraTask = (teamId: TeamFilterId, sprintIdx: SprintIndex) => {
    setSwimlaneStacks((prev) => {
      const sprints = normalizeTeamSprints(prev[teamId]);
      const cell = normalizeSprintCell(sprints[sprintIdx]);
      const targetCol: 0 | 1 =
        cell.taskColumns[0].length <= cell.taskColumns[1].length ? 0 : 1;
      const n =
        cell.taskColumns[0].length + cell.taskColumns[1].length;
      const seed = `${teamId}:${sprintIdx}:${n}:${Date.now()}`;
      cell.taskColumns[targetCol].push(
        createSwimlaneTask({
          id: `task-${teamId}-${sprintIdx}-${Date.now()}-${n}`,
          issueKey: `ONE-${257700 + ((n + teamId.length * 3 + sprintIdx * 11) % 12000)}`,
          title: swimlaneTaskTitle(seed, n),
          seed,
          salt: n,
        }),
      );
      sprints[sprintIdx] = cell;
      return { ...prev, [teamId]: sprints };
    });
  };

  const appendGoalItem = (
    teamId: TeamFilterId,
    sprintIdx: SprintIndex,
    titleOverride?: string,
  ) => {
    setSwimlaneStacks((prev) => {
      const sprints = normalizeTeamSprints(prev[teamId]);
      const cell = normalizeSprintCell(sprints[sprintIdx]);
      const salt = cell.goals.length;
      const meta = extraGoalFromSalt(teamId, sprintIdx, salt);
      const title =
        titleOverride?.trim() || meta.title;
      const percent = titleOverride?.trim()
        ? 28 + ((salt + title.length * 11) % 63)
        : meta.percent;
      const progressState = goalProgressStateFromPercent(percent, salt);
      cell.goals.push({
        id: `goal-${teamId}-${sprintIdx}-${Date.now()}`,
        type: "goal",
        kind: "text",
        title,
        percent,
        pbv: 0,
        abv: 0,
        progressState,
      });
      sprints[sprintIdx] = cell;
      return { ...prev, [teamId]: sprints };
    });
  };

  const updateGoalWorkflowStatus = (
    teamId: TeamFilterId,
    sprintIdx: SprintIndex,
    goalId: string,
    status: GoalContextWorkflowStatus,
  ) => {
    setSwimlaneStacks((prev) => {
      const sprints = normalizeTeamSprints(prev[teamId]);
      const cell = normalizeSprintCell(sprints[sprintIdx]);
      const nextGoals = cell.goals.map((item) => {
        if (item.type !== "goal" || item.id !== goalId) return item;
        return applyGoalContextWorkflowToStackItem(item, status);
      });
      sprints[sprintIdx] = { ...cell, goals: nextGoals };
      return { ...prev, [teamId]: sprints };
    });
  };

  const appendBigPictureTask = (
    teamId: TeamFilterId,
    sprintIdx: SprintIndex,
    opts: { source: "jira" | "basic"; title?: string },
  ) => {
    setSwimlaneStacks((prev) => {
      const sprints = normalizeTeamSprints(prev[teamId]);
      const cell = normalizeSprintCell(sprints[sprintIdx]);
      const targetCol: 0 | 1 =
        cell.taskColumns[0].length <= cell.taskColumns[1].length ? 0 : 1;
      const n =
        cell.taskColumns[0].length + cell.taskColumns[1].length;
      const seed = `${teamId}:${sprintIdx}:${n}:${Date.now()}`;
      if (opts.source === "basic") {
        const title = opts.title?.trim() || "New basic task";
        cell.taskColumns[targetCol].push(
          createSwimlaneTask({
            id: `basic-task-${teamId}-${sprintIdx}-${Date.now()}-${n}`,
            issueKey: "",
            title,
            seed: `${seed}:basic`,
            salt: n,
            source: "basic",
          }),
        );
      } else {
        cell.taskColumns[targetCol].push(
          createSwimlaneTask({
            id: `task-${teamId}-${sprintIdx}-${Date.now()}-${n}`,
            issueKey: `ONE-${257700 + ((n + teamId.length * 3 + sprintIdx * 11) % 12000)}`,
            title: swimlaneTaskTitle(seed, n),
            seed,
            salt: n,
            source: "jira",
          }),
        );
      }
      sprints[sprintIdx] = cell;
      return { ...prev, [teamId]: sprints };
    });
  };

  const confirmCreateWork = () => {
    if (!createWorkModal) return;
    appendBigPictureTask(createModalTeamId, createModalSprintIdx, {
      source: createModalTaskLink,
      title: createModalTaskTitle,
    });
    setCreateWorkModal(false);
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
          <div className={cn("mt-1 shrink-0 border-t pt-2", ads.border)}>
            <button type="button" className={sidebarNavButton}>
              <Cog className="size-4 shrink-0 text-[#44546F]" strokeWidth={2} />
              <span className="truncate">Box Configuration</span>
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
            {isCapacityPlanningView ? (
              <div className="relative">
                <button
                  ref={capacityMetricTriggerRef}
                  type="button"
                  aria-expanded={capacityMetricMenuOpen}
                  aria-haspopup="dialog"
                  aria-controls="capacity-metric-units-dropdown"
                  onClick={() => {
                    setSwimlanesMenuOpen(false);
                    setBoardScopeMenuOpen(false);
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
                      id="capacity-metric-units-dropdown"
                      className="fixed z-[500] min-w-[240px] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                      style={{
                        top: capacityMetricMenuBox.top,
                        left: capacityMetricMenuBox.left,
                      }}
                    >
                      <div
                        id="capacity-metric-units-heading"
                        className="px-4 pb-2 pt-1 text-[11px] uppercase tracking-wide text-[#626F86]"
                      >
                        Units
                      </div>
                      <div className="px-3 pb-1">
                        <RadioGroup
                          name="capacity-metric-units"
                          value={capacityMetricSelection}
                          labelId="capacity-metric-units-heading"
                          testId="capacity-metric-units"
                          onChange={(e) => {
                            const next = e.currentTarget.value;
                            if (
                              (CAPACITY_METRIC_OPTIONS as readonly string[]).includes(
                                next,
                              )
                            ) {
                              setCapacityMetricSelection(
                                next as (typeof CAPACITY_METRIC_OPTIONS)[number],
                              );
                            }
                            setCapacityMetricMenuOpen(false);
                          }}
                          options={CAPACITY_METRIC_OPTIONS.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                        />
                      </div>
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
                  "flex items-center gap-1.5 rounded-md border border-[#DFE1E6] bg-white px-2 py-1.5 text-sm font-medium outline-none transition-colors",
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
                    <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-[#44546F]">
                      Show on Swimlanes
                    </div>
                    {isReportsView ? (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          className={cn(
                            "flex w-full px-3 py-2 text-left text-sm hover:bg-[#F1F2F4]",
                            boardScope.tasks && !boardScope.goals
                              ? "bg-[#E9F2FF] font-medium text-[#0C66E4]"
                              : "text-[#172B4D]",
                          )}
                          onClick={() => {
                            setBoardScope({ tasks: true, goals: false });
                            setBoardScopeMenuOpen(false);
                          }}
                        >
                          Tasks
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={cn(
                            "flex w-full px-3 py-2 text-left text-sm hover:bg-[#F1F2F4]",
                            boardScope.goals && !boardScope.tasks
                              ? "bg-[#E9F2FF] font-medium text-[#0C66E4]"
                              : "text-[#172B4D]",
                          )}
                          onClick={() => {
                            setBoardScope({ tasks: false, goals: true });
                            setBoardScopeMenuOpen(false);
                          }}
                        >
                          Goals
                        </button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>,
                  document.body,
                )}
            </div>
            )}
            {!isCapacityPlanningView ? (
            <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-md border border-[#DFE1E6] bg-white">
              {teamSwimlaneLocked ? (
                <Tooltip
                  content="Goals are set only per teams"
                  className="inline-flex shrink-0 cursor-default"
                >
                  <div
                    ref={teamTriggerRef}
                    className="flex cursor-default select-none items-center gap-1.5 border-0 border-r border-[#DFE1E6] bg-white px-2 py-1.5 text-sm text-[#626F86]"
                    aria-label="Goals are set only per teams"
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
                    className="mb-1 mt-3 w-full px-1 py-1 text-left text-xs font-bold uppercase tracking-wide text-[#626F86] hover:bg-[#F1F2F4]"
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
            {!isCapacityPlanningView &&
            boardScope.tasks &&
            !(isReportsView && boardScope.goals) ? (
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
                          <JiraIssueMenuIcon />
                          Jira issue
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                          onClick={() => openCreateWorkModal()}
                        >
                          <BigPictureTaskMenuIcon />
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
                    "inline-flex items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                    reportsGoalsToolbar ? "border" : "border-0",
                    viewMenuOpen
                      ? reportsGoalsToolbar
                        ? "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                        : "bg-[#E9F2FF] text-[#0C66E4]"
                      : reportsGoalsToolbar
                        ? "border-transparent bg-transparent text-[#172B4D] hover:bg-[#EBECF0]"
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
                        reportsGoalsToolbar
                          ? "View options (Reports, Goals)"
                          : goalsOnlyBoardScope
                            ? "View options (Goals mode)"
                            : "View options"
                      }
                    >
                      {goalsOnlyBoardScope ? (
                        reportsGoalsToolbar ? (
                          <>
                            {VIEW_REPORTS_GOALS_MENU_KEYS.map((key) => (
                              <button
                                key={key}
                                ref={
                                  key === "achievement"
                                    ? viewRgAchievementFlyoutTriggerRef
                                    : viewRgReportsTypeFlyoutTriggerRef
                                }
                                type="button"
                                role="menuitem"
                                aria-expanded={
                                  viewReportsGoalsFlyout === key
                                }
                                aria-haspopup="menu"
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                                onClick={() =>
                                  setViewReportsGoalsFlyout((prev) =>
                                    prev === key ? null : key,
                                  )
                                }
                              >
                                <span>
                                  {VIEW_REPORTS_GOALS_MENU_LABEL[key]}
                                </span>
                                <ChevronRight
                                  className="size-4 shrink-0 text-[#626F86]"
                                  strokeWidth={2}
                                  aria-hidden
                                />
                              </button>
                            ))}
                          </>
                        ) : (
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
                        )
                      ) : (
                        <>
                          {VIEW_TASKS_MENU_KEYS.map((key) => (
                            <button
                              key={key}
                              ref={
                                key === "reports-type"
                                  ? viewReportsFlyoutTriggerRef
                                  : viewAggregationFlyoutTriggerRef
                              }
                              type="button"
                              role="menuitem"
                              aria-expanded={viewTasksFlyout === key}
                              aria-haspopup="menu"
                              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                              onClick={() =>
                                setViewTasksFlyout((prev) =>
                                  prev === key ? null : key,
                                )
                              }
                            >
                              <span>{VIEW_TASKS_MENU_LABEL[key]}</span>
                              <ChevronRight
                                className="size-4 shrink-0 text-[#626F86]"
                                strokeWidth={2}
                                aria-hidden
                              />
                            </button>
                          ))}
                        </>
                      )}
                    </div>,
                    document.body,
                  )}
                {!goalsOnlyBoardScope &&
                  viewTasksFlyout &&
                  viewTasksFlyoutBox &&
                  createPortal(
                    <div
                      ref={viewTasksFlyoutMenuRef}
                      className="fixed z-[250] min-w-[272px] max-w-[320px] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                      style={{
                        top: viewTasksFlyoutBox.top,
                        left: viewTasksFlyoutBox.left,
                      }}
                      role="dialog"
                      aria-label={VIEW_TASKS_MENU_LABEL[viewTasksFlyout]}
                    >
                      {viewTasksFlyout === "reports-type" ? (
                        <ViewReportsTypeOptionsPanel
                          chartType={viewTasksReportsChartType}
                          setChartType={setViewTasksReportsChartType}
                          dataSource={viewTasksReportsDataSource}
                          setDataSource={setViewTasksReportsDataSource}
                          groupBy={viewTasksReportsGroupBy}
                          setGroupBy={setViewTasksReportsGroupBy}
                          countBy={viewTasksReportsCountBy}
                          setCountBy={setViewTasksReportsCountBy}
                        />
                      ) : (
                        <ViewAggregationOptionsPanel
                          aggType={viewTasksAggType}
                          setAggType={setViewTasksAggType}
                          aggregateBy={viewTasksAggAggregateBy}
                          setAggregateBy={setViewTasksAggAggregateBy}
                        />
                      )}
                    </div>,
                    document.body,
                  )}
                {reportsGoalsToolbar &&
                  viewReportsGoalsFlyout &&
                  viewReportsGoalsFlyoutBox &&
                  createPortal(
                    <div
                      ref={viewReportsGoalsFlyoutMenuRef}
                      className={cn(
                        "fixed z-[250] rounded-md border border-[#DFE1E6] bg-white py-2 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]",
                        viewReportsGoalsFlyout === "reports-type"
                          ? "min-w-[272px] max-w-[320px]"
                          : "min-w-[200px]",
                      )}
                      style={{
                        top: viewReportsGoalsFlyoutBox.top,
                        left: viewReportsGoalsFlyoutBox.left,
                      }}
                      role={
                        viewReportsGoalsFlyout === "reports-type"
                          ? "dialog"
                          : "menu"
                      }
                      aria-label={
                        VIEW_REPORTS_GOALS_MENU_LABEL[
                          viewReportsGoalsFlyout
                        ]
                      }
                    >
                      {viewReportsGoalsFlyout === "achievement" ? (
                        VIEW_REPORTS_GOALS_ACHIEVEMENT_SUBITEMS.map(
                          (label) => (
                            <button
                              key={label}
                              type="button"
                              role="menuitem"
                              className="flex w-full px-3 py-2 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                              onClick={() => {
                                setViewMenuOpen(false);
                                setViewReportsGoalsFlyout(null);
                                setViewReportsGoalsFlyoutBox(null);
                              }}
                            >
                              {label}
                            </button>
                          ),
                        )
                      ) : (
                        <ViewReportsTypeOptionsPanel
                          chartType={viewTasksReportsChartType}
                          setChartType={setViewTasksReportsChartType}
                          dataSource={viewTasksReportsDataSource}
                          setDataSource={setViewTasksReportsDataSource}
                          groupBy={viewTasksReportsGroupBy}
                          setGroupBy={setViewTasksReportsGroupBy}
                          countBy={viewTasksReportsCountBy}
                          setCountBy={setViewTasksReportsCountBy}
                        />
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

              {/* Sprint / stage headers */}
              <div
                className="grid grid-cols-2 gap-2 border-b border-[#DFE1E6] px-4 py-3"
              >
                {(
                  isCapacityPlanningView
                    ? (["Stage 1", "Stage 2"] as const)
                    : SPRINT_LABELS
                ).map((label, idx) => (
                  <div
                    key={label}
                    title={
                      idx === 0
                        ? `${label} — completed`
                        : `${label} — in progress`
                    }
                    className={cn(
                      "flex min-h-[40px] items-center gap-2 rounded-md px-2.5 py-2 text-white",
                      idx === 0
                        ? "bg-[#216E4E]"
                        : "bg-[#09326C]",
                    )}
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
                    {boardScope.goals ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <button
                            type="button"
                            aria-expanded={swimlaneExpanded[team.id]}
                            onClick={() =>
                              setSwimlaneExpanded((prev) => ({
                                ...prev,
                                [team.id]: !prev[team.id],
                              }))
                            }
                            className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm font-semibold text-[#172B4D] hover:bg-[#F4F5F7] hover:text-[#0C66E4]"
                          >
                            {swimlaneExpanded[team.id] ? (
                              <ChevronDown className="size-4 shrink-0 text-[#626F86]" />
                            ) : (
                              <ChevronRight className="size-4 shrink-0 text-[#626F86]" />
                            )}
                            {team.label}
                          </button>
                          <SwimlaneTeamSprintGoalStat
                            teamId={team.id}
                            teamLabel={team.label}
                            sprintIdx={0}
                            stacks={swimlaneStacks}
                          />
                        </div>
                        <div className="flex min-w-0 items-center justify-end">
                          <SwimlaneTeamSprintGoalStat
                            teamId={team.id}
                            teamLabel={team.label}
                            sprintIdx={1}
                            stacks={swimlaneStacks}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-expanded={swimlaneExpanded[team.id]}
                        onClick={() =>
                          setSwimlaneExpanded((prev) => ({
                            ...prev,
                            [team.id]: !prev[team.id],
                          }))
                        }
                        className="inline-flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm font-semibold text-[#172B4D] hover:bg-[#F4F5F7] hover:text-[#0C66E4]"
                      >
                        {swimlaneExpanded[team.id] ? (
                          <ChevronDown className="size-4 shrink-0 text-[#626F86]" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-[#626F86]" />
                        )}
                        {team.label}
                      </button>
                    )}
                  </div>
                  {swimlaneExpanded[team.id] ? (
                    <div className="grid grid-cols-2 gap-2 bg-white p-4 pt-3">
                      {([0, 1] as const).map((sprintIdx) => {
                        const col = sprintIdx + 1;
                        const sprintCell = normalizeSprintCell(
                          swimlaneStacks[team.id]?.[sprintIdx],
                        );
                        const rawStack = sprintCellItems(sprintCell);
                        const visibleStack = rawStack.filter((item) => {
                          if (boardScope.tasks && boardScope.goals)
                            return true;
                          if (boardScope.tasks) return item.type === "task";
                          return item.type === "goal";
                        });
                        const sprintTasks = visibleStack.filter(
                          (
                            item,
                          ): item is Extract<
                            SwimlaneStackItem,
                            { type: "task" }
                          > => item.type === "task",
                        );
                        const sprintGoals = visibleStack.filter(
                          (
                            item,
                          ): item is Extract<
                            SwimlaneStackItem,
                            { type: "goal" }
                          > => item.type === "goal",
                        );
                        const goalsPercentsForReport =
                          isReportsView && boardScope.goals
                            ? sprintGoals.length > 0
                              ? sprintGoals.map((g, i) => ({
                                  percent: enrichSwimlaneGoal(g, i).percent,
                                }))
                              : flattenGoalGroups(
                                  createSprintGoalRows(team.id, sprintIdx),
                                )
                                  .filter((g) => g.kind !== "separator")
                                  .map((g) => ({ percent: g.percent }))
                            : [];
                        const tasksGoalsMix =
                          boardScope.tasks &&
                          boardScope.goals &&
                          !isReportsView;
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
                          if (isReportsView) return;
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
                            {boardScope.goals && !isReportsView ? (
                              <SwimlaneGoalsTable
                                rows={sprintGoalTableRows(
                                  sprintCell.goals,
                                  team.id,
                                  sprintIdx,
                                )}
                                onGoalContextStatusCommit={(goalId, status) =>
                                  updateGoalWorkflowStatus(
                                    team.id,
                                    sprintIdx,
                                    goalId,
                                    status,
                                  )
                                }
                              />
                            ) : null}
                            {boardScope.tasks &&
                            isReportsView &&
                            sprintTasks.length > 0 ? (
                              <SwimlaneSprintTasksDonut tasks={sprintTasks} />
                            ) : null}
                            {boardScope.tasks &&
                            isReportsView &&
                            sprintTasks.length === 0 ? (
                              <ReportsSprintTasksReportEmptySplash
                                sprintCol={col}
                              />
                            ) : null}
                            {boardScope.goals &&
                            isReportsView &&
                            goalsPercentsForReport.length > 0 ? (
                              <SwimlaneSprintGoalsDonut
                                goals={goalsPercentsForReport}
                              />
                            ) : null}
                            {boardScope.tasks && !isReportsView ? (
                              <SwimlaneTaskColumns
                                columns={[
                                  sprintCell.taskColumns[0].filter(
                                    (item) =>
                                      boardScope.goals || item.type === "task",
                                  ),
                                  sprintCell.taskColumns[1].filter(
                                    (item) =>
                                      boardScope.goals || item.type === "task",
                                  ),
                                ]}
                              />
                            ) : null}
                            {visibleStack
                              .filter(
                                (item) =>
                                  !(
                                    boardScope.tasks &&
                                    !isReportsView &&
                                    item.type === "task"
                                  ) &&
                                  !(
                                    boardScope.tasks &&
                                    isReportsView &&
                                    item.type === "task"
                                  ) &&
                                  !(
                                    boardScope.goals &&
                                    isReportsView &&
                                    item.type === "goal"
                                  ) &&
                                  !(
                                    boardScope.goals &&
                                    !isReportsView &&
                                    item.type === "goal"
                                  ),
                              )
                              .map((item) =>
                                item.type === "task" ? (
                                  <SwimlaneIssueCard
                                    key={item.id}
                                    task={enrichSwimlaneTask(item)}
                                  />
                                ) : null,
                              )}
                            {!isReportsView ? (
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
                                    className="absolute bottom-full left-auto right-0 z-30 mb-1 w-max max-w-[200px] min-w-0 rounded-md border border-[#DFE1E6] bg-white py-1 shadow-[0_4px_8px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.2)]"
                                    role="menu"
                                    aria-label="Add to sprint"
                                  >
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                                      onClick={() => {
                                        appendJiraTask(team.id, sprintIdx);
                                        setSprintMixPicker(null);
                                      }}
                                    >
                                      <JiraIssueMenuIcon />
                                      Jira task
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm text-[#172B4D] hover:bg-[#F1F2F4]"
                                      onClick={() => {
                                        appendGoalItem(team.id, sprintIdx);
                                        setSprintMixPicker(null);
                                      }}
                                    >
                                      <Flag
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
                                  className={cn(
                                    "flex min-h-[72px] w-full cursor-pointer items-center justify-center rounded-md border transition-colors",
                                    showMixPicker
                                      ? "border-solid border-[#0C66E4] bg-[#E9F2FF] shadow-[inset_0_0_0_1px_rgba(12,102,228,0.12)]"
                                      : "border-dashed border-[#DFE1E6] bg-white hover:border-[#0C66E4]/40 hover:bg-[#F7F8F9]",
                                  )}
                                  aria-label={addLabel}
                                  aria-expanded={
                                    tasksGoalsMix ? showMixPicker : undefined
                                  }
                                  aria-haspopup={
                                    tasksGoalsMix ? "menu" : undefined
                                  }
                                >
                                  <Plus
                                    className={cn(
                                      "size-10 transition-colors",
                                      showMixPicker
                                        ? "text-[#0C66E4]"
                                        : "text-[#B3B9C4]",
                                    )}
                                    strokeWidth={1.25}
                                  />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              )))}

              {!isCapacityPlanningView ? (
                <div className="mt-auto px-4 py-3">
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
              ) : null}
            </div>
          </div>

          {/* Infobar rail — flush with canvas (white); left edge only + hover */}
          <aside
            className="flex w-8 shrink-0 flex-col items-center justify-center border-l border-[#DFE1E6] bg-white transition-colors hover:bg-[#EBECF0]"
            aria-label="Infobar"
          >
            <span
              className="flex items-center justify-center text-[10px] font-semibold uppercase tracking-normal text-[#626F86]"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              INFOBAR
            </span>
          </aside>
        </main>
        </div>
      </div>
      </div>
      {createWorkModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[280] flex items-center justify-center bg-[#091E42]/40 p-4"
            role="presentation"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setCreateWorkModal(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-work-modal-title"
              className="w-full max-w-md rounded-lg border border-[#DFE1E6] bg-white p-4 shadow-[0_4px_8px_rgba(9,30,66,0.25)]"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <h2
                id="create-work-modal-title"
                className="text-base font-semibold text-[#172B4D]"
              >
                Create BigPicture task
              </h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label
                    className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#626F86]"
                    htmlFor="create-work-team"
                  >
                    Team
                  </label>
                  <select
                    id="create-work-team"
                    className="w-full rounded-md border border-[#DFE1E6] bg-white px-2 py-1.5 text-sm text-[#172B4D]"
                    value={createModalTeamId}
                    onChange={(e) =>
                      setCreateModalTeamId(e.target.value as TeamFilterId)
                    }
                  >
                    {(ALL_MENU_TEAMS.some((t) => allTeamFilter[t.id])
                      ? ALL_MENU_TEAMS.filter((t) => allTeamFilter[t.id])
                      : ALL_MENU_TEAMS
                    ).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <fieldset>
                  <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#626F86]">
                    Sprint
                  </legend>
                  <div className="flex flex-col gap-1.5">
                    {([0, 1] as const).map((idx) => (
                      <label
                        key={idx}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-[#F4F5F7]"
                      >
                        <input
                          type="radio"
                          name="create-work-sprint"
                          className="size-4 accent-[#0C66E4]"
                          checked={createModalSprintIdx === idx}
                          onChange={() => setCreateModalSprintIdx(idx)}
                        />
                        <span className="text-sm text-[#172B4D]">
                          {SPRINT_LABELS[idx]}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#626F86]">
                    Task type
                  </legend>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-[#F4F5F7]">
                      <input
                        type="radio"
                        name="create-work-link"
                        className="size-4 accent-[#0C66E4]"
                        checked={createModalTaskLink === "jira"}
                        onChange={() => setCreateModalTaskLink("jira")}
                      />
                      <span className="text-sm text-[#172B4D]">
                        Linked Jira issue (demo key)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-[#F4F5F7]">
                      <input
                        type="radio"
                        name="create-work-link"
                        className="size-4 accent-[#0C66E4]"
                        checked={createModalTaskLink === "basic"}
                        onChange={() => setCreateModalTaskLink("basic")}
                      />
                      <span className="text-sm text-[#172B4D]">
                        Basic task (not in Jira)
                      </span>
                    </label>
                  </div>
                </fieldset>
                {createModalTaskLink === "basic" ? (
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#626F86]"
                      htmlFor="create-work-task-title"
                    >
                      Title
                    </label>
                    <input
                      id="create-work-task-title"
                      type="text"
                      className="w-full rounded-md border border-[#DFE1E6] px-2 py-1.5 text-sm text-[#172B4D]"
                      placeholder="Describe the task"
                      value={createModalTaskTitle}
                      onChange={(e) => setCreateModalTaskTitle(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-[#DFE1E6] px-3 py-1.5 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7]"
                  onClick={() => setCreateWorkModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#0C66E4] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0055CC]"
                  onClick={confirmCreateWork}
                >
                  Create
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
