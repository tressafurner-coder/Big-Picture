import {
  BarChart3,
  ChevronDown,
  Flag,
  Info,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ads } from "./design/atlassianPageTokens";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Label } from "./components/ui/label";
import { cn } from "./components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Switch } from "./components/ui/switch";

/** Demo options — pick which Jira custom field backs each metric. */
const JIRA_CUSTOM_FIELD_OPTIONS = [
  {
    id: "customfield_10042",
    label: "Risk — Likelihood (select list)",
  },
  {
    id: "customfield_10058",
    label: "customfield_10058 · Likelihood scale",
  },
  {
    id: "customfield_10102",
    label: "BP Risk / Likelihood (number)",
  },
  {
    id: "customfield_10117",
    label: "Consequence / Impact (cascading)",
  },
] as const;

const LIKELIHOOD_ROWS = [
  { label: "Rare", value: 1, swatch: "bg-[#006644]" },
  { label: "Unlikely", value: 2, swatch: "bg-[#36B37E]" },
  { label: "Possible", value: 3, swatch: "bg-[#FFAB00]" },
  { label: "Likely", value: 4, swatch: "bg-[#FF5630]" },
  { label: "Certain", value: 5, swatch: "bg-[#BF2600]" },
] as const;

const CONSEQUENCE_ROWS = [
  { label: "Insignificant", value: 1, swatch: "bg-[#006644]" },
  { label: "Low", value: 2, swatch: "bg-[#36B37E]" },
  { label: "Moderate", value: 3, swatch: "bg-[#FFAB00]" },
  { label: "Major", value: 4, swatch: "bg-[#FF5630]" },
  { label: "Severe", value: 5, swatch: "bg-[#BF2600]" },
] as const;

/** Cycle for newly added manual rows (no Jira mode) */
const MANUAL_ROW_SWATCH_CYCLE = [
  "bg-[#006644]",
  "bg-[#36B37E]",
  "bg-[#FFAB00]",
  "bg-[#FF5630]",
  "bg-[#BF2600]",
  "bg-[#626F86]",
] as const;

type TemplateRow = { label: string; value: number; swatch: string };

type JiraFieldContextRow = {
  id: string;
  label: string;
  value: number;
  swatch: string;
};

type JiraFieldContext = {
  id: string;
  name: string;
  rows: JiraFieldContextRow[];
};

/** Contexts are defined in Jira — prototype lists options the admin can attach to the mapping. */
type JiraFieldContextCatalogEntry = {
  id: string;
  name: string;
  template: readonly TemplateRow[];
};

const LIKELIHOOD_JIRA_CONTEXT_CATALOG: JiraFieldContextCatalogEntry[] = [
  {
    id: "jira-ctx-lik-default",
    name: "Default",
    template: LIKELIHOOD_ROWS,
  },
  {
    id: "jira-ctx-lik-software-tmp",
    name: "Software · Team-managed project",
    template: LIKELIHOOD_ROWS,
  },
  {
    id: "jira-ctx-lik-company",
    name: "Company-managed · Scheme B",
    template: LIKELIHOOD_ROWS,
  },
  {
    id: "jira-ctx-lik-itsm",
    name: "IT Service Management · Global",
    template: LIKELIHOOD_ROWS,
  },
];

const CONSEQUENCE_JIRA_CONTEXT_CATALOG: JiraFieldContextCatalogEntry[] = [
  {
    id: "jira-ctx-cons-default",
    name: "Default",
    template: CONSEQUENCE_ROWS,
  },
  {
    id: "jira-ctx-cons-enterprise",
    name: "Enterprise risk matrix",
    template: CONSEQUENCE_ROWS,
  },
  {
    id: "jira-ctx-cons-program",
    name: "Program · Portfolio scheme",
    template: CONSEQUENCE_ROWS,
  },
  {
    id: "jira-ctx-cons-servicedesk",
    name: "Service desk · Customer portal",
    template: CONSEQUENCE_ROWS,
  },
];

const LIKELIHOOD_JIRA_CONTEXT_CATALOG_UI = LIKELIHOOD_JIRA_CONTEXT_CATALOG.map(
  ({ id, name }) => ({ id, name }),
);
const CONSEQUENCE_JIRA_CONTEXT_CATALOG_UI =
  CONSEQUENCE_JIRA_CONTEXT_CATALOG.map(({ id, name }) => ({ id, name }));

