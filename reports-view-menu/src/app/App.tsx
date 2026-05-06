import { useState } from "react";
import { ReportsModule } from "./components/ReportsModule";
import { ViewMenu } from "./components/ViewMenu";
import { defaultReportVisibility, type ReportId } from "./reports";

export default function App() {
  const [reportsSectionEnabled, setReportsSectionEnabled] = useState(true);
  const [reportVisibility, setReportVisibility] = useState<
    Record<ReportId, boolean>
  >(() => defaultReportVisibility());
  const [archivedBoxesVisible, setArchivedBoxesVisible] = useState(false);

  return (
    <div className="relative min-h-dvh w-full bg-gray-50">
      <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <ViewMenu
          reportsSectionEnabled={reportsSectionEnabled}
          onReportsSectionEnabledChange={setReportsSectionEnabled}
          reportVisibility={reportVisibility}
          onReportVisibilityChange={(id, value) =>
            setReportVisibility((prev) => ({ ...prev, [id]: value }))
          }
          archivedBoxesVisible={archivedBoxesVisible}
          onArchivedBoxesVisibleChange={setArchivedBoxesVisible}
        />
        <p className="pt-1.5 text-right text-xs text-gray-400">
          reports-view-menu (osobny projekt)
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-10">
        <div className="mb-8 w-full max-w-2xl text-center">
          <h1 className="mb-2 text-3xl font-normal text-gray-900">
            Demo: View → Reports
          </h1>
          <p className="text-gray-600">
            Osobna aplikacja — projekt główny (chatbot) pozostaje bez tych zmian.
          </p>
        </div>

        <ReportsModule
          reportsSectionEnabled={reportsSectionEnabled}
          reportVisibility={reportVisibility}
          archivedBoxesVisible={archivedBoxesVisible}
          className="w-full"
        />
      </main>
    </div>
  );
}
