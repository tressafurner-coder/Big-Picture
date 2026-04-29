import { CHATBOT_LAST_UPDATE_DISPLAY } from "./lastUpdate";
import { INDEPENDENT_LAST_EDITED } from "../../prototypes/independent/src/prototypeLastEdited";

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
    id: "independent",
    name: "Independent prototype",
    summary:
      "Standalone Vite + React scaffold in prototypes/independent — greenfield starter.",
    lastEdited: INDEPENDENT_LAST_EDITED,
    kind: "static",
    staticPath: "prototypes/independent/",
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
