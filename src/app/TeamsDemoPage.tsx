import { Link } from "react-router";
import {
  BigPictureTeamsDropdown,
  EMPTY_TEAM_GROUPS,
} from "./components/BigPictureTeamsDropdown";
import { GlobalTeamsSplash } from "./components/GlobalTeamsSplash";

export default function TeamsDemoPage() {
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
