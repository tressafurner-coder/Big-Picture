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
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import { Tooltip } from "./components/Tooltip";
import { cn } from "./components/ui/utils";
import { ads } from "./design/atlassianPageTokens";

/** Shown when value names are read-only because metrics are mapped to Jira fields. */
const JIRA_VALUE_NAME_TOOLTIP =
  "You can't edit value names here—they come from Jira.";

/** Demo Jira custom fields — prototype ids; labels numbered for clarity. */
const JIRA_CUSTOM_FIELD_OPTIONS = [
  { id: "customfield_10042", label: "Jira custom field 1" },
  { id: "customfield_10058", label: "Jira custom field 2" },
  { id: "customfield_10102", label: "Jira custom field 3" },
  { id: "customfield_10117", label: "Jira custom field 4" },
] as const;

/** Prototype: contexts per field (as returned from Jira for that custom field). */
type JiraFieldContext = { id: string; label: string };

type MetricRow = { label: string; value: number; swatch: string };

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

const JIRA_FIELD_CONTEXTS: Record<string, JiraFieldContext[]> = {
  customfield_10042: [
    { id: "ctx_default", label: "Default (globally available)" },
    { id: "ctx_bp_prog", label: "BigPicture · Program Epic" },
    { id: "ctx_issue_types", label: "Issue types: Bug, Story, Task" },
  ],
  customfield_10058: [
    { id: "ctx_default", label: "Default" },
    { id: "ctx_risk_proj", label: "Risk register (PROJ-42)" },
  ],
  customfield_10102: [
    { id: "ctx_default", label: "All projects" },
    { id: "ctx_jsw", label: "Jira Software · Scrum template" },
  ],
  customfield_10117: [
    { id: "ctx_default", label: "Default" },
    { id: "ctx_portfolio", label: "Portfolio · PI planning" },
  ],
};

function getContextsForJiraField(fieldId: string): JiraFieldContext[] {
  return JIRA_FIELD_CONTEXTS[fieldId] ?? [{ id: "ctx_default", label: "Default" }];
}

function likelihoodRowsStorageKey(fieldId: string, contextId: string) {
  return `likelihood:${fieldId}:${contextId}`;
}

function consequenceRowsStorageKey(fieldId: string, contextId: string) {
  return `consequence:${fieldId}:${contextId}`;
}

/** Demo-only: different option labels per context so switching context updates the table. */
const LIKELIHOOD_ROWS_BY_FIELD_CONTEXT: Partial<Record<string, readonly MetricRow[]>> = {
  "customfield_10058::ctx_risk_proj": [
    { label: "Negligible", value: 1, swatch: "bg-[#006644]" },
    { label: "Low", value: 2, swatch: "bg-[#36B37E]" },
    { label: "Medium", value: 3, swatch: "bg-[#FFAB00]" },
    { label: "High", value: 4, swatch: "bg-[#FF5630]" },
    { label: "Critical", value: 5, swatch: "bg-[#BF2600]" },
  ],
  "customfield_10042::ctx_bp_prog": [
    { label: "Level A", value: 1, swatch: "bg-[#006644]" },
    { label: "Level B", value: 2, swatch: "bg-[#36B37E]" },
    { label: "Level C", value: 3, swatch: "bg-[#FFAB00]" },
    { label: "Level D", value: 4, swatch: "bg-[#FF5630]" },
    { label: "Level E", value: 5, swatch: "bg-[#BF2600]" },
  ],
};

const CONSEQUENCE_ROWS_BY_FIELD_CONTEXT: Partial<Record<string, readonly MetricRow[]>> = {
  "customfield_10117::ctx_portfolio": [
    { label: "Trivial", value: 1, swatch: "bg-[#006644]" },
    { label: "Small", value: 2, swatch: "bg-[#36B37E]" },
    { label: "Meaningful", value: 3, swatch: "bg-[#FFAB00]" },
    { label: "Large", value: 4, swatch: "bg-[#FF5630]" },
    { label: "Catastrophic", value: 5, swatch: "bg-[#BF2600]" },
  ],
};

function seedLikelihoodRows(fieldId: string, contextId: string): MetricRow[] {
  const k = `${fieldId}::${contextId}`;
  const preset = LIKELIHOOD_ROWS_BY_FIELD_CONTEXT[k];
  if (preset) return preset.map((r) => ({ ...r }));
  return LIKELIHOOD_ROWS_TEMPLATE.map((r) => ({ ...r }));
}

