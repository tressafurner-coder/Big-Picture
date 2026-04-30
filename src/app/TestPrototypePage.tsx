import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Flag,
  LayoutGrid,
  ListOrdered,
  Plus,
  ShieldAlert,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Label } from "./components/ui/label";
import { cn } from "./components/ui/utils";
import { ads } from "./design/atlassianPageTokens";

const LIKELIHOOD_ROWS_TEMPLATE = [
  { label: "Rare", value: 1, swatch: "bg-[#006644]" },
  { label: "Unlikely", value: 2, swatch: "bg-[#36B37E]" },
  { label: "Possible", value: 3, swatch: "bg-[#FFAB00]" },
  { label: "Likely", value: 4, swatch: "bg-[#FF5630]" },
  { label: "Certain", value: 5, swatch: "bg-[#BF2600]" },
] as const;

const CONSEQUENCE_ROWS_TEMPLATE = [
  { label: "Insignificant", value: 1, swatch: "bg-[#006644]" },
  { label: "Low", value: 2, swatch: "bg-[#36B37E]" },
  { label: "Moderate", value: 3, swatch: "bg-[#FFAB00]" },
  { label: "Major", value: 4, swatch: "bg-[#FF5630]" },
  { label: "Severe", value: 5, swatch: "bg-[#BF2600]" },
] as const;

const SWATCH_CYCLE = [
  "bg-[#006644]",
  "bg-[#36B37E]",
  "bg-[#FFAB00]",
  "bg-[#FF5630]",
  "bg-[#BF2600]",
  "bg-[#626F86]",
] as const;

type MetricRow = { label: string; value: number; swatch: string };

const purpleNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none bg-[#EAE6FF] text-[#5E4DB2]";
const blueNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none bg-[#DEEBFF] text-[#0747A6]";

function ManualMetricCard({
  metricLabel,
  rows,
  onLabelChange,
  onValueChange,
  onAddRow,
}: {
  metricLabel: string;
  rows: MetricRow[];
  onLabelChange: (index: number, label: string) => void;
  onValueChange: (index: number, value: number) => void;
  onAddRow: () => void;
}) {
  const slug = metricLabel.replace(/\s+/g, "-").toLowerCase();
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-lg border shadow-sm",
        ads.border,
        ads.surface,
      )}
    >
      <div className={cn("border-b px-4 py-3", ads.border)}>
        <h3 className={cn(ads.bodyMedium)}>{metricLabel}</h3>
      </div>
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr
            className={cn(
              "border-b text-left",
              ads.border,
              ads.surfaceSubtle,
              ads.overline,
            )}
          >
            <th className="px-4 py-2 font-semibold">Value name</th>
            <th className="px-4 py-2 font-semibold">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DFE1E6]">
          {rows.map((row, i) => (
            <tr key={`${slug}-${i}`}>
              <td className="px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`inline-block size-3 shrink-0 rounded-sm ${row.swatch}`}
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => onLabelChange(i, e.target.value)}
                    className={cn(
                      "min-w-0 flex-1 py-1 text-sm font-normal",
                      ads.fieldControl,
                    )}
                    aria-label={`Value name for ${metricLabel}`}
                  />
                </div>
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  value={row.value}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") return;
                    const n = Number(raw);
                    if (!Number.isNaN(n)) onValueChange(i, n);
                  }}
                  className={cn(
                    "min-h-9 w-full min-w-[4rem] max-w-[7rem] tabular-nums",
                    ads.fieldControl,
                  )}
                  aria-label={`${metricLabel} numeric value for ${row.label}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={cn("border-t px-4 py-3", ads.border)}>
        <button type="button" onClick={onAddRow} className={cn(ads.linkUi, "inline")}>
          + Add value
        </button>
      </div>
    </div>
  );
}

/** Risk Registers configuration — ADS-style shell matching BigPicture in Jira. */
export default function TestPrototypePage() {
  const [frameworkName, setFrameworkName] = useState("Risk");
  const [likelihoodRows, setLikelihoodRows] = useState<MetricRow[]>(() =>
    LIKELIHOOD_ROWS_TEMPLATE.map((r) => ({ ...r })),
  );
  const [consequenceRows, setConsequenceRows] = useState<MetricRow[]>(() =>
    CONSEQUENCE_ROWS_TEMPLATE.map((r) => ({ ...r })),
  );

  function patchLikelihoodLabel(i: number, label: string) {
    setLikelihoodRows((prev) => prev.map((r, j) => (j === i ? { ...r, label } : r)));
  }
  function patchLikelihoodValue(i: number, value: number) {
    setLikelihoodRows((prev) => prev.map((r, j) => (j === i ? { ...r, value } : r)));
  }
  function addLikelihoodRow() {
    setLikelihoodRows((prev) => [
      ...prev,
      {
        label: `Value ${prev.length + 1}`,
        value: prev.length + 1,
        swatch: SWATCH_CYCLE[prev.length % SWATCH_CYCLE.length],
      },
    ]);
  }

  function patchConsequenceLabel(i: number, label: string) {
    setConsequenceRows((prev) =>
      prev.map((r, j) => (j === i ? { ...r, label } : r)),
    );
  }
  function patchConsequenceValue(i: number, value: number) {
    setConsequenceRows((prev) =>
      prev.map((r, j) => (j === i ? { ...r, value } : r)),
    );
  }
  function addConsequenceRow() {
    setConsequenceRows((prev) => [
      ...prev,
      {
        label: `Value ${prev.length + 1}`,
        value: prev.length + 1,
        swatch: SWATCH_CYCLE[prev.length % SWATCH_CYCLE.length],
      },
    ]);
  }

  return (
    <div className={cn("flex min-h-dvh w-full font-sans antialiased", ads.canvas)}>
      {/* BigPicture module sidebar — light rail like Jira project apps */}
      <aside
        className={cn(
          "flex w-[248px] shrink-0 flex-col border-r bg-[#F4F5F7] font-sans",
          ads.border,
        )}
      >
        <div
          className={cn(
            "flex h-[52px] items-center gap-2 border-b px-3",
            ads.border,
          )}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-[3px] bg-[#F5CD47] text-[11px] font-bold text-[#172B4D]"
            aria-hidden
          >
            BP
          </span>
          <span className={cn("truncate text-sm font-semibold", ads.ink800)}>
            BigPicture Enterprise
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 text-sm leading-5 text-[#172B4D]">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <Flag className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">Strategic Areas</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <BarChart3 className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">Gantt</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <Users className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">Teams</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <Target className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">OKR</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <ListOrdered className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">Priorities</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <DollarSign className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate">Financials</span>
            <span className={purpleNewBadge}>New</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <LayoutGrid className="size-4 shrink-0 text-[#44546F]" />
            <span className="min-w-0 flex-1 truncate text-left">Board</span>
            <ChevronRight className="size-4 shrink-0 text-[#626F86]" aria-hidden />
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left hover:bg-[#EBECF0]"
          >
            <Trophy className="size-4 shrink-0 text-[#44546F]" />
            <span className="min-w-0 flex-1 truncate text-left">Goals</span>
            <ChevronRight className="size-4 shrink-0 text-[#626F86]" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left font-medium",
              "bg-[#E9F2FF] text-[#0C66E4]",
            )}
          >
            <ShieldAlert className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Risk Management</span>
            <span className={blueNewBadge}>New</span>
          </button>
        </nav>
        <div className={cn("border-t p-2", ads.border)}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left text-[#172B4D] hover:bg-[#EBECF0]"
          >
            <Boxes className="size-4 shrink-0 text-[#44546F]" />
            <span className="truncate text-sm">Box Configuration</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "shrink-0 px-10 pb-5 pt-12 md:px-14 md:pb-6 md:pt-14",
            ads.canvas,
          )}
        >
          <Link to="/" className={cn(ads.linkUi, "inline-block text-[15px] font-semibold")}>
            ← All prototypes
          </Link>
        </div>

        <main className="flex-1 overflow-auto px-6 pb-10 pt-2 md:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={ads.titlePage}>Risk Registers / TEST</h1>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-[3px] border px-2.5 py-1 hover:bg-[#EBECF0]",
                    ads.border,
                    ads.surface,
                    ads.bodyMedium,
                  )}
                >
                  Configuration
                  <ChevronDown className="size-4 opacity-70" />
                </button>
              </div>
              <div className={cn("mt-4 flex gap-6 border-b", ads.border)}>
                <button
                  type="button"
                  className="-mb-px border-b-2 border-[#0C66E4] pb-3 font-sans text-sm font-semibold leading-5 text-[#0C66E4]"
                >
                  Risk register frameworks
                </button>
                <button type="button" className={cn("-mb-px pb-3", ads.tabInactive)}>
                  General settings
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-[3px] bg-[#172B4D] px-4 py-2 font-sans text-sm font-semibold leading-5 text-white hover:bg-[#091E42]"
              >
                Risk
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[3px] border px-3 py-2 hover:bg-[#EBECF0]",
                  ads.border,
                  ads.surface,
                  ads.bodyMedium,
                )}
              >
                <Plus className="size-4" />
                Create new risk calculation
              </button>
            </div>
          </div>

          <div
            className={cn(
              "mt-8 space-y-8 rounded-lg border p-6 shadow-sm md:p-8",
              ads.border,
              ads.surface,
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-[240px] flex-1 space-y-1.5">
                <Label htmlFor="test-framework-name" className={ads.labelField}>
                  Risk framework name
                </Label>
                <input
                  id="test-framework-name"
                  type="text"
                  value={frameworkName}
                  onChange={(e) => setFrameworkName(e.target.value)}
                  className={cn("h-9 w-full", ads.fieldControl)}
                />
              </div>
              <button
                type="button"
                className={cn(
                  "rounded-[3px] border px-4 py-2 font-sans text-sm font-medium leading-5",
                  ads.border,
                  ads.surface,
                  ads.danger,
                  ads.dangerHover,
                )}
              >
                Delete framework
              </button>
            </div>

            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className={ads.overline}>Risk Score</span>
                <button type="button" className={cn(ads.linkUi, "inline text-sm")}>
                  Switch to advanced edit
                </button>
              </div>
              <div
                className={cn(
                  "rounded-[3px] border px-3 py-3",
                  ads.border,
                  ads.surfaceSubtle,
                )}
              >
                <div className={cn("flex flex-wrap items-center gap-2", ads.bodyMedium)}>
                  <span
                    className={cn(
                      "rounded-[3px] border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide",
                      ads.border,
                      ads.surface,
                      ads.ink300,
                    )}
                  >
                    LIKELIHOOD
                  </span>
                  <span className={ads.ink200} aria-hidden>
                    *
                  </span>
                  <span
                    className={cn(
                      "rounded-[3px] border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide",
                      ads.border,
                      ads.surface,
                      ads.ink300,
                    )}
                  >
                    CONSEQUENCE
                  </span>
                </div>
              </div>
              <p className={cn("mt-2", ads.caption)}>
                Use simple math operators as * / - + ( ), numbers and metrics.
              </p>
            </div>

            <div className="space-y-4">
              <p className={cn(ads.bodyMedium)}>Metrics</p>
              <div className="grid gap-6 md:grid-cols-2">
                <ManualMetricCard
                  metricLabel="Likelihood"
                  rows={likelihoodRows}
                  onLabelChange={patchLikelihoodLabel}
                  onValueChange={patchLikelihoodValue}
                  onAddRow={addLikelihoodRow}
                />
                <ManualMetricCard
                  metricLabel="Consequence"
                  rows={consequenceRows}
                  onLabelChange={patchConsequenceLabel}
                  onValueChange={patchConsequenceValue}
                  onAddRow={addConsequenceRow}
                />
              </div>
            </div>

            <div className={cn("border-t pt-6", ads.border)}>
              <button
                type="button"
                className={cn(
                  "rounded-[3px] px-5 py-2.5 font-sans text-sm font-semibold leading-5 text-white",
                  ads.primaryInteractive,
                  ads.primaryInteractiveHover,
                )}
              >
                Save
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
