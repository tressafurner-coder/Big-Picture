import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  BigPictureTeamsDropdown,
  EMPTY_TEAM_GROUPS,
} from "./components/BigPictureTeamsDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { GlobalTeamsSplash } from "./components/GlobalTeamsSplash";

/** Demo OKR objectives — long copy so the OKR column exercises ellipsis in a narrow layout. */
const OKR_DEMO_ROWS = [
  {
    id: "okr-row-1",
    objective:
      "Increase enterprise ARR adoption across EU regions by aligning roadmap milestones with sales pipeline forecasts and executive steering cadence",
  },
  {
    id: "okr-row-2",
    objective:
      "Reduce platform incident MTTR through observability investments, automated rollback workflows, and clearer ownership across service boundaries",
  },
  {
    id: "okr-row-3",
    objective:
      "Ship unified portfolio reporting dashboards for stakeholders with drill-down by PI, release train, and dependency risk indicators before Q4 planning",
  },
  {
    id: "okr-row-4",
    objective:
      "Modernize integration-layer security posture with OAuth scope reviews, audit-ready access logs, and periodic penetration-test remediation tracking",
  },
] as const;

/** Wide bar: invisible until row hover; gray chrome + no drop shadow (shadow-none). */
const teamsTableWideAddClass =
  "flex h-9 max-h-9 min-h-9 w-full min-w-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-[#172B4D] opacity-0 shadow-none transition-[opacity,background-color,border-color] duration-150 group-hover:border-[#DFE1E6] group-hover:bg-[#F1F2F4] group-hover:opacity-100 group-hover:shadow-none hover:bg-[#EBECF0] focus-visible:border-[#DFE1E6] focus-visible:bg-[#F1F2F4] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/30";

export default function TeamsDemoPage() {
  /** Rows where the user clicked + and the teams multiselect should stay visible. */
  const [teamsPickerOpenRow, setTeamsPickerOpenRow] = useState<Set<string>>(
    () => new Set(),
  );
  /** Per-row open state for the dropdown menu (re-open on + click). */
  const [teamsRowMenuOpen, setTeamsRowMenuOpen] = useState<
    Record<string, boolean>
  >({});

  function revealTeamsPicker(rowKey: string) {
    setTeamsPickerOpenRow((prev) => new Set(prev).add(rowKey));
    setTeamsRowMenuOpen((prev) => ({ ...prev, [rowKey]: true }));
  }

  return (
    <div className="min-h-dvh w-full bg-[#F7F8F9] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="text-sm font-medium text-[#0C66E4] underline-offset-4 hover:underline"
        >
          ← All prototypes
        </Link>

        <header className="mt-6 border-b border-[#DFE1E6] pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#172B4D]">
            Moving Teams from OKR to BigPicture Global Teams
          </h1>
        </header>

        <section className="mt-8 rounded-lg border border-[#DFE1E6] bg-white p-6 shadow-sm">
          <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-[#44546F]">
            Dropdowns behavior
          </p>
          <div className="space-y-10">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#44546F]">
                With teams
              </p>
              <BigPictureTeamsDropdown />
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#44546F]">
                Empty state (no teams configured)
              </p>
              <BigPictureTeamsDropdown groups={EMPTY_TEAM_GROUPS} />
            </div>

            <div className="border-t border-[#DFE1E6] pt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#44546F]">
                In a table
              </p>
              <div className="overflow-hidden rounded-lg border border-[#DFE1E6]">
                <table className="w-full table-fixed border-collapse text-left text-sm text-[#172B4D]">
                  <colgroup>
                    <col className="w-[45%]" />
                    <col className="w-[55%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-[#DFE1E6] bg-[#FAFBFC]">
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#626F86]">
                        OKR
                      </th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#626F86]">
                        Teams
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6]">
                    {OKR_DEMO_ROWS.map((row) => (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-[#F7F8F9]"
                      >
                        <td className="max-w-0 overflow-hidden px-3 py-3 align-middle">
                          <span
                            className="block truncate text-[#44546F]"
                            title={row.objective}
                          >
                            {row.objective}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle">
                          {teamsPickerOpenRow.has(row.id) ? (
                            <div className="flex h-9 max-h-9 min-h-9 w-full max-w-full min-w-0 items-center">
                              <BigPictureTeamsDropdown
                                className="min-w-0 flex-1"
                                compactTriggerUntilSelection
                                defaultMenuOpen
                                open={teamsRowMenuOpen[row.id]}
                                onOpenChange={(open) => {
                                  setTeamsRowMenuOpen((prev) => ({
                                    ...prev,
                                    [row.id]: open,
                                  }));
                                }}
                              />
                            </div>
                          ) : (
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={teamsTableWideAddClass}
                                  aria-label="Add teams"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    queueMicrotask(() =>
                                      revealTeamsPicker(row.id),
                                    );
                                  }}
                                >
                                  <PlusIcon
                                    className="size-5 shrink-0"
                                    strokeWidth={2}
                                  />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                sideOffset={6}
                                className="border-0 bg-[#42526E] px-3 py-2 text-xs font-normal text-white shadow-lg [&_svg]:fill-[#42526E]"
                              >
                                Add teams
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#DFE1E6] bg-white p-6 shadow-sm">
          <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-[#44546F]">
            Splash screens (Global Teams)
          </p>
          <div className="space-y-10">
            <div>
              <p className="mb-3 text-xs font-semibold text-[#626F86]">
                Redirect to Global Teams — no permission to manage
              </p>
              <GlobalTeamsSplash variant="no-permission" />
            </div>
            <div className="border-t border-[#DFE1E6] pt-10">
              <p className="mb-3 text-xs font-semibold text-[#626F86]">
                Redirect to Global Teams — module disabled by administrator
              </p>
              <GlobalTeamsSplash variant="module-disabled" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