function templateToContext(
  ctxId: string,
  name: string,
  template: readonly TemplateRow[],
): JiraFieldContext {
  return {
    id: ctxId,
    name,
    rows: template.map((r, i) => ({
      id: `${ctxId}-row-${i}`,
      label: r.label,
      value: r.value,
      swatch: r.swatch,
    })),
  };
}

const DEFAULT_LIKELIHOOD_CONTEXT = templateToContext(
  LIKELIHOOD_JIRA_CONTEXT_CATALOG[0].id,
  LIKELIHOOD_JIRA_CONTEXT_CATALOG[0].name,
  LIKELIHOOD_JIRA_CONTEXT_CATALOG[0].template,
);
const DEFAULT_CONSEQUENCE_CONTEXT = templateToContext(
  CONSEQUENCE_JIRA_CONTEXT_CATALOG[0].id,
  CONSEQUENCE_JIRA_CONTEXT_CATALOG[0].name,
  CONSEQUENCE_JIRA_CONTEXT_CATALOG[0].template,
);

type MetricContextsBundle = {
  contexts: JiraFieldContext[];
};

function FieldLabelWithHint({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor} className={cn(ads.labelField, "cursor-default")}>
        {children}
      </Label>
      <span className={cn("inline-flex shrink-0", ads.ink200)} title={hint}>
        <Info className="size-3" strokeWidth={1.75} aria-hidden />
      </span>
    </div>
  );
}

