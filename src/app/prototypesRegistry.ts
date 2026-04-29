import { CHATBOT_LAST_UPDATE_DISPLAY } from "./lastUpdate";
import { TEAMS_DEMO_LAST_EDITED } from "./teamsPrototypeMeta";

export type PrototypeEntry = {
  id: string;
  name: string;
  summary: string;
  lastEdited: string;
  kind: "route" | "static";
  routeSegment?: string;
  staticPath?: string;
};

export const PROTOTYPE_ENTRIES: PrototypeEntry[] = [
  {
    id: "teams-dropdown",
    name: "Moving Teams from OKR to BigPicture Global Teams",
    summary:
      "Global Teams multi-select, splash screens (no permission / module off), OKR → BigPicture migration.",
    lastEdited: TEAMS_DEMO_LAST_EDITED,
    kind: "route",
    routeSegment: "teams-demo",
  },
  {
    id: "chatbot",
    name: "AI Chatbot for BigPicture",
    summary:
      "Chat page with a corner launcher and conversation overlay (earlier prototype).",
    lastEdited: CHATBOT_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "chatbot",
  },
];
