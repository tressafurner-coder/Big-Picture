import { Link } from "react-router";
import { BigPictureLogo } from "./components/BigPictureLogo";
import { PROTOTYPE_ENTRIES, type PrototypeStatus } from "./prototypesRegistry";

/** Must match `main.tsx` — HashRouter on GH Pages so pathname links miss `/#/route`. */
const USE_HASH_ROUTER = import.meta.env.BASE_URL !== "/";

function hubHashHref(routeSegment: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base === "" ? `#/${routeSegment}` : `${base}/#/${routeSegment}`;
}

function joinBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path.replace(/^\//, "")}`;
}

function statusClass(status: PrototypeStatus): string {
  switch (status) {
    case "Deprecated":
      return "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
    case "Done":
      return "bg-green-50 text-green-800 ring-1 ring-inset ring-green-200";
    case "In progress":
      return "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200";
    case "In Development":
      return "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-200";
    default:
      return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200";
  }
}

export default function PrototypesHub() {
  return (
    <div className="min-h-dvh w-full bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <BigPictureLogo className="mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Prototypes
          </h1>
          <p className="mt-2 text-gray-600">
            Choose a prototype — each link opens the live build on this GitHub
            Pages site.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Created by{" "}
            <span className="font-medium text-gray-700">Karolina Chrzanowska</span>
            . For questions, please get in touch directly.
          </p>
        </header>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 whitespace-nowrap">Last updated</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PROTOTYPE_ENTRIES.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClass(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.summary}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 tabular-nums">
                    {p.lastEdited}
                  </td>
                  <td className="px-4 py-3">
                    {p.kind === "route" && p.routeSegment ? (
                      USE_HASH_ROUTER ? (
                        <a
                          href={hubHashHref(p.routeSegment)}
                          className="inline-flex font-medium text-blue-600 underline-offset-4 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        <Link
                          to={`/${p.routeSegment}`}
                          className="inline-flex font-medium text-blue-600 underline-offset-4 hover:underline"
                        >
                          Open
                        </Link>
                      )
                    ) : p.kind === "static" && p.staticPath ? (
                      <a
                        href={joinBase(p.staticPath)}
                        className="inline-flex font-medium text-blue-600 underline-offset-4 hover:underline"
                      >
                        Open
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
