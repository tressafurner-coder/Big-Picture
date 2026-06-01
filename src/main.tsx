import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router";
import ChatbotPrototype from "./app/ChatbotPrototype.tsx";
import ChatbotPrototypeV2 from "./app/ChatbotPrototypeV2.tsx";
import GlobalTeamsPage from "./app/GlobalTeamsPage.tsx";
import IgniteIskraPage from "./app/IgniteIskraPage.tsx";
import IgniteIskraPageV2 from "./app/IgniteIskraPageV2.tsx";
import IgniteIskraPageV3 from "./app/IgniteIskraPageV3.tsx";
import MergingBoardGoalsPage from "./app/MergingBoardGoalsPage.tsx";
import ShowOnlyValidApiTokensPage from "./app/ShowOnlyValidApiTokensPage.tsx";
import PrototypesHub from "./app/PrototypesHub.tsx";
import TeamsDemoPage from "./app/TeamsDemoPage.tsx";
import TestPrototypePage from "./app/TestPrototypePage.tsx";
import "./styles/index.css";

/**
 * Production GH Pages builds use a non-root `base`; full-page navigations to
 * `/repo/route` often serve no SPA shell. Hash routing keeps "Open" working.
 */
const USE_HASH_ROUTER = import.meta.env.BASE_URL !== "/";

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (base === "/") return undefined;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function rewritePathOnlyUrlToHash(): void {
  if (!USE_HASH_ROUTER) return;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const { pathname, search, hash } = window.location;
  if (hash.length > 1) return;
  if (!pathname.startsWith(base)) return;
  if (
    pathname.length > base.length &&
    pathname.charAt(base.length) !== "/"
  ) {
    return;
  }
  let rest = pathname.slice(base.length);
  if (!rest || rest === "/") return;
  if (!rest.startsWith("/")) rest = `/${rest}`;
  rest = rest.replace(/\/index\.html$/, "") || "/";
  if (!rest || rest === "/") return;
  rest = rest.replace(/\/$/, "") || "/";
  if (rest === "/") return;
  window.history.replaceState(null, "", `${base}/${search}#${rest}`);
}

rewritePathOnlyUrlToHash();

function UnknownPrototypeRoute() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <p className="text-gray-700">
        Nothing is registered at this path in the prototypes hub.
      </p>
      <Link
        to="/"
        className="font-medium text-blue-600 underline-offset-4 hover:underline"
      >
        Back to all prototypes
      </Link>
    </div>
  );
}

const hubRoutes = (
  <Routes>
    <Route path="/" element={<PrototypesHub />} />
    <Route path="/teams-demo" element={<TeamsDemoPage />} />
    <Route path="/global-teams" element={<GlobalTeamsPage />} />
    <Route path="/chatbot" element={<ChatbotPrototype />} />
    <Route path="/chatbot-v2" element={<ChatbotPrototypeV2 />} />
    <Route
      path="/risk-matrix-jira-custom-fields"
      element={<TestPrototypePage />}
    />
    <Route
      path="/risk-matrix-jira-custom-fields/"
      element={<TestPrototypePage />}
    />
    <Route
      path="/merging-board-goals"
      element={<MergingBoardGoalsPage />}
    />
    <Route
      path="/merging-board-goals/"
      element={<MergingBoardGoalsPage />}
    />
    <Route path="/ignite-iskra" element={<IgniteIskraPage />} />
    <Route path="/ignite-iskra/" element={<IgniteIskraPage />} />
    <Route path="/ignite-iskra-v2" element={<IgniteIskraPageV2 />} />
    <Route path="/ignite-iskra-v2/" element={<IgniteIskraPageV2 />} />
    <Route path="/ignite-iskra-v3" element={<IgniteIskraPageV3 />} />
    <Route path="/ignite-iskra-v3/" element={<IgniteIskraPageV3 />} />
    <Route
      path="/ignite-iskra-v3-orange"
      element={<Navigate to="/ignite-iskra-v3" replace />}
    />
    <Route
      path="/ignite-iskra-v3-orange/"
      element={<Navigate to="/ignite-iskra-v3" replace />}
    />
    <Route
      path="/show-only-valid-api-tokens"
      element={<ShowOnlyValidApiTokensPage />}
    />
    <Route
      path="/show-only-valid-api-tokens/"
      element={<ShowOnlyValidApiTokensPage />}
    />
    {/* Legacy URL — keep bookmarks / shared links working */}
    <Route
      path="/test"
      element={<Navigate to="/risk-matrix-jira-custom-fields" replace />}
    />
    <Route
      path="/test/"
      element={<Navigate to="/risk-matrix-jira-custom-fields" replace />}
    />
    <Route path="*" element={<UnknownPrototypeRoute />} />
  </Routes>
);

createRoot(document.getElementById("root")!).render(
  USE_HASH_ROUTER ? (
    <HashRouter>{hubRoutes}</HashRouter>
  ) : (
    <BrowserRouter basename={routerBasename()}>{hubRoutes}</BrowserRouter>
  ),
);
