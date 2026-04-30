import {
  CHATBOT_LAST_UPDATE_DISPLAY,
  RISK_MANAGEMENT_JIRA_MAPPING_LAST_UPDATE_DISPLAY,
  TEAMS_PROTOTYPE_LAST_EDITED_DISPLAY,
} from "./generated/prototypeHubDates";

export type PrototypeStatus = "Deprecated" | "In progress" | "Done";

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
    id: "chatbot-v2",
    name: "AI Chatbot for BigPicture (Version 2)",
    status: "Deprecated",
    summary:
      "Second, independent iteration track for chatbot work without impacting the original prototype route.",
    lastEdited: CHATBOT_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "chatbot-v2",
  },
  {
    id: "risk-jira-mapping",
    name: "Jira Custom field mapping in Risk Management module",
    status: "In progress",
    summary:
      "Risk register frameworks UI: framework name, Risk Score formula (metrics), Likelihood and Consequence scales.",
    lastEdited: RISK_MANAGEMENT_JIRA_MAPPING_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "risk-jira-mapping",
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
    status: "In progress",
    summary:
      "Chat page with a corner launcher and conversation overlay (earlier prototype).",
    lastEdited: CHATBOT_LAST_UPDATE_DISPLAY,
    kind: "route",
    routeSegment: "chatbot",
  },
];
