import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import ChatbotPrototype from "./app/ChatbotPrototype.tsx";
import ChatbotPrototypeV2 from "./app/ChatbotPrototypeV2.tsx";
import GlobalTeamsPage from "./app/GlobalTeamsPage.tsx";
import PrototypesHub from "./app/PrototypesHub.tsx";
import RiskManagementJiraMappingPage from "./app/RiskManagementJiraMappingPage.tsx";
import TeamsDemoPage from "./app/TeamsDemoPage.tsx";
import "./styles/index.css";

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (base === "/") return undefined;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={routerBasename()}>
    <Routes>
      <Route path="/" element={<PrototypesHub />} />
      <Route path="/teams-demo" element={<TeamsDemoPage />} />
      <Route path="/global-teams" element={<GlobalTeamsPage />} />
      <Route path="/chatbot" element={<ChatbotPrototype />} />
      <Route path="/chatbot-v2" element={<ChatbotPrototypeV2 />} />
      <Route
        path="/risk-jira-mapping"
        element={<RiskManagementJiraMappingPage />}
      />
    </Routes>
  </BrowserRouter>,
);
