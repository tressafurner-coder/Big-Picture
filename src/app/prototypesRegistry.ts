import {
  CHATBOT_LAST_UPDATE_DISPLAY,
  TEAMS_PROTOTYPE_LAST_EDITED_DISPLAY,
  TEST_PROTOTYPE_LAST_UPDATE_DISPLAY,
} from "./generated/prototypeHubDates";

export type PrototypeStatus =
  | "Deprecated"
  | "In progress"
  | "In Development"
  | "Done";

export type PrototypeEntry = {
  id: string;
  name: string;
  /** Hub column — workflow label shown in the prototypes table. */
  status: PrototypeStatus;
  summary: string;
  lastEdited: string;
  kind: "route" | "static";
  routeSegment?: string;
  staticPath?: string;
};

/** Hub table order: newest / most relevant first — prepend new entries here (top of the list). */
export const PROTOTYPE_ENTRIES: PrototypeEntry[] = [
  {
    id: "test",
    name: "TEST",
    status: "In progress",
    summary:
      "New prototype — placeholder route to iterate on the next project listed here.",
    lastEdited: TEST_PROTOTYPE_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "test",
  },
  {
    id: "teams-dropdown",
    name: "Moving Teams from OKR to BigPicture Global Teams",
    status: "Done",
    summary:
      "Global Teams multi-select, splash screens (no permission / module off), OKR → BigPicture migration.",
    lastEdited: TEAMS_PROTOTYPE_LAST_EDITED_DISPLAY,
    kind: "route",
    routeSegment: "teams-demo",
  },
  {
    id: "chatbot",
    name: "AI Chatbot for BigPicture",
    status: "In Development",
    summary:
      "Chat page with a corner launcher and conversation overlay (earlier prototype).",
    lastEdited: CHATBOT_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "chatbot",
  },
];
