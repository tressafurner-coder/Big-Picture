/**
 * Identyfikatory raportów na module — spójne z menu View → Reports.
 */
export const REPORT_ITEMS = [
  { id: "boxesByStatus", label: "Boxes by status" },
  { id: "teamsCapacity", label: "Teams capacity" },
  { id: "effortProgress", label: "Effort progress" },
  { id: "okrsByStatus", label: "OKRs by status" },
  { id: "projectHealth", label: "Project health" },
] as const;

export type ReportId = (typeof REPORT_ITEMS)[number]["id"];

export function defaultReportVisibility(): Record<ReportId, boolean> {
  return Object.fromEntries(
    REPORT_ITEMS.map((r) => [r.id, true]),
  ) as Record<ReportId, boolean>;
}