function MetricsCard({
  metricLabel,
  manualRows,
  useJiraMode,
  onManualLabelChange,
  onManualValueChange,
  onAddManualRow,
  selectedJiraFieldId,
  onJiraFieldChange,
  jiraContexts,
  jiraContextCatalog,
  onAddJiraContext,
  onRemoveJiraContext,
  onJiraContextRowLabelChange,
  onJiraContextRowValueChange,
}: {
  metricLabel: string;
  /** Editable scale rows when Use Jira Custom Fields is off */
  manualRows: TemplateRow[];
  useJiraMode: boolean;
  onManualLabelChange: (index: number, label: string) => void;
  onManualValueChange: (index: number, value: number) => void;
  onAddManualRow: () => void;
  selectedJiraFieldId: string;
  onJiraFieldChange: (fieldId: string) => void;
  jiraContexts: JiraFieldContext[];
  /** Contexts exposed by Jira for this field — user picks which to map */
  jiraContextCatalog: readonly { id: string; name: string }[];
  onAddJiraContext: (catalogContextId: string) => void;
  onRemoveJiraContext: (id: string) => void;
  onJiraContextRowLabelChange: (
    contextId: string,
    rowIndex: number,
    label: string,
  ) => void;
  onJiraContextRowValueChange: (
    contextId: string,
    rowIndex: number,
    value: number,
  ) => void;
}) {
  const slug = metricLabel.replace(/\s+/g, "-").toLowerCase();
  const [pendingCatalogId, setPendingCatalogId] = useState<string | undefined>(
    undefined,
  );
  const [activeContextId, setActiveContextId] = useState(
    jiraContexts[0]?.id ?? "",
  );

  const availableCatalogEntries = useMemo(
    () =>
      jiraContextCatalog.filter(
        (e) => !jiraContexts.some((c) => c.id === e.id),
      ),
    [jiraContextCatalog, jiraContexts],
  );

  useEffect(() => {
    if (!jiraContexts.some((c) => c.id === activeContextId)) {
      setActiveContextId(jiraContexts[0]?.id ?? "");
    }
  }, [activeContextId, jiraContexts]);

  useEffect(() => {
    if (
      pendingCatalogId &&
      !availableCatalogEntries.some((e) => e.id === pendingCatalogId)
    ) {
      setPendingCatalogId(undefined);
    }
  }, [pendingCatalogId, availableCatalogEntries]);

  const activeContext = jiraContexts.find((c) => c.id === activeContextId);

  const manualTableRows = manualRows.map((r, i) => ({
    id: `manual-${slug}-${i}`,
    label: r.label,
    value: r.value,
    swatch: r.swatch,
  }));

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-lg border shadow-sm",
        ads.border,
        ads.surface,
      )}
    >
      <div className={cn("border-b px-4 py-3", ads.border)}>
        {useJiraMode ? (
          <div className="space-y-3">
            <p className={ads.overline}>{metricLabel}</p>
            <div className="space-y-1.5">
              <FieldLabelWithHint
                htmlFor={`risk-jira-field-${slug}`}
                hint="Maps BigPicture scale rows to options from this Jira custom field."
              >
                Jira Custom Field
              </FieldLabelWithHint>
              <Select
                value={selectedJiraFieldId}
                onValueChange={onJiraFieldChange}
              >
                <SelectTrigger
                  id={`risk-jira-field-${slug}`}
                  className={cn(
                    "flex h-9 w-full items-center justify-between gap-2 text-left hover:bg-[#FAFBFC] data-[placeholder]:text-[#626F86] [&_[data-slot=select-value]]:line-clamp-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#44546F]",
                    ads.fieldControl,
                  )}
                >
                  <SelectValue placeholder="Select custom field" />
                </SelectTrigger>
                <SelectContent
                  className={cn("rounded-[3px] shadow-md", ads.border, ads.surface)}
                >
                  {JIRA_CUSTOM_FIELD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <h3 className={cn(ads.bodyMedium)}>{metricLabel}</h3>
        )}
      </div>
      {useJiraMode ? (
        <div className={cn("space-y-3 px-4 pb-4 pt-3", ads.border, "border-t")}>
          <Accordion
            type="multiple"
            defaultValue={[`add-context-${slug}`, `values-${slug}`]}
            className="space-y-2"
          >
            <AccordionItem
              value={`add-context-${slug}`}
              className={cn(
                "overflow-hidden rounded-[3px] border last:border-b",
                ads.border,
              )}
            >
              <AccordionTrigger className="border-b px-3 py-2.5 text-left hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                <span className={cn("font-medium", ads.bodyMedium)}>
                  Field contexts
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Select
                    value={pendingCatalogId}
                    onValueChange={(contextId) => {
                      setPendingCatalogId(contextId);
                      onAddJiraContext(contextId);
                      setActiveContextId(contextId);
                      setPendingCatalogId(undefined);
                    }}
                    disabled={availableCatalogEntries.length === 0}
                  >
                    <SelectTrigger
                      id={`risk-jira-context-pick-${slug}`}
                      className={cn(
                        "flex h-9 min-w-[12rem] max-w-[20rem] shrink items-center justify-between gap-2 text-left data-[placeholder]:text-[#626F86] [&_[data-slot=select-value]]:line-clamp-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#44546F]",
                        ads.fieldControl,
                      )}
                    >
                      <SelectValue placeholder="Select context from Jira…" />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        "rounded-[3px] shadow-md",
                        ads.border,
                        ads.surface,
                      )}
                    >
                      {availableCatalogEntries.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {availableCatalogEntries.length === 0 &&
                jiraContextCatalog.length > 0 ? (
                  <p className={cn("pt-2 text-sm", ads.caption)}>
                    All contexts from Jira for this field are already in the mapping.
                  </p>
                ) : null}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value={`values-${slug}`}
              className={cn(
                "overflow-hidden rounded-[3px] border last:border-b",
                ads.border,
              )}
            >
              <AccordionTrigger className="border-b px-3 py-2.5 text-left hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                <span className={cn("font-medium", ads.bodyMedium)}>Values</span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-0">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b px-3 py-3">
                  <div className="min-w-[12rem] space-y-1">
                    <Label
                      htmlFor={`risk-jira-context-active-${slug}`}
                      className={cn(ads.labelField)}
                    >
                      Context
                    </Label>
                    <Select
                      value={activeContextId}
                      onValueChange={setActiveContextId}
                      disabled={jiraContexts.length === 0}
                    >
                      <SelectTrigger
                        id={`risk-jira-context-active-${slug}`}
                        className={cn(
                          "flex h-9 min-w-[12rem] max-w-[20rem] items-center justify-between gap-2 text-left data-[placeholder]:text-[#626F86] [&_[data-slot=select-value]]:line-clamp-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#44546F]",
                          ads.fieldControl,
                        )}
                      >
                        <SelectValue placeholder="Select context" />
                      </SelectTrigger>
                      <SelectContent
                        className={cn(
                          "rounded-[3px] shadow-md",
                          ads.border,
                          ads.surface,
                        )}
                      >
                        {jiraContexts.map((ctx) => (
                          <SelectItem key={ctx.id} value={ctx.id}>
                            {ctx.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    disabled={jiraContexts.length <= 1 || !activeContext}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!activeContext) return;
                      onRemoveJiraContext(activeContext.id);
                    }}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[3px] border px-2.5 font-sans text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40",
                      ads.border,
                      ads.surface,
                      ads.danger,
                      ads.surfaceHover,
                    )}
                    aria-label={
                      activeContext
                        ? `Remove context ${activeContext.name} from mapping`
                        : "Remove context from mapping"
                    }
                  >
                    <Trash2 className="size-4 shrink-0" />
                    Remove
                  </button>
                </div>
                {activeContext ? (
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
                      {activeContext.rows.map((row, i) => (
                        <tr key={`${activeContext.id}-${row.id}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={`inline-block size-3 shrink-0 rounded-sm ${row.swatch}`}
                                aria-hidden
                              />
                              <input
                                type="text"
                                value={row.label}
                                onChange={(e) =>
                                  onJiraContextRowLabelChange(
                                    activeContext.id,
                                    i,
                                    e.target.value,
                                  )
                                }
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
                                if (!Number.isNaN(n))
                                  onJiraContextRowValueChange(activeContext.id, i, n);
                              }}
                              className={cn(
                                "min-h-9 w-full min-w-[4rem] max-w-[7rem] tabular-nums",
                                ads.fieldControl,
                              )}
                              aria-label={`${metricLabel} value for ${row.label}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={cn("px-3 py-3 text-sm", ads.caption)}>
                    Add at least one Jira context to edit mapped values.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : (
        <>
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
              {manualTableRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`inline-block size-3 shrink-0 rounded-sm ${row.swatch}`}
                        aria-hidden
                      />
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) =>
                          onManualLabelChange(i, e.target.value)
                        }
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
                        if (!Number.isNaN(n)) onManualValueChange(i, n);
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
            <button
              type="button"
              onClick={onAddManualRow}
              className={cn(ads.linkUi, "inline")}
            >
              + Add value
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RiskManagementJiraMappingPage() {
  const [useJiraCustomFields, setUseJiraCustomFields] = useState(false);
  const [likelihoodJiraFieldId, setLikelihoodJiraFieldId] = useState(
    JIRA_CUSTOM_FIELD_OPTIONS[0].id,
  );
  const [consequenceJiraFieldId, setConsequenceJiraFieldId] = useState(
    JIRA_CUSTOM_FIELD_OPTIONS[3]?.id ?? JIRA_CUSTOM_FIELD_OPTIONS[1].id,
  );

  const [likelihoodMetric, setLikelihoodMetric] = useState<MetricContextsBundle>(
    () => ({
      contexts: [DEFAULT_LIKELIHOOD_CONTEXT],
    }),
  );
  const [consequenceMetric, setConsequenceMetric] =
    useState<MetricContextsBundle>(() => ({
      contexts: [DEFAULT_CONSEQUENCE_CONTEXT],
    }));

  const [likelihoodManualRows, setLikelihoodManualRows] = useState<TemplateRow[]>(
    () => LIKELIHOOD_ROWS.map((r) => ({ ...r })),
  );
  const [consequenceManualRows, setConsequenceManualRows] = useState<TemplateRow[]>(
    () => CONSEQUENCE_ROWS.map((r) => ({ ...r })),
  );

  function patchLikelihoodManualLabel(index: number, label: string) {
    setLikelihoodManualRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, label } : r)),
    );
  }

  function patchLikelihoodManualValue(index: number, value: number) {
    setLikelihoodManualRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, value } : r)),
    );
  }

  function addLikelihoodManualRow() {
    setLikelihoodManualRows((prev) => {
      const swatch =
        MANUAL_ROW_SWATCH_CYCLE[prev.length % MANUAL_ROW_SWATCH_CYCLE.length];
      return [
        ...prev,
        {
          label: `Value ${prev.length + 1}`,
          value: prev.length + 1,
          swatch,
        },
      ];
    });
  }

  function patchConsequenceManualLabel(index: number, label: string) {
    setConsequenceManualRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, label } : r)),
    );
  }

  function patchConsequenceManualValue(index: number, value: number) {
    setConsequenceManualRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, value } : r)),
    );
  }

  function addConsequenceManualRow() {
    setConsequenceManualRows((prev) => {
      const swatch =
        MANUAL_ROW_SWATCH_CYCLE[prev.length % MANUAL_ROW_SWATCH_CYCLE.length];
      return [
        ...prev,
        {
          label: `Value ${prev.length + 1}`,
          value: prev.length + 1,
          swatch,
        },
      ];
    });
  }

  function setLikelihoodFieldAndResetContexts(fieldId: string) {
    setLikelihoodJiraFieldId(fieldId);
    const c = LIKELIHOOD_JIRA_CONTEXT_CATALOG[0];
    const fresh = templateToContext(c.id, c.name, c.template);
    setLikelihoodMetric({ contexts: [fresh] });
  }

  function setConsequenceFieldAndResetContexts(fieldId: string) {
    setConsequenceJiraFieldId(fieldId);
    const c = CONSEQUENCE_JIRA_CONTEXT_CATALOG[0];
    const fresh = templateToContext(c.id, c.name, c.template);
    setConsequenceMetric({ contexts: [fresh] });
  }

  function addLikelihoodContext(catalogContextId: string) {
    const entry = LIKELIHOOD_JIRA_CONTEXT_CATALOG.find(
      (c) => c.id === catalogContextId,
    );
    if (!entry) return;
    setLikelihoodMetric((m) => {
      if (m.contexts.some((c) => c.id === catalogContextId)) return m;
      return {
        contexts: [
          ...m.contexts,
          templateToContext(entry.id, entry.name, entry.template),
        ],
      };
    });
  }

  function addConsequenceContext(catalogContextId: string) {
    const entry = CONSEQUENCE_JIRA_CONTEXT_CATALOG.find(
      (c) => c.id === catalogContextId,
    );
    if (!entry) return;
    setConsequenceMetric((m) => {
      if (m.contexts.some((c) => c.id === catalogContextId)) return m;
      return {
        contexts: [
          ...m.contexts,
          templateToContext(entry.id, entry.name, entry.template),
        ],
      };
    });
  }

  function removeLikelihoodContext(id: string) {
    setLikelihoodMetric((m) => {
      const filtered = m.contexts.filter((c) => c.id !== id);
      if (filtered.length === 0 || filtered.length === m.contexts.length) {
        return m;
      }
      return { contexts: filtered };
    });
  }

  function removeConsequenceContext(id: string) {
    setConsequenceMetric((m) => {
      const filtered = m.contexts.filter((c) => c.id !== id);
      if (filtered.length === 0 || filtered.length === m.contexts.length) {
        return m;
      }
      return { contexts: filtered };
    });
  }

  function patchLikelihoodContextRow(
    contextId: string,
    rowIndex: number,
    value: number,
  ) {
    setLikelihoodMetric((m) => ({
      ...m,
      contexts: m.contexts.map((c) => {
        if (c.id !== contextId) return c;
        const rows = c.rows.map((r, i) =>
          i === rowIndex ? { ...r, value } : r,
        );
        return { ...c, rows };
      }),
    }));
  }

  function patchLikelihoodContextRowLabel(
    contextId: string,
    rowIndex: number,
    label: string,
  ) {
    setLikelihoodMetric((m) => ({
      ...m,
      contexts: m.contexts.map((c) => {
        if (c.id !== contextId) return c;
        const rows = c.rows.map((r, i) =>
          i === rowIndex ? { ...r, label } : r,
        );
        return { ...c, rows };
      }),
    }));
  }

  function patchConsequenceContextRow(
    contextId: string,
    rowIndex: number,
    value: number,
  ) {
    setConsequenceMetric((m) => ({
      ...m,
      contexts: m.contexts.map((c) => {
        if (c.id !== contextId) return c;
        const rows = c.rows.map((r, i) =>
          i === rowIndex ? { ...r, value } : r,
        );
        return { ...c, rows };
      }),
    }));
  }

  function patchConsequenceContextRowLabel(
    contextId: string,
    rowIndex: number,
    label: string,
  ) {
    setConsequenceMetric((m) => ({
      ...m,
      contexts: m.contexts.map((c) => {
        if (c.id !== contextId) return c;
        const rows = c.rows.map((r, i) =>
          i === rowIndex ? { ...r, label } : r,
        );
        return { ...c, rows };
      }),
    }));
  }

  return (
    <div className={cn("flex min-h-dvh w-full font-sans antialiased", ads.canvas)}>
      {/* App shell — ADS sidebar ink */}
      <aside
        className={cn(
          "flex w-[220px] shrink-0 flex-col font-sans",
          ads.sidebarBg,
          ads.sidebarMuted,
        )}
      >
        <div className="flex h-14 items-center border-b border-white/10 px-4 text-sm font-semibold tracking-tight text-white">
          BigPicture Enterprise
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2 text-sm leading-5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-left font-medium hover:bg-white/10"
          >
            <Flag className="size-4 shrink-0 opacity-80" />
            Strategic Areas
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-white/10"
          >
            <BarChart3 className="size-4 shrink-0 opacity-80" />
            Gantt
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-white/10"
          >
            <Users className="size-4 shrink-0 opacity-80" />
            Teams
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-[3px] px-3 py-2 text-left font-medium text-white",
              ads.primaryInteractive,
            )}
          >
            <ShieldAlert className="size-4 shrink-0" />
            <span className="min-w-0 truncate">Risk Management</span>
            <span className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none">
              New
            </span>
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto px-6 py-6">
          <Link to="/" className={ads.linkUi}>
            ← All prototypes
          </Link>

          {/* Page chrome */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
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

          {/* Configuration body */}
          <div
            className={cn(
              "mt-8 space-y-8 rounded-lg border p-6 shadow-sm",
              ads.border,
              ads.surface,
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-[240px] flex-1 space-y-1.5">
                <FieldLabelWithHint
                  htmlFor="risk-framework-name"
                  hint="Name shown for this framework in Risk registers and configuration."
                >
                  Risk framework name
                </FieldLabelWithHint>
                <input
                  id="risk-framework-name"
                  type="text"
                  defaultValue="Risk"
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
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-[3px] border px-4 py-3",
                ads.border,
                ads.surfaceSubtle,
              )}
            >
              <Label
                htmlFor="use-jira-custom-fields"
                className={cn("cursor-pointer font-sans text-sm font-medium leading-5", ads.ink800)}
              >
                Use Jira Custom Fields
              </Label>
              <Switch
                id="use-jira-custom-fields"
                checked={useJiraCustomFields}
                onCheckedChange={setUseJiraCustomFields}
                className="data-[state=checked]:bg-[#0C66E4]"
              />
            </div>

            <div className="space-y-4">
              <p className={ads.overline}>Metrics</p>
              <div className="grid gap-6 md:grid-cols-2">
                <MetricsCard
                  metricLabel="Likelihood"
                  manualRows={likelihoodManualRows}
                  useJiraMode={useJiraCustomFields}
                  onManualLabelChange={patchLikelihoodManualLabel}
                  onManualValueChange={patchLikelihoodManualValue}
                  onAddManualRow={addLikelihoodManualRow}
                  selectedJiraFieldId={likelihoodJiraFieldId}
                  onJiraFieldChange={setLikelihoodFieldAndResetContexts}
                  jiraContexts={likelihoodMetric.contexts}
                  jiraContextCatalog={LIKELIHOOD_JIRA_CONTEXT_CATALOG_UI}
                  onAddJiraContext={addLikelihoodContext}
                  onRemoveJiraContext={removeLikelihoodContext}
                  onJiraContextRowLabelChange={patchLikelihoodContextRowLabel}
                  onJiraContextRowValueChange={patchLikelihoodContextRow}
                />
                <MetricsCard
                  metricLabel="Consequence"
                  manualRows={consequenceManualRows}
                  useJiraMode={useJiraCustomFields}
                  onManualLabelChange={patchConsequenceManualLabel}
                  onManualValueChange={patchConsequenceManualValue}
                  onAddManualRow={addConsequenceManualRow}
                  selectedJiraFieldId={consequenceJiraFieldId}
                  onJiraFieldChange={setConsequenceFieldAndResetContexts}
                  jiraContexts={consequenceMetric.contexts}
                  jiraContextCatalog={CONSEQUENCE_JIRA_CONTEXT_CATALOG_UI}
                  onAddJiraContext={addConsequenceContext}
                  onRemoveJiraContext={removeConsequenceContext}
                  onJiraContextRowLabelChange={patchConsequenceContextRowLabel}
                  onJiraContextRowValueChange={patchConsequenceContextRow}
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

          <p className={cn("mt-6 max-w-3xl leading-relaxed", ads.caption)}>
            Prototype: map Likelihood and Consequence to Jira custom fields; each
            field can define multiple contexts with their own value names and
            weights. Layout mirrors Risk Management configuration for review.
          </p>
        </main>
      </div>
    </div>
  );
}