function seedConsequenceRows(fieldId: string, contextId: string): MetricRow[] {
  const k = `${fieldId}::${contextId}`;
  const preset = CONSEQUENCE_ROWS_BY_FIELD_CONTEXT[k];
  if (preset) return preset.map((r) => ({ ...r }));
  return CONSEQUENCE_ROWS_TEMPLATE.map((r) => ({ ...r }));
}

const purpleNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none bg-[#EAE6FF] text-[#5E4DB2]";
const blueNewBadge =
  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none bg-[#DEEBFF] text-[#0747A6]";

function ManualMetricCard({
  metricLabel,
  rows,
  onLabelChange,
  onValueChange,
  jiraMappingEnabled,
  selectedJiraFieldId,
  onJiraFieldChange,
  contextOptions,
  selectedContextId,
  onContextChange,
  peerSelectedFieldId,
  peerMetricName,
}: {
  metricLabel: string;
  rows: MetricRow[];
  onLabelChange: (index: number, label: string) => void;
  onValueChange: (index: number, value: number) => void;
  jiraMappingEnabled: boolean;
  selectedJiraFieldId: string;
  onJiraFieldChange: (fieldId: string) => void;
  /** Contexts for the selected Jira field (from Jira). */
  contextOptions: JiraFieldContext[];
  /** When Jira mapping is on, identifies the active context for row keys. */
  selectedContextId: string;
  onContextChange: (contextId: string) => void;
  /** Other metric's field — cannot be chosen here (mutually exclusive mapping). */
  peerSelectedFieldId: string;
  /** Display name of the other metric (for disabled-option tooltips). */
  peerMetricName: string;
}) {
  const slug = metricLabel.replace(/\s+/g, "-").toLowerCase();
  const fieldSelectId = `test-metric-jira-field-${slug}`;
  const contextSelectId = `test-metric-jira-context-${slug}`;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-lg border shadow-sm",
        ads.border,
        ads.surface,
      )}
    >
      <div className={cn("border-b px-4 py-3", ads.border)}>
        {jiraMappingEnabled ? (
          <div className="w-full min-w-0 space-y-3">
            <div className="space-y-1">
              <Label htmlFor={fieldSelectId} className={ads.labelField}>
                Jira custom field
              </Label>
              <Select value={selectedJiraFieldId} onValueChange={onJiraFieldChange}>
                <SelectTrigger
                  id={fieldSelectId}
                  className={cn(
                    "flex h-9 w-full min-w-0 items-center justify-between gap-2 text-left hover:bg-[#FAFBFC] data-[placeholder]:text-[#626F86] [&_[data-slot=select-value]]:line-clamp-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#44546F]",
                    ads.fieldControl,
                  )}
                >
                  <SelectValue placeholder="Select custom field" />
                </SelectTrigger>
                <SelectContent
                  className={cn("rounded-[3px] shadow-md", ads.border, ads.surface)}
                >
                  {JIRA_CUSTOM_FIELD_OPTIONS.map((opt) => {
                    const takenByPeer = opt.id === peerSelectedFieldId;
                    const takenTooltip = `Nie możesz wybrać tego pola — jest już przypisane do metryki ${peerMetricName}. Jedno pole może być użyte tylko w jednej sekcji.`;
                    return (
                      <SelectItem
                        key={opt.id}
                        value={opt.id}
                        disabled={takenByPeer}
                        title={takenByPeer ? takenTooltip : undefined}
                        className={
                          takenByPeer
                            ? "data-[disabled]:pointer-events-auto data-[disabled]:cursor-not-allowed"
                            : undefined
                        }
                      >
                        {opt.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={contextSelectId} className={ads.labelField}>
                Context
              </Label>
              <Select value={selectedContextId} onValueChange={onContextChange}>
                <SelectTrigger
                  id={contextSelectId}
                  className={cn(
                    "flex h-9 w-full min-w-0 items-center justify-between gap-2 text-left hover:bg-[#FAFBFC] data-[placeholder]:text-[#626F86] [&_[data-slot=select-value]]:line-clamp-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#44546F]",
                    ads.fieldControl,
                  )}
                >
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent
                  className={cn("rounded-[3px] shadow-md", ads.border, ads.surface)}
                >
                  {contextOptions.map((ctx) => (
                    <SelectItem key={ctx.id} value={ctx.id}>
                      {ctx.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className={cn(ads.caption)}>
                Value names and weights below apply to this field context (from Jira).
              </p>
            </div>
          </div>
        ) : (
          <h3 className={cn(ads.bodyMedium)}>{metricLabel}</h3>
        )}
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
            <tr
              key={
                jiraMappingEnabled
                  ? `${slug}-${selectedContextId}-${i}`
                  : `${slug}-${i}`
              }
            >
              <td className="px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`inline-block size-3 shrink-0 rounded-sm ${row.swatch}`}
                    aria-hidden
                  />
                  {jiraMappingEnabled ? (
                    <Tooltip
                      content={JIRA_VALUE_NAME_TOOLTIP}
                      className="w-full min-w-0 flex-1 cursor-default"
                    >
                      <div
                        className={cn(
                          "flex min-h-9 min-w-0 flex-1 items-center rounded-[3px] border border-transparent bg-[#F7F8F9] px-3 py-2 text-sm font-normal leading-5 text-[#626F86]",
                        )}
                        aria-label={`${row.label}, from Jira (value names not editable here)`}
                      >
                        {row.label}
                      </div>
                    </Tooltip>
                  ) : (
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
                  )}
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
    </div>
  );
}

/** Risk Registers configuration — ADS-style shell matching BigPicture in Jira. */
export default function TestPrototypePage() {
  const initialLikelihoodFieldId = JIRA_CUSTOM_FIELD_OPTIONS[0].id;
  const initialConsequenceFieldId =
    JIRA_CUSTOM_FIELD_OPTIONS[3]?.id ?? JIRA_CUSTOM_FIELD_OPTIONS[1].id;

  const [frameworkName, setFrameworkName] = useState("Risk");
  const [likelihoodRows, setLikelihoodRows] = useState<MetricRow[]>(() =>
    LIKELIHOOD_ROWS_TEMPLATE.map((r) => ({ ...r })),
  );
  const [consequenceRows, setConsequenceRows] = useState<MetricRow[]>(() =>
    CONSEQUENCE_ROWS_TEMPLATE.map((r) => ({ ...r })),
  );
  const [likelihoodRowsByContext, setLikelihoodRowsByContext] = useState<
    Record<string, MetricRow[]>
  >({});
  const [consequenceRowsByContext, setConsequenceRowsByContext] = useState<
    Record<string, MetricRow[]>
  >({});
  const [mapMetricsToJiraFields, setMapMetricsToJiraFields] = useState(false);
  const [likelihoodJiraFieldId, setLikelihoodJiraFieldId] = useState(
    initialLikelihoodFieldId,
  );
  const [consequenceJiraFieldId, setConsequenceJiraFieldId] = useState(
    initialConsequenceFieldId,
  );
  const [likelihoodContextId, setLikelihoodContextId] = useState(
    () => getContextsForJiraField(initialLikelihoodFieldId)[0].id,
  );
  const [consequenceContextId, setConsequenceContextId] = useState(
    () => getContextsForJiraField(initialConsequenceFieldId)[0].id,
  );

  const likelihoodDisplayRows = mapMetricsToJiraFields
    ? (likelihoodRowsByContext[
        likelihoodRowsStorageKey(likelihoodJiraFieldId, likelihoodContextId)
      ] ?? seedLikelihoodRows(likelihoodJiraFieldId, likelihoodContextId))
    : likelihoodRows;

  const consequenceDisplayRows = mapMetricsToJiraFields
    ? (consequenceRowsByContext[
        consequenceRowsStorageKey(consequenceJiraFieldId, consequenceContextId)
      ] ?? seedConsequenceRows(consequenceJiraFieldId, consequenceContextId))
    : consequenceRows;

  useEffect(() => {
    if (!mapMetricsToJiraFields) return;
    if (likelihoodJiraFieldId !== consequenceJiraFieldId) return;
    const alternative = JIRA_CUSTOM_FIELD_OPTIONS.find(
      (o) => o.id !== likelihoodJiraFieldId,
    );
    if (alternative) {
      setConsequenceJiraFieldId(alternative.id);
    }
  }, [
    likelihoodJiraFieldId,
    consequenceJiraFieldId,
    mapMetricsToJiraFields,
  ]);

  useEffect(() => {
    const list = getContextsForJiraField(likelihoodJiraFieldId);
    if (!list.some((c) => c.id === likelihoodContextId)) {
      setLikelihoodContextId(list[0].id);
    }
  }, [likelihoodJiraFieldId, likelihoodContextId]);

  useEffect(() => {
    const list = getContextsForJiraField(consequenceJiraFieldId);
    if (!list.some((c) => c.id === consequenceContextId)) {
      setConsequenceContextId(list[0].id);
    }
  }, [consequenceJiraFieldId, consequenceContextId]);

  function patchLikelihoodLabel(i: number, label: string) {
    if (mapMetricsToJiraFields) return;
    setLikelihoodRows((prev) => prev.map((r, j) => (j === i ? { ...r, label } : r)));
  }
  function patchLikelihoodValue(i: number, value: number) {
    if (mapMetricsToJiraFields) {
      setLikelihoodRowsByContext((prev) => {
        const k = likelihoodRowsStorageKey(likelihoodJiraFieldId, likelihoodContextId);
        const rows = prev[k] ?? seedLikelihoodRows(likelihoodJiraFieldId, likelihoodContextId);
        return {
          ...prev,
          [k]: rows.map((r, j) => (j === i ? { ...r, value } : r)),
        };
      });
    } else {
      setLikelihoodRows((prev) =>
        prev.map((r, j) => (j === i ? { ...r, value } : r)),
      );
    }
  }

  function patchConsequenceLabel(i: number, label: string) {
    if (mapMetricsToJiraFields) return;
    setConsequenceRows((prev) =>
      prev.map((r, j) => (j === i ? { ...r, label } : r)),
    );
  }
  function patchConsequenceValue(i: number, value: number) {
    if (mapMetricsToJiraFields) {
      setConsequenceRowsByContext((prev) => {
        const k = consequenceRowsStorageKey(
          consequenceJiraFieldId,
          consequenceContextId,
        );
        const rows = prev[k] ?? seedConsequenceRows(
          consequenceJiraFieldId,
          consequenceContextId,
        );
        return {
          ...prev,
          [k]: rows.map((r, j) => (j === i ? { ...r, value } : r)),
        };
      });
    } else {
      setConsequenceRows((prev) =>
        prev.map((r, j) => (j === i ? { ...r, value } : r)),
      );
    }
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
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-4 rounded-[3px] border px-4 py-3",
                  ads.border,
                  ads.surfaceSubtle,
                )}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <Label
                    htmlFor="map-metrics-jira-fields"
                    className={cn(ads.bodyMedium, "cursor-pointer")}
                  >
                    Map metrics to Jira custom fields
                  </Label>
                  <p className={cn(ads.caption)}>
                    When on, each metric uses its own Jira field mapping; scales stay editable
                    below.
                  </p>
                </div>
                <Switch
                  id="map-metrics-jira-fields"
                  checked={mapMetricsToJiraFields}
                  onCheckedChange={setMapMetricsToJiraFields}
                  className="shrink-0 data-[state=checked]:bg-[#0C66E4]"
                  aria-label="Map metrics to Jira custom fields"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <ManualMetricCard
                  metricLabel="Likelihood"
                  rows={likelihoodDisplayRows}
                  onLabelChange={patchLikelihoodLabel}
                  onValueChange={patchLikelihoodValue}
                  jiraMappingEnabled={mapMetricsToJiraFields}
                  selectedJiraFieldId={likelihoodJiraFieldId}
                  onJiraFieldChange={setLikelihoodJiraFieldId}
                  contextOptions={getContextsForJiraField(likelihoodJiraFieldId)}
                  selectedContextId={likelihoodContextId}
                  onContextChange={setLikelihoodContextId}
                  peerSelectedFieldId={consequenceJiraFieldId}
                  peerMetricName="Consequence"
                />
                <ManualMetricCard
                  metricLabel="Consequence"
                  rows={consequenceDisplayRows}
                  onLabelChange={patchConsequenceLabel}
                  onValueChange={patchConsequenceValue}
                  jiraMappingEnabled={mapMetricsToJiraFields}
                  selectedJiraFieldId={consequenceJiraFieldId}
                  onJiraFieldChange={setConsequenceJiraFieldId}
                  contextOptions={getContextsForJiraField(consequenceJiraFieldId)}
                  selectedContextId={consequenceContextId}
                  onContextChange={setConsequenceContextId}
                  peerSelectedFieldId={likelihoodJiraFieldId}
                  peerMetricName="Likelihood"
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
