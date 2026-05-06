import { REPORT_ITEMS, type ReportId } from "../reports";
import { cn } from "./ui/utils";

type ReportsModuleProps = {
  reportsSectionEnabled: boolean;
  reportVisibility: Record<ReportId, boolean>;
  archivedBoxesVisible: boolean;
  className?: string;
};

export function ReportsModule({
  reportsSectionEnabled,
  reportVisibility,
  archivedBoxesVisible,
  className,
}: ReportsModuleProps) {
  const visibleReports = REPORT_ITEMS.filter(
    (r) => reportsSectionEnabled && reportVisibility[r.id],
  );

  return (
    <section
      className={cn(
        "w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h2 className="text-lg font-normal text-gray-900">Module</h2>
      <p className="mt-1 text-sm text-gray-500">
        Raporty reagują na menu View — główny przełącznik Reports oraz poszczególne
        pozycje w podmenu.
      </p>

      {archivedBoxesVisible && (
        <div
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          Archived boxes: widoczna sekcja (placeholder).
        </div>
      )}

      {!reportsSectionEnabled && (
        <p className="mt-6 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          Sekcja raportów jest wyłączona — włącz „Reports” w menu View.
        </p>
      )}

      {reportsSectionEnabled && visibleReports.length === 0 && (
        <p className="mt-6 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          Wybierz co najmniej jeden raport w View → Reports.
        </p>
      )}

      {reportsSectionEnabled && visibleReports.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {visibleReports.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-gray-100 bg-sky-50/80 px-4 py-5 shadow-xs"
            >
              <h3 className="font-normal text-gray-900">{r.label}</h3>
              <p className="mt-2 text-xs text-gray-500">
                Placeholder treści raportu — podłącz tu wykres lub tabelę.
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
