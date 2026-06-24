import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "./components/ui/utils";
import { ads } from "./design/atlassianPageTokens";

type TaskNode = {
  id: string;
  issueKey: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  children?: TaskNode[];
};

type TaskGroup = {
  id: string;
  label: string;
  subtitle: string;
  tasks: TaskNode[];
};

const DEMO_GROUPS: TaskGroup[] = [
  {
    id: "epic-auth",
    label: "Epic grouping",
    subtitle: "ONE-240 · Authentication overhaul",
    tasks: [
      {
        id: "t1",
        issueKey: "ONE-241",
        title: "OAuth2 login flow",
        status: "In Progress",
        children: [
          { id: "t1a", issueKey: "ONE-242", title: "Redirect URI validation", status: "Done" },
          { id: "t1b", issueKey: "ONE-243", title: "Token refresh handler", status: "In Progress" },
        ],
      },
      {
        id: "t2",
        issueKey: "ONE-244",
        title: "Session timeout policy",
        status: "To Do",
      },
    ],
  },
  {
    id: "sprint-18",
    label: "Sprint grouping",
    subtitle: "Sprint 18 · Platform team",
    tasks: [
      {
        id: "t3",
        issueKey: "ONE-301",
        title: "Board column configuration",
        status: "Done",
        children: [
          { id: "t3a", issueKey: "ONE-302", title: "Drag handle for sub-tasks", status: "Done" },
          { id: "t3b", issueKey: "ONE-303", title: "Indent nested rows", status: "In Progress" },
          { id: "t3c", issueKey: "ONE-304", title: "Collapse group headers", status: "To Do" },
        ],
      },
    ],
  },
  {
    id: "custom-field",
    label: "Custom field grouping",
    subtitle: "Component = Reporting",
    tasks: [
      { id: "t4", issueKey: "ONE-410", title: "Export Gantt to PDF", status: "In Progress" },
      { id: "t5", issueKey: "ONE-411", title: "Scheduled report emails", status: "To Do" },
    ],
  },
];

function statusClass(status: TaskNode["status"]): string {
  if (status === "Done") return "bg-green-50 text-green-800 ring-green-200";
  if (status === "In Progress") return "bg-blue-50 text-blue-800 ring-blue-200";
  return "bg-gray-50 text-gray-700 ring-gray-200";
}

function TaskRow({
  task,
  depth = 0,
}: {
  task: TaskNode;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = Boolean(task.children?.length);

  return (
    <>
      <div
        className={cn(
          ads.tableRowBody,
          "flex items-center gap-2 border-b border-[#DFE1E6] px-3 py-2",
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={ads.iconButtonNeutral}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="inline-flex w-7 justify-center text-[#97A0AF]">
            <CornerDownRight size={12} />
          </span>
        )}
        <span className={cn(ads.bodyMedium, "w-20 shrink-0 font-mono text-xs")}>{task.issueKey}</span>
        <span className={cn(ads.body, "min-w-0 flex-1 truncate")}>{task.title}</span>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            statusClass(task.status),
          )}
        >
          {task.status}
        </span>
      </div>
      {hasChildren && open &&
        task.children!.map((child) => (
          <TaskRow key={child.id} task={child} depth={depth + 1} />
        ))}
    </>
  );
}

export default function TaskStructureInGroupingPage() {
  const [activeGroupId, setActiveGroupId] = useState(DEMO_GROUPS[0].id);
  const activeGroup = DEMO_GROUPS.find((g) => g.id === activeGroupId) ?? DEMO_GROUPS[0];

  return (
    <div className={cn("min-h-dvh", ads.canvas)}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          className={cn(
            "mb-6 inline-flex items-center gap-2 rounded-[3px] px-2 py-1.5",
            ads.bodySubtle,
            ads.linkHover,
          )}
        >
          <ArrowLeft size={16} />
          All prototypes
        </Link>

        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Layers size={20} className="text-[#0C66E4]" />
            <h1 className={ads.titlePage}>Task structure in grouping</h1>
          </div>
          <p className={cn(ads.bodySubtle, "max-w-2xl")}>
            Explore how parent and child tasks render inside BigPicture group headers — epic, sprint,
            and custom field groupings with expandable hierarchy.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {DEMO_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={cn(
                "rounded-[3px] border px-3 py-1.5 text-sm font-medium transition-colors",
                activeGroupId === group.id
                  ? "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                  : "border-[#DFE1E6] bg-white text-[#44546F] hover:bg-[#F1F2F4]",
              )}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className={ads.shellElevated}>
          <div className="border-b border-[#DFE1E6] bg-[#FAFBFC] px-4 py-3">
            <div className={ads.overline}>{activeGroup.label}</div>
            <div className={cn(ads.bodyMedium, "mt-1")}>{activeGroup.subtitle}</div>
          </div>
          <div>
            {activeGroup.tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>

        <p className={cn(ads.caption, "mt-4")}>
          Prototype starter — adjust grouping rules, indent levels, and collapse behaviour here.
        </p>
      </div>
    </div>
  );
}
