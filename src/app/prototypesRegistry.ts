import {
  CHATBOT_LAST_UPDATE_DISPLAY,
  MERGING_BOARD_GOALS_LAST_UPDATE_DISPLAY,
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
    id: "merging-board-goals",
    name: "Merging Board and Goals modules",
    status: "In progress",
    summary:
      "Standalone exploration of combining Board and Goals in BigPicture — separate codebase path from other prototypes.",
    lastEdited: MERGING_BOARD_GOALS_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "merging-board-goals",
  },
  {
    id: "test",
    name: "Risk matrix with Jira custom fields",
    status: "In progress",
    summary:
      "Risk Registers configuration (BigPicture in Jira): frameworks, Risk Score formula, Likelihood / Consequence metrics.",
    lastEdited: TEST_PROTOTYPE_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "risk-matrix-jira-custom-fields",
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
