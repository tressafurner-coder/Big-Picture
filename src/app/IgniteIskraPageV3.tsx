import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import slackLogo from "../imports/slack-logo.png";
import confluenceLogo from "../imports/confluence-logo.png";
import amplitudeLogo from "../imports/amplitude-logo.png";
import launchdarklyLogo from "../imports/launchdarkly-logo.png";
import jiraLogo from "../imports/jira-logo.png";
import iskraWordmark from "../imports/iskra-wordmark.png";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Trash2, TrendingUp, TrendingDown,
  Bug, MessageSquare, Flag, FileText, CheckCircle,
  Activity, Zap, AlertCircle, RefreshCw,
  Settings, Home, BarChart2, List,
  Search, Bell, Edit2, ArrowLeft, LogOut, ChevronDown, AlertTriangle,
} from "lucide-react";

// ─── Color palettes ──────────────────────────────────────────────────────────
/** Dark theme — warm orange (Ignite Iskra project 3 orange) */
const DARK_PALETTE = {
  bgBase: "#0F0A07",
  bgSurface: "#1A110D",
  bgElevated: "#261A14",
  bgHover: "#32241C",
  border: "rgba(251,146,60,0.12)",
  borderStrong: "rgba(251,146,60,0.22)",
  spark: "#FB923C",
  sparkBright: "#FDBA74",
  sparkFaint: "rgba(249,115,22,0.18)",
  sparkGlow: "rgba(251,146,60,0.32)",
  textPrimary: "#FAFAF9",
  textSecondary: "#E7E5E4",
  textMuted: "#A8A29E",
  success: "#34D399",
  successFaint: "rgba(52,211,153,0.14)",
  warning: "#FBBF24",
  warningFaint: "rgba(251,191,36,0.14)",
  error: "#F87171",
  errorFaint: "rgba(248,113,113,0.14)",
  info: "#FB923C",
  amplitude: "#FB923C",
  amplitudeFaint: "rgba(251,146,60,0.14)",
  jira: "#F59E0B",
  jiraFaint: "rgba(245,158,11,0.14)",
  slack: "#FB7185",
  slackFaint: "rgba(251,113,133,0.12)",
  confluence: "#FDBA74",
  confluenceFaint: "rgba(253,186,116,0.12)",
  launchdarkly: "#FBBF24",
  launchdarklyFaint: "rgba(251,191,36,0.12)",
  shadow: "0 4px 24px rgba(0,0,0,0.35)",
};

const LIGHT_PALETTE = {
  bgBase: "#F5F6FA",
  bgSurface: "#FFFFFF",
  bgElevated: "#F9FAFB",
  bgHover: "#F0EDFF",
  border: "rgba(15,23,42,0.08)",
  borderStrong: "rgba(15,23,42,0.12)",
  spark: "#7C5CE7",
  sparkBright: "#9B8AFB",
  sparkFaint: "rgba(124,92,231,0.12)",
  sparkGlow: "rgba(124,92,231,0.22)",
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  success: "#10B981",
  successFaint: "rgba(16,185,129,0.12)",
  warning: "#F59E0B",
  warningFaint: "rgba(245,158,11,0.12)",
  error: "#EF4444",
  errorFaint: "rgba(239,68,68,0.10)",
  info: "#3B82F6",
  amplitude: "#7C5CE7",
  amplitudeFaint: "rgba(124,92,231,0.10)",
  jira: "#6366F1",
  jiraFaint: "rgba(99,102,241,0.10)",
  slack: "#F472B6",
  slackFaint: "rgba(244,114,182,0.10)",
  confluence: "#38BDF8",
  confluenceFaint: "rgba(56,189,248,0.10)",
  launchdarkly: "#2DD4BF",
  launchdarklyFaint: "rgba(45,212,191,0.10)",
  shadow: "0 4px 24px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
};

/** Warm orange sparkle — complements purple UI accents */
const ISKRA_STAR = {
  gradTop: "#FFD39A",
  gradBottom: "#F97316",
  glow: "rgba(249,115,22,0.38)",
};

let C: typeof LIGHT_PALETTE = LIGHT_PALETTE;
let isDarkMode = false;

function glassPanel(dark = isDarkMode): React.CSSProperties {
  return dark
    ? {
        background: "rgba(38,26,20,0.72)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(251,146,60,0.14)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(251,146,60,0.06)",
      }
    : {
        background: "#FFFFFF",
        border: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
      };
}

function glassActiveNav(): React.CSSProperties {
  if (isDarkMode) {
    return {
      background: "rgba(249,115,22,0.2)",
      border: "1px solid rgba(251,146,60,0.35)",
      boxShadow: "0 2px 12px rgba(249,115,22,0.2)",
    };
  }
  return {
    background: "#F0EDFF",
    border: "1px solid rgba(124,92,231,0.12)",
    boxShadow: "none",
  };
}

function navActiveColor(active: boolean): string {
  if (!active) return isDarkMode ? "rgba(250,250,249,0.62)" : C.textMuted;
  return isDarkMode ? C.sparkBright : C.spark;
}

function primaryCtaFill(dark = isDarkMode): string {
  return dark
    ? "linear-gradient(135deg, #FB923C 0%, #F97316 100%)"
    : "linear-gradient(135deg, #7C5CE7 0%, #7C5CE7 100%)";
}

function primaryCtaShadow(dark = isDarkMode): string {
  return dark ? "0 2px 14px rgba(249,115,22,0.35)" : "0 2px 14px rgba(124,92,231,0.35)";
}

function primaryCtaTextColor(dark = isDarkMode): string {
  return dark ? "#0F0A07" : "#FFFFFF";
}

/** Shared rounded-rectangle shape for all action buttons across the app. */
const BUTTON_RADIUS = 10;
const BUTTON_FONT =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function profileAvatarBg(dark = isDarkMode): string {
  return dark
    ? "linear-gradient(135deg, #FB923C, #F97316)"
    : "linear-gradient(135deg, #7C5CE7, #5B4BD4)";
}

/** Flat sidebar base — close to bgSurface so the cursor spotlight does not fight a loud wash. */
const SIDEBAR_DARK_BASE_BG =
  "linear-gradient(180deg, #1C120E 0%, #1A110D 55%, #18100C 100%)";

function mainContentNotebookBg(isDark: boolean): React.CSSProperties {
  return {
    backgroundColor: isDark ? DARK_PALETTE.bgBase : LIGHT_PALETTE.bgBase,
    backgroundImage: isDark
      ? "linear-gradient(rgba(251,146,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.05) 1px, transparent 1px)"
      : "linear-gradient(rgba(124,92,231,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,231,0.06) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
  };
}

function sidebarSpotlightBackground(mousePos: { x: number; y: number }): string {
  const { x, y } = mousePos;
  // Cursor hotspot only — orange tint, low contrast against the flat base.
  return `radial-gradient(circle 1000px at ${x}px ${y}px, rgba(251, 146, 60, 0.23) 0%, transparent 58%), ${SIDEBAR_DARK_BASE_BG}`;
}

function pageTitleStyle(): React.CSSProperties {
  return {
    fontSize: 22,
    fontWeight: 700,
    color: C.textPrimary,
    margin: "0 0 4px",
    letterSpacing: "-0.3px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };
}

function heroGradientTitleStyle(): React.CSSProperties {
  return {
    ...pageTitleStyle(),
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.4px",
    lineHeight: 1.2,
    backgroundImage: isDarkMode
      ? "linear-gradient(135deg, #FFEDD5 0%, #FB923C 50%, #EA580C 100%)"
      : "linear-gradient(135deg, #4A7FD9 0%, #32B59A 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: C.spark,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
type SourceId = "amplitude" | "jira" | "slack" | "confluence" | "launchdarkly";

interface SavedDashboard {
  id: string; name: string; prompt: string;
  sources: SourceId[]; createdAt: Date;
  lastRefreshedAt?: Date;
}

interface PromptHistoryEntry {
  id: string;
  prompt: string;
  sources: SourceId[];
  name: string;
  createdAt: Date;
  scenario: DashboardScenarioId;
}

type DashboardScenarioId =
  | "default"
  | "full-health"
  | "sprint-health"
  | "engagement"
  | "team-comms"
  | "feature-adoption"
  | "adoption-breakdown"
  | "sunsetting"
  | "release-delays";

interface SupportTicket {
  key: string;
  summary: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  ageDays: number;
}

interface LowUsageFeature {
  eventName: string;
  confluenceUrl: string;
  monthlyUsers: number;
  momChange: number;
}

type LicenseTierId = "T1" | "T2" | "T3" | "T4" | "T5";

interface FeatureTierAdoptionRow {
  tier: LicenseTierId;
  seats: number;
  activeUsers: number;
  adoptionPct: number;
}

interface FeatureAdoptionByTier {
  displayName: string;
  eventName: string;
  jiraEpicKey: string;
  tiers: FeatureTierAdoptionRow[];
}

const LICENSE_TIER_ORDER: LicenseTierId[] = ["T5", "T4", "T3", "T2", "T1"];

interface SunsetBugPriorities {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface SunsetCandidate {
  feature: string;
  monthlyUsers: number;
  openBugs: number;
  oldestBugDays: number;
  avgOpenDays: number;
  supportTickets: number;
  bugPriorities: SunsetBugPriorities;
}

const SUNSET_PRIORITY_LABELS: { key: keyof SunsetBugPriorities; label: string; priority: SupportTicket["priority"] }[] = [
  { key: "critical", label: "Crit", priority: "Critical" },
  { key: "high", label: "High", priority: "High" },
  { key: "medium", label: "Med", priority: "Medium" },
  { key: "low", label: "Low", priority: "Low" },
];

interface ReleaseBlockerBug {
  key: string;
  summary: string;
  status: "Blocked";
  blockedSince: string;
}

interface ReleaseBlocker {
  feature: string;
  bugs: ReleaseBlockerBug[];
}

interface DashboardMock {
  amplitude: {
    dau: number; dauChange: number; mau: number; mauChange: number;
    weeklyEvents: number[];
    topEvents: { name: string; count: number }[];
    retention: number[];
    featureName?: string;
    weeklyAdopters?: number[];
    featureAdoptionByTier?: FeatureAdoptionByTier[];
    lowUsageFeatures?: LowUsageFeature[];
  };
  jira: {
    sprintName: string; done: number; total: number; daysLeft: number;
    open: number; inProgress: number; closed: number;
    critical: number; high: number; medium: number; low: number;
    velocity: number[];
    supportTickets?: SupportTicket[];
    sunsetCandidates?: SunsetCandidate[];
    releaseVersion?: string;
    releasePlanStart?: string;
    releasePlanEnd?: string;
    releaseOriginalDate?: string;
    releaseNewDate?: string;
    releaseBlockers?: ReleaseBlocker[];
  };
  slack: {
    dailyMessages: number[];
    avgResponse: string; responseChange: number;
    channels: { name: string; messages: number }[];
  };
  confluence: {
    totalPages: number; weeklyViews: number; viewsChange: number; coverage: number;
    pages: { title: string; space: string; ago: string }[];
  };
  launchdarkly: {
    active: number; inactive: number; evaluations: string; evalChange: number;
    flags: { key: string; on: boolean; rollout: number; enabledOn?: string; rolloutTarget?: string }[];
    rolloutStarted?: string;
    rolloutTarget?: string;
  };
}

function historyEntryMatchesSaved(entry: PromptHistoryEntry, saved: SavedDashboard | undefined): boolean {
  if (!saved) return false;
  return saved.prompt === entry.prompt
    && saved.name === entry.name
    && JSON.stringify(saved.sources) === JSON.stringify(entry.sources);
}

// ─── Source config (colors read from C at call time — palette switches with theme) ───
const SOURCE_ICONS: Record<SourceId, React.FC<{ size?: number }>> = {
  amplitude:    ({ size = 14 }) => <Activity size={size} />,
  jira:         ({ size = 14 }) => <Bug size={size} />,
  slack:        ({ size = 14 }) => <MessageSquare size={size} />,
  confluence:   ({ size = 14 }) => <FileText size={size} />,
  launchdarkly: ({ size = 14 }) => <Flag size={size} />,
};

const SOURCE_LABELS: Record<SourceId, string> = {
  amplitude: "Amplitude",
  jira: "Jira",
  slack: "Slack",
  confluence: "Confluence",
  launchdarkly: "LaunchDarkly",
};

const SOURCE_LOGOS: Record<SourceId, string> = {
  amplitude: amplitudeLogo,
  jira: jiraLogo,
  slack: slackLogo,
  confluence: confluenceLogo,
  launchdarkly: launchdarklyLogo,
};

function getSourceConfig(source: SourceId): {
  label: string;
  color: string;
  faint: string;
  Icon: React.FC<{ size?: number }>;
} {
  const colors: Record<SourceId, { color: string; faint: string }> = {
    amplitude: { color: C.amplitude, faint: C.amplitudeFaint },
    jira: { color: C.jira, faint: C.jiraFaint },
    slack: { color: C.slack, faint: C.slackFaint },
    confluence: { color: C.confluence, faint: C.confluenceFaint },
    launchdarkly: { color: C.launchdarkly, faint: C.launchdarklyFaint },
  };
  return {
    label: SOURCE_LABELS[source],
    Icon: SOURCE_ICONS[source],
    ...colors[source],
  };
}

const ALL_SOURCES: SourceId[] = ["amplitude", "jira", "slack", "confluence", "launchdarkly"];

const SOURCE_GRADIENTS_LIGHT: Record<SourceId, string> = {
  amplitude:    "linear-gradient(135deg, #9B8AFB 0%, #7C5CE7 100%)",
  jira:         "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
  slack:        "linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)",
  confluence:   "linear-gradient(135deg, #7DD3FC 0%, #38BDF8 100%)",
  launchdarkly: "linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)",
};

const SOURCE_GRADIENTS_DARK: Record<SourceId, string> = {
  amplitude:    "linear-gradient(135deg, #FDBA74 0%, #F97316 100%)",
  jira:         "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
  slack:        "linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)",
  confluence:   "linear-gradient(135deg, #FDE68A 0%, #FB923C 100%)",
  launchdarkly: "linear-gradient(135deg, #FDE047 0%, #EA580C 100%)",
};

function sourceGradient(id: SourceId): string {
  return isDarkMode ? SOURCE_GRADIENTS_DARK[id] : SOURCE_GRADIENTS_LIGHT[id];
}

function SourceLogoBadge({
  source,
  boxSize = 40,
  logoSize = 26,
}: {
  source: SourceId;
  boxSize?: number;
  logoSize?: number;
}) {
  const { label, Icon } = getSourceConfig(source);
  const logo = SOURCE_LOGOS[source];
  const gradient = sourceGradient(source);
  const radius = boxSize <= 24 ? 5 : 10;

  return (
    <div style={{
      width: boxSize,
      height: boxSize,
      borderRadius: radius,
      background: logo ? "white" : gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: logo ? `1px solid ${C.border}` : "none",
    }}>
      {logo
        ? <img src={logo} alt={label} style={{ width: logoSize, height: logoSize, objectFit: "contain" }} />
        : <Icon size={Math.max(11, Math.round(logoSize * 0.65))} />}
    </div>
  );
}

const SOURCE_CARD_METRICS: Record<SourceId, { metric: string; detail: string; spark: number[] }> = {
  amplitude:    { metric: "14.8k DAU",    detail: "+8.2% this week",     spark: [42,38,51,47,55,49,58] },
  jira:         { metric: "68% done",     detail: "Sprint 18 · 4d left", spark: [42,38,51,44,50,48] },
  slack:        { metric: "9.5k msgs",    detail: "7-day total",         spark: [124,98,142,113,151,72,134] },
  confluence:   { metric: "1.2k pages",   detail: "72% coverage",        spark: [48,52,45,58,61,55,68] },
  launchdarkly: { metric: "24 active",    detail: "4.2M evaluations",    spark: [18,20,19,22,21,23,24] },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const DEFAULT_MOCK: DashboardMock = {
  amplitude: {
    dau: 14832, dauChange: 8.2, mau: 52104, mauChange: 3.1,
    weeklyEvents: [42000, 38000, 51000, 47000, 55000, 49000, 58000],
    topEvents: [
      { name: "dashboard_view", count: 28420 }, { name: "feature_clicked", count: 21840 },
      { name: "report_generated", count: 15660 }, { name: "export_triggered", count: 9230 },
      { name: "integration_added", count: 6410 },
    ],
    retention: [100, 62, 44, 38, 31, 28, 24],
  },
  jira: {
    sprintName: "Sprint 18", done: 34, total: 50, daysLeft: 4,
    open: 23, inProgress: 14, closed: 58,
    critical: 2, high: 8, medium: 15, low: 22,
    velocity: [42, 38, 51, 44, 50, 48],
  },
  slack: {
    dailyMessages: [1240, 980, 1420, 1130, 1510, 720, 1340],
    avgResponse: "18m", responseChange: -12,
    channels: [
      { name: "#engineering", messages: 482 }, { name: "#product", messages: 341 },
      { name: "#design", messages: 228 }, { name: "#general", messages: 195 },
      { name: "#data", messages: 163 },
    ],
  },
  confluence: {
    totalPages: 1284, weeklyViews: 3420, viewsChange: 14.8, coverage: 72,
    pages: [
      { title: "Q2 Product Roadmap", space: "Product", ago: "2h ago" },
      { title: "API Authentication Guide", space: "Engineering", ago: "4h ago" },
      { title: "Sprint 18 Planning Notes", space: "Scrum", ago: "1d ago" },
      { title: "Customer Feedback Analysis", space: "Research", ago: "1d ago" },
      { title: "Deployment Runbook v3", space: "Engineering", ago: "2d ago" },
    ],
  },
  launchdarkly: {
    active: 24, inactive: 8, evaluations: "4.2M", evalChange: 22.1,
    flags: [
      { key: "new-dashboard-beta", on: true, rollout: 35, enabledOn: "3 Mar 2026", rolloutTarget: "15 Aug 2026" },
      { key: "enhanced-search", on: true, rollout: 100, enabledOn: "8 Jan 2026", rolloutTarget: "22 Jan 2026" },
      { key: "ai-copilot", on: true, rollout: 12, enabledOn: "18 May 2026", rolloutTarget: "30 Sep 2026" },
      { key: "csv-export-v2", on: false, rollout: 0 },
      { key: "performance-mode", on: true, rollout: 50, enabledOn: "22 Apr 2026", rolloutTarget: "1 Jul 2026" },
    ],
  },
};

const SCENARIO_MOCKS: Record<DashboardScenarioId, DashboardMock> = {
  default: DEFAULT_MOCK,
  "full-health": DEFAULT_MOCK,
  "sprint-health": {
    ...DEFAULT_MOCK,
    jira: {
      ...DEFAULT_MOCK.jira,
      sprintName: "Sprint 18 — Release",
      done: 41, total: 50, daysLeft: 2,
      critical: 3, high: 6, medium: 11, low: 18,
      velocity: [44, 46, 48, 47, 49, 51],
    },
    launchdarkly: {
      ...DEFAULT_MOCK.launchdarkly,
      flags: [
        { key: "release-v4.2.0", on: true, rollout: 0, enabledOn: "1 Jun 2026", rolloutTarget: "29 May 2026" },
        { key: "hotfix-auth-token", on: true, rollout: 100, enabledOn: "28 May 2026", rolloutTarget: "28 May 2026" },
        { key: "deploy-gate-check", on: true, rollout: 100, enabledOn: "15 Jan 2026", rolloutTarget: "15 Jan 2026" },
        { key: "canary-prod-eu", on: true, rollout: 15, enabledOn: "26 May 2026", rolloutTarget: "15 Jun 2026" },
        { key: "rollback-v4.1.9", on: false, rollout: 0 },
      ],
    },
  },
  engagement: {
    ...DEFAULT_MOCK,
    amplitude: {
      ...DEFAULT_MOCK.amplitude,
      dau: 16240, dauChange: 11.4, mau: 54820, mauChange: 4.8,
      weeklyEvents: [48000, 52000, 61000, 58000, 64000, 59000, 67000],
      topEvents: [
        { name: "session_start", count: 41200 }, { name: "dashboard_view", count: 28420 },
        { name: "feature_clicked", count: 21840 }, { name: "onboarding_step", count: 18420 },
        { name: "report_generated", count: 15660 },
      ],
      retention: [100, 68, 44, 36, 30, 27, 23],
    },
  },
  "team-comms": {
    ...DEFAULT_MOCK,
    slack: {
      dailyMessages: [1580, 1420, 1890, 1640, 2100, 980, 1760],
      avgResponse: "14m", responseChange: -18,
      channels: [
        { name: "#release-v4.2", messages: 612 }, { name: "#engineering", messages: 482 },
        { name: "#product", messages: 341 }, { name: "#support-escalations", messages: 287 },
        { name: "#feature-flags", messages: 214 },
      ],
    },
    launchdarkly: {
      ...DEFAULT_MOCK.launchdarkly,
      active: 18, inactive: 6, evaluations: "2.8M", evalChange: 14.3,
      flags: [
        { key: "ai-copilot", on: true, rollout: 12, enabledOn: "18 May 2026", rolloutTarget: "30 Sep 2026" },
        { key: "bigtemplate-v3", on: true, rollout: 35, enabledOn: "12 Mar 2026", rolloutTarget: "30 Jun 2026" },
        { key: "enhanced-search", on: true, rollout: 100, enabledOn: "8 Jan 2026", rolloutTarget: "22 Jan 2026" },
        { key: "csv-export-v2", on: false, rollout: 0 },
      ],
    },
  },
  "feature-adoption": {
    ...DEFAULT_MOCK,
    amplitude: {
      dau: 8420, dauChange: 14.6, mau: 22140, mauChange: 9.2,
      weeklyEvents: [820, 1240, 1860, 2420, 3180, 3940, 4680],
      topEvents: [
        { name: "bigtemplate_opened", count: 4680 },
        { name: "bigtemplate_export_pdf", count: 2140 },
        { name: "bigtemplate_saved", count: 1820 },
        { name: "bigtemplate_shared", count: 940 },
        { name: "bigtemplate_marketplace_view", count: 620 },
      ],
      retention: [100, 72, 58, 49, 42, 38, 34],
      featureName: "BigTemplate v3",
      weeklyAdopters: [120, 340, 580, 920, 1240, 1580, 1920],
    },
    jira: {
      ...DEFAULT_MOCK.jira,
      sprintName: "BT-142 BigTemplate Rework",
      done: 28, total: 32, daysLeft: 6,
      critical: 0, high: 2, medium: 1, low: 1,
      velocity: [18, 22, 24, 26, 28, 30],
      supportTickets: [
        { key: "SUP-4821", summary: "PDF export renders blurry on A4 — low resolution", priority: "High", ageDays: 3 },
        { key: "SUP-4798", summary: "Exported PDF text is pixelated at 150 DPI", priority: "High", ageDays: 5 },
        { key: "SUP-4762", summary: "BigTemplate PDF export quality worse than v2", priority: "Medium", ageDays: 7 },
        { key: "SUP-4710", summary: "Template preview loads slowly on first open", priority: "Low", ageDays: 12 },
      ],
    },
    launchdarkly: {
      active: 12, inactive: 4, evaluations: "840K", evalChange: 38.4,
      rolloutStarted: "12 Mar 2026",
      rolloutTarget: "30 Jun 2026",
      flags: [
        { key: "bigtemplate-v3-rework", on: true, rollout: 35, enabledOn: "12 Mar 2026", rolloutTarget: "30 Jun 2026" },
        { key: "bigtemplate-pdf-hd", on: false, rollout: 0 },
        { key: "bigtemplate-marketplace", on: true, rollout: 100, enabledOn: "5 Feb 2026", rolloutTarget: "18 Feb 2026" },
      ],
    },
  },
  "adoption-breakdown": {
    ...DEFAULT_MOCK,
    amplitude: {
      dau: 8420, dauChange: 14.6, mau: 22140, mauChange: 9.2,
      weeklyEvents: [4680, 4820, 5100, 5240, 5480, 5620, 5890],
      topEvents: [
        { name: "template_editor_open", count: 5890 },
        { name: "export_pdf", count: 4120 },
        { name: "apply_branding", count: 3680 },
        { name: "share_template", count: 2140 },
        { name: "import_csv_data", count: 980 },
      ],
      retention: [100, 72, 58, 49, 42, 38, 34],
      featureName: "BigTemplate v3",
      featureAdoptionByTier: [
        {
          displayName: "Template editor",
          eventName: "template_editor_open",
          jiraEpicKey: "BT-140",
          tiers: [
            { tier: "T5", seats: 96000, activeUsers: 2840, adoptionPct: 74 },
            { tier: "T4", seats: 42000, activeUsers: 2180, adoptionPct: 68 },
            { tier: "T3", seats: 18500, activeUsers: 1420, adoptionPct: 54 },
            { tier: "T2", seats: 8200, activeUsers: 680, adoptionPct: 38 },
            { tier: "T1", seats: 2400, activeUsers: 210, adoptionPct: 22 },
          ],
        },
        {
          displayName: "Export PDF",
          eventName: "export_pdf",
          jiraEpicKey: "BT-141",
          tiers: [
            { tier: "T5", seats: 96000, activeUsers: 3120, adoptionPct: 88 },
            { tier: "T4", seats: 42000, activeUsers: 2640, adoptionPct: 82 },
            { tier: "T3", seats: 18500, activeUsers: 1180, adoptionPct: 61 },
            { tier: "T2", seats: 8200, activeUsers: 420, adoptionPct: 34 },
            { tier: "T1", seats: 2400, activeUsers: 96, adoptionPct: 12 },
          ],
        },
        {
          displayName: "Apply branding",
          eventName: "apply_branding",
          jiraEpicKey: "BT-143",
          tiers: [
            { tier: "T5", seats: 96000, activeUsers: 2480, adoptionPct: 65 },
            { tier: "T4", seats: 42000, activeUsers: 1960, adoptionPct: 58 },
            { tier: "T3", seats: 18500, activeUsers: 1240, adoptionPct: 47 },
            { tier: "T2", seats: 8200, activeUsers: 540, adoptionPct: 31 },
            { tier: "T1", seats: 2400, activeUsers: 144, adoptionPct: 18 },
          ],
        },
        {
          displayName: "Share template",
          eventName: "share_template",
          jiraEpicKey: "BT-144",
          tiers: [
            { tier: "T5", seats: 96000, activeUsers: 1680, adoptionPct: 52 },
            { tier: "T4", seats: 42000, activeUsers: 1320, adoptionPct: 46 },
            { tier: "T3", seats: 18500, activeUsers: 820, adoptionPct: 35 },
            { tier: "T2", seats: 8200, activeUsers: 280, adoptionPct: 19 },
            { tier: "T1", seats: 2400, activeUsers: 72, adoptionPct: 8 },
          ],
        },
        {
          displayName: "Import CSV",
          eventName: "import_csv_data",
          jiraEpicKey: "BT-145",
          tiers: [
            { tier: "T5", seats: 96000, activeUsers: 420, adoptionPct: 14 },
            { tier: "T4", seats: 42000, activeUsers: 380, adoptionPct: 16 },
            { tier: "T3", seats: 18500, activeUsers: 620, adoptionPct: 28 },
            { tier: "T2", seats: 8200, activeUsers: 540, adoptionPct: 42 },
            { tier: "T1", seats: 2400, activeUsers: 380, adoptionPct: 58 },
          ],
        },
      ],
    },
  },
  sunsetting: {
    ...DEFAULT_MOCK,
    amplitude: {
      ...DEFAULT_MOCK.amplitude,
      lowUsageFeatures: [
        { eventName: "legacy_chart_builder", confluenceUrl: "https://appfire.atlassian.net/wiki/spaces/Product/pages/42100/Legacy+Chart+Builder", monthlyUsers: 42, momChange: -28 },
        { eventName: "csv_import_v1", confluenceUrl: "https://appfire.atlassian.net/wiki/spaces/Product/pages/42118/CSV+Import+v1", monthlyUsers: 68, momChange: -19 },
        { eventName: "custom_css_editor", confluenceUrl: "https://appfire.atlassian.net/wiki/spaces/Engineering/pages/43012/Custom+CSS+Editor", monthlyUsers: 91, momChange: -12 },
        { eventName: "bulk_email_sender", confluenceUrl: "https://appfire.atlassian.net/wiki/spaces/Product/pages/43044/Bulk+Email+Sender", monthlyUsers: 124, momChange: -8 },
        { eventName: "old_dashboard_v1", confluenceUrl: "https://appfire.atlassian.net/wiki/spaces/Product/pages/43102/Old+Dashboard+v1", monthlyUsers: 156, momChange: -31 },
      ],
    },
    jira: {
      ...DEFAULT_MOCK.jira,
      critical: 1, high: 5, medium: 12, low: 28,
      sunsetCandidates: [
        { feature: "Legacy Chart Builder", monthlyUsers: 42, openBugs: 14, oldestBugDays: 186, avgOpenDays: 94, supportTickets: 9, bugPriorities: { critical: 2, high: 4, medium: 5, low: 3 } },
        { feature: "CSV Import v1", monthlyUsers: 68, openBugs: 11, oldestBugDays: 142, avgOpenDays: 78, supportTickets: 6, bugPriorities: { critical: 1, high: 3, medium: 4, low: 3 } },
        { feature: "Custom CSS Editor", monthlyUsers: 91, openBugs: 8, oldestBugDays: 98, avgOpenDays: 52, supportTickets: 4, bugPriorities: { critical: 0, high: 2, medium: 3, low: 3 } },
        { feature: "Old Dashboard v1", monthlyUsers: 156, openBugs: 7, oldestBugDays: 76, avgOpenDays: 41, supportTickets: 3, bugPriorities: { critical: 0, high: 1, medium: 3, low: 3 } },
        { feature: "Bulk Email Sender", monthlyUsers: 124, openBugs: 5, oldestBugDays: 64, avgOpenDays: 38, supportTickets: 2, bugPriorities: { critical: 0, high: 1, medium: 2, low: 2 } },
      ],
    },
  },
  "release-delays": {
    ...DEFAULT_MOCK,
    jira: {
      ...DEFAULT_MOCK.jira,
      sprintName: "Release v4.2.0",
      done: 38, total: 50, daysLeft: 0,
      critical: 4, high: 7, medium: 9, low: 14,
      releaseVersion: "v4.2.0",
      releasePlanStart: "1 May 2026",
      releasePlanEnd: "15 May 2026",
      releaseOriginalDate: "15 May 2026",
      releaseNewDate: "29 May 2026",
      releaseBlockers: [
        {
          feature: "PDF Export (BigTemplate)",
          bugs: [
            { key: "BUG-3841", summary: "Memory leak on large PDF export", status: "Blocked", blockedSince: "8 May 2026" },
            { key: "BUG-3829", summary: "Export fails silently for >50-page templates", status: "Blocked", blockedSince: "10 May 2026" },
          ],
        },
        {
          feature: "Auth Token Refresh",
          bugs: [
            { key: "BUG-3812", summary: "Session expires during long-running export", status: "Blocked", blockedSince: "12 May 2026" },
          ],
        },
      ],
    },
  },
};

let activeDashboardMock: DashboardMock = DEFAULT_MOCK;
let activeScenario: DashboardScenarioId = "default";

function getMock(): DashboardMock {
  return activeDashboardMock;
}

function setDashboardContext(scenario: DashboardScenarioId) {
  activeScenario = scenario;
  activeDashboardMock = SCENARIO_MOCKS[scenario];
}

const QUICK_INSIGHTS = [
  { date: "Today", events: [
    { time: "10:00", source: "amplitude" as SourceId, label: "DAU spike detected", detail: "+8.2% vs yesterday" },
    { time: "13:20", source: "jira" as SourceId, label: "Sprint 18 update", detail: "4 days left, 68% done" },
    { time: "15:45", source: "launchdarkly" as SourceId, label: "Flag deployed", detail: "ai-copilot → 12% rollout" },
  ]},
  { date: "Yesterday", events: [
    { time: "09:30", source: "slack" as SourceId, label: "#engineering active", detail: "482 messages, peak day" },
    { time: "11:00", source: "confluence" as SourceId, label: "3 pages updated", detail: "Q2 Roadmap, API Guide…" },
    { time: "16:15", source: "amplitude" as SourceId, label: "Retention report", detail: "Week 2 retention: 44%" },
  ]},
];

interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: "sprint-health", label: "Show sprint health and deployment readiness", prompt: "Show sprint health and deployment readiness" },
  { id: "engagement", label: "User engagement and retention overview", prompt: "User engagement and retention overview" },
  { id: "team-comms", label: "Team communication and feature flag status", prompt: "Team communication and feature flag status" },
  { id: "full-health", label: "Full product health across all sources", prompt: "Full product health across all sources" },
  { id: "feature-adoption", label: "New feature adoption & support feedback", prompt: "We released new reworked BigTemplate to the marketplace. What is the adoption and user feedback?" },
  { id: "adoption-breakdown", label: "Functionality adoption breakdown", prompt: "We released new reworked BigTemplate to the marketplace. What are the most used features? Break them down by user license tier." },
  { id: "sunsetting", label: "Sunsetting features or products", prompt: "Which features are least used and have most unresolved bugs for the longest time? Help me find features to remove from the app to simplify it." },
  { id: "release-delays", label: "Release delays from blocked bugs", prompt: "Bugs related to which features caused the last release to be postponed?" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function detectScenario(prompt: string): DashboardScenarioId {
  const t = prompt.toLowerCase();
  if (/bigtemplate.*adoption.*feedback|adoption and user feedback/.test(t)) return "feature-adoption";
  if (/most used features|license tier|break them down by user/.test(t)) return "adoption-breakdown";
  if (/least used|unresolved bugs|features to remove|sunset|cause most problems/.test(t)) return "sunsetting";
  if (/release.*postponed|caused the last release|release delay/.test(t)) return "release-delays";
  if (/sprint health|deployment readiness/.test(t)) return "sprint-health";
  if (/engagement|retention overview/.test(t)) return "engagement";
  if (/team communication|feature flag status/.test(t)) return "team-comms";
  if (/full product health|across all sources/.test(t)) return "full-health";
  return "default";
}

const SCENARIO_SOURCES: Record<DashboardScenarioId, SourceId[] | null> = {
  default: null,
  "full-health": [...ALL_SOURCES],
  "sprint-health": ["jira", "launchdarkly"],
  engagement: ["amplitude"],
  "team-comms": ["slack", "launchdarkly"],
  "feature-adoption": ["amplitude", "jira", "launchdarkly"],
  "adoption-breakdown": ["amplitude"],
  sunsetting: ["jira", "amplitude"],
  "release-delays": ["jira"],
};

function detectSources(prompt: string, scenario: DashboardScenarioId): SourceId[] {
  const scenarioSources = SCENARIO_SOURCES[scenario];
  if (scenarioSources) return scenarioSources;
  const t = prompt.toLowerCase();
  const found: SourceId[] = [];
  if (/amp|event|user|analytic|retention|funnel|dau|mau|session|track|adoption/.test(t)) found.push("amplitude");
  if (/jira|sprint|bug|issue|task|ticket|velocity|backlog|story|support|feedback/.test(t)) found.push("jira");
  if (/slack|message|channel|team|chat|thread|communication/.test(t)) found.push("slack");
  if (/confluence|doc|wiki|page|knowledge|content/.test(t)) found.push("confluence");
  if (/launch|darkly|flag|feature|rollout|toggle|canary|release/.test(t)) found.push("launchdarkly");
  return found.length > 0 ? found : [...ALL_SOURCES];
}

function dashboardName(prompt: string): string {
  const stops = new Set(["show","me","and","the","for","what","is","are","a","an","with","in","of","to","full","all","our"]);
  const words = prompt.split(/\s+/).filter(w => w.length > 3 && !stops.has(w.toLowerCase())).slice(0, 3);
  if (!words.length) return "New Dashboard";
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function formatDataRefreshTime(date: Date): string {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function widgetBarTrack(): string {
  return isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
}

function ticketPriorityColor(priority: SupportTicket["priority"]): string {
  if (priority === "Critical") return C.error;
  if (priority === "High") return C.warning;
  return C.textMuted;
}

function bugReleaseStatusColor(status: string): string {
  if (status === "Blocked") return C.error;
  return C.textMuted;
}

function coverageColor(pct: number): string {
  if (pct >= 80) return C.success;
  if (pct >= 60) return C.warning;
  return C.error;
}

const WIDGET_FONT = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function wfTitle(): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 12, fontWeight: 600, color: C.textSecondary };
}

function wfMetric(): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" };
}

function wfStat(): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 12, fontWeight: 700, color: C.textPrimary };
}

function wfLabel(): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 11, color: C.textMuted };
}

function wfBody(color: string = C.textSecondary): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 12, color };
}

function wfBodyStrong(color: string = C.textPrimary): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 12, fontWeight: 600, color };
}

function wfColHeader(): React.CSSProperties {
  return {
    fontFamily: WIDGET_FONT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: C.textMuted,
  };
}

function wfSectionTitle(): React.CSSProperties {
  return { ...wfColHeader(), marginBottom: 8 };
}

function wfBadge(color: string): React.CSSProperties {
  return { fontFamily: WIDGET_FONT, fontSize: 11, fontWeight: 600, color };
}

function codeTagStyle(): React.CSSProperties {
  return {
    ...wfBody(isDarkMode ? C.sparkBright : C.spark),
    background: C.sparkFaint,
    padding: "1px 6px",
    borderRadius: 4,
  };
}

function widgetTitleLabelStyle(): React.CSSProperties {
  return {
    ...wfLabel(),
    background: isDarkMode ? "rgba(255,255,255,0.06)" : C.bgElevated,
    border: `1px solid ${C.border}`,
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 500,
    letterSpacing: "0.01em",
  };
}

const JIRA_BROWSE_URL = "https://appfire.atlassian.net/browse";

function jiraIssueUrl(key: string): string {
  return `${JIRA_BROWSE_URL}/${key}`;
}

function JiraIssueLink({ issueKey, style }: { issueKey: string; style?: React.CSSProperties }) {
  return (
    <a
      href={jiraIssueUrl(issueKey)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...wfBody(isDarkMode ? C.sparkBright : C.spark),
        textDecoration: "none",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {issueKey}
    </a>
  );
}

function ConfluenceDocLink({ href, label, style }: { href: string; label: string; style?: React.CSSProperties }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...wfBody(isDarkMode ? C.sparkBright : C.spark),
        textDecoration: "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {label}
    </a>
  );
}

// ─── SVG charts ───────────────────────────────────────────────────────────────
function Sparkline({ values, color = C.spark }: { values: number[]; color?: string }) {
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const W = 120, H = 40;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * W, y: H - ((v - min) / range) * (H - 6) - 3 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const safeId = `sg${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const fill = `${line} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 40 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${safeId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TinySparkline({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const W = 100, H = 22;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * W, y: H - ((v - min) / range) * (H - 4) - 2 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
      <path d={line} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniBar({ values, color = C.spark }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  const H = 48, W = 100, bw = (W / values.length) * 0.55, gap = (W / values.length) * 0.45;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
      {values.map((v, i) => {
        const bh = (v / max) * (H - 6);
        return <rect key={i} x={i * (bw + gap) + gap * 0.5} y={H - bh - 3} width={bw} height={bh} rx="2" fill={color} opacity={i === values.length - 1 ? 1 : 0.4} />;
      })}
    </svg>
  );
}

function DonutRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = 24, cx = 32, cy = 32, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Widget shell ─────────────────────────────────────────────────────────────
function W({ title, source, span = 1, badge, label, children, delay = 0, summaryTooltip, compact }: {
  title: string; source: SourceId; span?: 1 | 2 | 3;
  badge?: string; label?: string; children: React.ReactNode; delay?: number;
  summaryTooltip?: string; compact?: boolean;
}) {
  const { color, label: sourceLabel } = getSourceConfig(source);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel(),
        fontFamily: WIDGET_FONT,
        borderRadius: compact ? 12 : 16,
        padding: compact ? "12px 14px 14px" : "18px 20px 20px",
        gridColumn: span > 1 ? `span ${span}` : undefined,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: compact ? 8 : 14, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          <span style={wfTitle()}>{title}</span>
          {label && <span style={widgetTitleLabelStyle()}>{label}</span>}
          {badge && <span style={{ ...wfBadge(color), background: `${color}18`, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>}
        </div>
        <div className={`w-tooltip-wrap-${source}`} style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(".w-tooltip"); if (t) t.style.opacity = "1"; }}
          onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(".w-tooltip"); if (t) t.style.opacity = "0"; }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", ...wfLabel(), fontWeight: 700, userSelect: "none" }}>?</div>
          <div className="w-tooltip" style={{ position: "absolute", right: 0, top: 22, background: C.bgSurface, border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: "8px 12px", minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none", zIndex: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {summaryTooltip ? (
                <>
                  <Zap size={12} color={C.spark} aria-hidden />
                  <span style={{ ...wfBodyStrong(), fontWeight: 700 }}>Iskra</span>
                </>
              ) : (
                <>
                  <SourceLogoBadge source={source} boxSize={20} logoSize={14} />
                  <span style={{ ...wfBodyStrong(), fontWeight: 700 }}>{sourceLabel}</span>
                </>
              )}
            </div>
            <div style={{ ...wfLabel(), lineHeight: 1.5 }}>
              {summaryTooltip ?? (
                <>Data sourced from <strong style={{ color: C.textSecondary }}>{sourceLabel}</strong> integration.</>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Widget components ────────────────────────────────────────────────────────
function WidgetAmplitudeDAU({ delay }: { delay: number }) {
  const d = getMock().amplitude;
  return (
    <W title="Active Users" source="amplitude" delay={delay}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        {[{ v: d.dau, ch: d.dauChange, label: "DAU" }, { v: d.mau, ch: d.mauChange, label: "MAU" }].map(item => (
          <div key={item.label}>
            <div style={wfMetric()}>{fmt(item.v)}</div>
            <div style={{ ...wfLabel(), marginTop: 2 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <TrendingUp size={11} color={C.success} />
              <span style={wfBody(C.success)}>{item.ch}%</span>
            </div>
          </div>
        ))}
      </div>
      <Sparkline values={d.retention} />
      <div style={{ marginTop: 6 }}>
        <span style={widgetTitleLabelStyle()}>7-day retention curve</span>
      </div>
    </W>
  );
}

function WidgetAmplitudeEvents({ delay }: { delay: number }) {
  const d = getMock().amplitude;
  const adopters = d.weeklyAdopters;
  const values = adopters ?? d.weeklyEvents;
  const totalLabel = adopters ? "new adopters this week" : "total this week";
  return (
    <W
      title={adopters ? `${d.featureName ?? "Feature"} adoption` : "Event Volume"}
      label="7 days"
      source="amplitude"
      span={2}
      delay={delay}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={wfMetric()}>{fmt(values.reduce((a, b) => a + b))}</div>
          <div style={wfLabel()}>{totalLabel}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 4 }}>
          <TrendingUp size={12} color={C.success} />
          <span style={wfBody(C.success)}>+{d.dauChange}% vs last week</span>
        </div>
      </div>
      <MiniBar values={values} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d} style={wfLabel()}>{d}</span>)}
      </div>
    </W>
  );
}

function WidgetAmplitudeTopEvents({ delay }: { delay: number }) {
  const d = getMock().amplitude;
  const max = d.topEvents[0].count;
  return (
    <W
      title={d.featureName ?? "Top Events"}
      label={d.featureName ? "top events" : undefined}
      source="amplitude"
      delay={delay}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {d.topEvents.map((e, i) => (
          <div key={e.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={wfBody()}>{e.name}</span>
              <span style={wfLabel()}>{fmt(e.count)}</span>
            </div>
            <div style={{ height: 3, background: widgetBarTrack(), borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(e.count / max) * 100}%`, background: C.spark, borderRadius: 2, opacity: 1 - i * 0.12 }} />
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetJiraSprint({ delay }: { delay: number }) {
  const d = getMock().jira;
  const pct = Math.round((d.done / d.total) * 100);
  return (
    <W title={d.sprintName} source="jira" badge={`${d.daysLeft}d left`} delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <DonutRing pct={pct} color={C.spark} size={60} />
        <div>
          <div style={wfMetric()}>{pct}%</div>
          <div style={wfLabel()}>{d.done} / {d.total} pts</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[{ label: "Open", val: d.open, color: C.warning }, { label: "In Progress", val: d.inProgress, color: C.textPrimary }, { label: "Done", val: d.closed, color: C.success }].map(item => (
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ ...wfStat(), color: item.color }}>{item.val}</div>
            <div style={{ ...wfLabel(), marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetJiraBugs({ delay }: { delay: number }) {
  const d = getMock().jira;
  const bugs = [{ label: "Critical", val: d.critical, color: C.error }, { label: "High", val: d.high, color: C.warning }, { label: "Medium", val: d.medium, color: C.textSecondary }, { label: "Low", val: d.low, color: C.textMuted }];
  const total = bugs.reduce((s, b) => s + b.val, 0);
  return (
    <W title="Bug Distribution" source="jira" delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bugs.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...wfLabel(), width: 52 }}>{b.label}</span>
            <div style={{ flex: 1, height: 6, background: widgetBarTrack(), borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(b.val / total) * 100}%`, background: b.color, borderRadius: 3 }} />
            </div>
            <span style={{ ...wfBodyStrong(b.color), width: 20, textAlign: "right" }}>{b.val}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "8px 10px", background: d.critical > 0 ? C.errorFaint : C.successFaint, borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
        {d.critical > 0
          ? <><AlertCircle size={12} color={C.error} /><span style={{ ...wfLabel(), color: C.error }}>{d.critical} critical bugs need immediate attention</span></>
          : <><CheckCircle size={12} color={C.success} /><span style={{ ...wfLabel(), color: C.success }}>No critical bugs</span></>}
      </div>
    </W>
  );
}

function WidgetJiraVelocity({ delay }: { delay: number }) {
  const d = getMock().jira;
  const avg = Math.round(d.velocity.reduce((s, v) => s + v) / d.velocity.length);
  return (
    <W title="Velocity" label="last 6 sprints" source="jira" delay={delay}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
        <div style={wfMetric()}>{avg}</div>
        <div style={{ ...wfLabel(), paddingBottom: 4 }}>avg pts / sprint</div>
      </div>
      <MiniBar values={d.velocity} />
    </W>
  );
}

function SummaryCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: "12px 14px",
      borderRadius: 10,
      background: isDarkMode ? "rgba(249,115,22,0.1)" : C.sparkFaint,
      border: `1px solid ${isDarkMode ? "rgba(251,146,60,0.22)" : "rgba(124,92,231,0.14)"}`,
    }}>
      <div style={{ ...wfBodyStrong(), marginBottom: 4 }}>{title}</div>
      <div style={{ ...wfBody(), lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function WidgetTextSummary({ delay }: { delay: number }) {
  const d = getMock();
  const jiraPct = Math.round((d.jira.done / d.jira.total) * 100);
  const jiraAvg = Math.round(d.jira.velocity.reduce((s, v) => s + v) / d.jira.velocity.length);
  const flag = d.launchdarkly.flags[0];
  const pdfTickets = d.jira.supportTickets?.filter(t => /pdf|resolution|pixelat/i.test(t.summary)).length ?? 0;

  let body: React.ReactNode;
  switch (activeScenario) {
    case "feature-adoption":
      body = (
        <>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>BigTemplate v3</strong> rollout is at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{flag.rollout}%</strong>
          {" "}(started {d.launchdarkly.rolloutStarted}, target {d.launchdarkly.rolloutTarget}) with <strong style={{ color: C.textPrimary, fontWeight: 600 }}>1,920 weekly adopters</strong> (+{d.amplitude.dauChange}% WoW).
          {" "}Amplitude shows strong usage of <code style={codeTagStyle()}>bigtemplate_opened</code> and <code style={codeTagStyle()}>bigtemplate_export_pdf</code>.
          {" "}There are <strong style={{ color: C.textPrimary, fontWeight: 600 }}>4 support tickets</strong> — <strong style={{ color: C.error, fontWeight: 600 }}>{pdfTickets} complain about low PDF resolution</strong>. Consider fixing before expanding rollout.
        </>
      );
      break;
    case "adoption-breakdown":
      body = (
        <>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>BigTemplate v3</strong> adoption varies sharply by license tier — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>T5</strong> (largest seat count) leads on export PDF at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>88%</strong>, while <strong style={{ color: C.textPrimary, fontWeight: 600 }}>T1</strong> skews toward import CSV at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>58%</strong>.
          {" "}The most used capability overall is <code style={codeTagStyle()}>template_editor_open</code> ({fmt(d.amplitude.topEvents[0].count)} events/week).
        </>
      );
      break;
    case "sunsetting":
      body = (
        <>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Legacy Chart Builder</strong> is the strongest sunset candidate — only <strong style={{ color: C.textPrimary, fontWeight: 600 }}>42 monthly users</strong>, <strong style={{ color: C.error, fontWeight: 600 }}>14 open bugs</strong> (oldest 186 days), and 9 support tickets.
          {" "}CSV Import v1 and Old Dashboard v1 follow with low usage and long-standing unresolved issues. Removing these could simplify the product without impacting most customers.
        </>
      );
      break;
    case "release-delays":
      body = (
        <>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.jira.releaseVersion}</strong> was postponed from <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.jira.releaseOriginalDate}</strong> to <strong style={{ color: C.error, fontWeight: 600 }}>{d.jira.releaseNewDate}</strong>.
          {" "}Only <strong style={{ color: C.error, fontWeight: 600 }}>Blocked</strong> bugs within the release plan window ({d.jira.releasePlanStart} – {d.jira.releasePlanEnd}) caused the slip — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF Export</strong> and <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Auth Token Refresh</strong>.
        </>
      );
      break;
    case "sprint-health":
      body = (
        <>
          {d.jira.sprintName} is <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{jiraPct}% complete</strong> with {d.jira.daysLeft} days left and <strong style={{ color: C.error, fontWeight: 600 }}>{d.jira.critical} critical bugs</strong> open.
          {" "}Deployment readiness flags show <strong style={{ color: C.textPrimary, fontWeight: 600 }}>release-v4.2.0</strong> at 0% rollout (gated), canary at 15%, and hotfix-auth-token fully deployed.
        </>
      );
      break;
    case "engagement":
      body = (
        <>
          User engagement is trending up — DAU <strong style={{ color: C.textPrimary, fontWeight: 600 }}>+{d.amplitude.dauChange}%</strong> WoW, MAU <strong style={{ color: C.textPrimary, fontWeight: 600 }}>+{d.amplitude.mauChange}%</strong>, with week-2 retention at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>44%</strong>.
          {" "}Top events are <code style={codeTagStyle()}>session_start</code> and <code style={codeTagStyle()}>dashboard_view</code>.
        </>
      );
      break;
    case "team-comms":
      body = (
        <>
          Team activity peaked in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>#release-v4.2</strong> ({d.slack.channels[0].messages} messages) with avg response time down to <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.slack.avgResponse}</strong>.
          {" "}Feature flags: <strong style={{ color: C.textPrimary, fontWeight: 600 }}>bigtemplate-v3</strong> at 35% rollout, <strong style={{ color: C.textPrimary, fontWeight: 600 }}>ai-copilot</strong> at 12%.
        </>
      );
      break;
    default:
      body = (
        <>
          Product engagement remains healthy — DAU is up {d.amplitude.dauChange}% week-over-week, with week-2 retention holding at 44%.
          {" "}Engineering is on track: {d.jira.sprintName} is {jiraPct}% complete with ~{jiraAvg} pts/sprint velocity and {d.jira.critical} critical bugs open.
          {" "}Slack activity peaked in {d.slack.channels[0].name} ({d.slack.channels[0].messages} messages), while Confluence coverage sits at {d.confluence.coverage}%.
          {" "}The <strong style={{ color: C.textPrimary, fontWeight: 600 }}>ai-copilot</strong> flag is at 12% rollout — worth monitoring adoption before expanding.
        </>
      );
  }

  return (
    <W title="Executive summary" source="amplitude" span={3} delay={delay} summaryTooltip="Synthesised by Iskra from your connected data sources.">
      <p style={{ margin: 0, ...wfBody(), lineHeight: 1.65 }}>{body}</p>
    </W>
  );
}

function InsightSection({ title, items }: { title: string; items: React.ReactNode[] }) {
  return (
    <div>
      <div style={wfSectionTitle()}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function WidgetFormattedInsights({ delay }: { delay: number }) {
  const d = getMock();
  const jiraPct = Math.round((d.jira.done / d.jira.total) * 100);

  let intro: React.ReactNode;
  let sections: { title: string; items: React.ReactNode[] }[] = [];
  let callout: { title: string; body: React.ReactNode } | null = null;

  switch (activeScenario) {
    case "feature-adoption":
      intro = <>BigTemplate v3 rollout is <strong style={{ color: C.textPrimary, fontWeight: 600 }}>progressing well on adoption</strong> but user feedback highlights a quality gap in PDF export.</>;
      sections = [
        { title: "Rollout & adoption", items: [
          <>Flag <code style={codeTagStyle()}>bigtemplate-v3-rework</code> at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>35%</strong> — on track for 100% by {d.launchdarkly.rolloutTarget}.</>,
          <>Weekly adopters grew to <strong style={{ color: C.textPrimary, fontWeight: 600 }}>1,920</strong> (+{d.amplitude.dauChange}% WoW).</>,
        ]},
        { title: "Support & feedback", items: [
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>4 open tickets</strong> — 3 about low PDF resolution (<JiraIssueLink issueKey="SUP-4821" />, <JiraIssueLink issueKey="SUP-4798" />, <JiraIssueLink issueKey="SUP-4762" />).</>,
          <>Epic <strong style={{ color: C.textPrimary, fontWeight: 600 }}>BT-142</strong> is {jiraPct}% complete with no critical bugs.</>,
        ]},
      ];
      callout = { title: "Recommended follow-up", body: <>Ask: <em>&quot;What is the distribution of clients using this feature by License Tier?&quot;</em></> };
      break;
    case "adoption-breakdown":
      intro = <>Feature usage within <strong style={{ color: C.textPrimary, fontWeight: 600 }}>BigTemplate v3</strong> is heavily skewed toward higher tiers — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>T5</strong> has the most license seats and drives depth of use on core capabilities.</>;
      sections = [
        { title: "By feature & tier", items: [
          <><JiraIssueLink issueKey="BT-141" /> — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>88% on T5</strong>, only <strong style={{ color: C.textPrimary, fontWeight: 600 }}>12% on T1</strong>.</>,
          <><JiraIssueLink issueKey="BT-140" /> — template editor peaks at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>74% (T5)</strong> vs <strong style={{ color: C.textPrimary, fontWeight: 600 }}>22% (T1)</strong>.</>,
          <><JiraIssueLink issueKey="BT-145" /> — import CSV inverts the curve: <strong style={{ color: C.textPrimary, fontWeight: 600 }}>58% on T1</strong>, <strong style={{ color: C.textPrimary, fontWeight: 600 }}>14% on T5</strong>.</>,
        ]},
      ];
      callout = { title: "Insight", body: <>Tailor onboarding per tier — T1–T2 users rarely reach export or sharing; link each epic in Jira for full scope.</> };
      break;
    case "sunsetting":
      intro = <>Five features qualify as <strong style={{ color: C.textPrimary, fontWeight: 600 }}>sunset candidates</strong> based on low usage, stale bugs, and support load.</>;
      sections = [
        { title: "Top candidates", items: [
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Legacy Chart Builder</strong> — 42 users/mo, 14 bugs, oldest 186 days.</>,
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>CSV Import v1</strong> — 68 users/mo, 11 bugs, 6 support tickets.</>,
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Old Dashboard v1</strong> — usage down 31% MoM.</>,
        ]},
      ];
      callout = { title: "Priority action", body: <>Start deprecation comms for Legacy Chart Builder — highest bug-to-user ratio with no active development.</> };
      break;
    case "release-delays":
      intro = <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.jira.releaseVersion}</strong> slipped 14 days — <strong style={{ color: C.error, fontWeight: 600 }}>3 Blocked bugs</strong> within the release plan ({d.jira.releasePlanStart} – {d.jira.releasePlanEnd}) held the window.</>;
      sections = [
        { title: "Blocked bugs by feature", items: [
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF Export</strong> — <JiraIssueLink issueKey="BUG-3841" style={{ color: C.error, fontWeight: 600 }} /> &amp; <JiraIssueLink issueKey="BUG-3829" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> since 8 &amp; 10 May).</>,
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>Auth Token Refresh</strong> — <JiraIssueLink issueKey="BUG-3812" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> since 12 May).</>,
          <>High/Critical bugs outside the plan window or without Blocked status did <strong style={{ color: C.textPrimary, fontWeight: 600 }}>not</strong> trigger the postponement.</>,
        ]},
      ];
      callout = { title: "Next step", body: <>Resolve Blocked bugs in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF export</strong> first — all three blockers fall inside the original release plan dates.</> };
      break;
    case "full-health":
      intro = (
        <>
          You asked for <strong style={{ color: C.textPrimary, fontWeight: 600 }}>full product health across all sources</strong> — Iskra combined Amplitude, Jira, Slack, Confluence and LaunchDarkly.
          {" "}Engagement and delivery look healthy overall, but <strong style={{ color: C.textPrimary, fontWeight: 600 }}>two cross-source risks</strong> stand out before the next release.
        </>
      );
      sections = [
        { title: "Risk 1 — ai-copilot rollout (LaunchDarkly + Amplitude)", items: [
          <>LaunchDarkly: <code style={codeTagStyle()}>ai-copilot</code> is live at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>12%</strong> — too early to expand without adoption proof.</>,
          <>Amplitude: watch <code style={codeTagStyle()}>feature_clicked</code> and <code style={codeTagStyle()}>dashboard_view</code> in the cohort before raising rollout.</>,
        ]},
        { title: "Risk 2 — release blockers (Jira)", items: [
          <>Only <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> status within the release plan window delays a ship — not Critical or High alone.</>,
          <><JiraIssueLink issueKey="BUG-3841" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span>) — memory leak in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF export / BigTemplate</strong>.</>,
          <><JiraIssueLink issueKey="BUG-3812" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span>) — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Auth token refresh</strong> during long exports.</>,
        ]},
      ];
      callout = { title: "Priority action", body: <>Clear <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> bugs in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF export</strong> and <strong style={{ color: C.textPrimary, fontWeight: 600 }}>auth</strong> within the release plan before expanding <strong style={{ color: C.textPrimary, fontWeight: 600 }}>ai-copilot</strong>.</> };
      break;
    case "sprint-health":
      intro = <>Sprint and deployment readiness review: <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.jira.sprintName}</strong> is on pace, but <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> bugs within the release plan and gated flags block a safe deploy.</>;
      sections = [
        { title: "Sprint progress (Jira)", items: [
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>{jiraPct}% complete</strong> with {d.jira.daysLeft} days left — velocity ~{Math.round(d.jira.velocity.reduce((s, v) => s + v, 0) / d.jira.velocity.length)} pts/sprint.</>,
          <><span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> bugs in the release plan window must clear before ship — Critical/High alone do not postpone.</>,
        ]},
        { title: "Deployment flags (LaunchDarkly)", items: [
          <><code style={codeTagStyle()}>release-v4.2.0</code> at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>0%</strong> — gated until Jira blockers close.</>,
          <><code style={codeTagStyle()}>canary-prod-eu</code> at 15% — canary running; <code style={codeTagStyle()}>hotfix-auth-token</code> fully deployed.</>,
        ]},
      ];
      callout = { title: "Priority action", body: <>Clear <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> bugs in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF export</strong> and <strong style={{ color: C.textPrimary, fontWeight: 600 }}>auth</strong> within the release plan, then ungate <code style={codeTagStyle()}>release-v4.2.0</code>.</> };
      break;
    case "engagement":
      intro = <>User engagement overview: growth is positive, with no blockers — the main watchpoint is whether new users reach core features beyond the first session.</>;
      sections = [
        { title: "Amplitude signals", items: [
          <><strong style={{ color: C.textPrimary, fontWeight: 600 }}>DAU +{d.amplitude.dauChange}%</strong> WoW, <strong style={{ color: C.textPrimary, fontWeight: 600 }}>MAU +{d.amplitude.mauChange}%</strong> — week-2 retention at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>44%</strong>.</>,
          <>Top events: <code style={codeTagStyle()}>session_start</code>, <code style={codeTagStyle()}>dashboard_view</code> — users arrive but depth of use varies.</>,
        ]},
      ];
      callout = { title: "Suggested follow-up", body: <>Ask which cohorts drop off between week 1 and week 2 retention.</> };
      break;
    case "team-comms":
      intro = <>Team communication and feature flag status: release coordination is active in Slack; flag rollouts need alignment with engineering chatter.</>;
      sections = [
        { title: "Slack activity", items: [
          <>Peak channel: <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.slack.channels[0].name}</strong> ({d.slack.channels[0].messages} messages) — release coordination in progress.</>,
          <>Avg response time <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{d.slack.avgResponse}</strong> ({Math.abs(d.slack.responseChange)}% faster than last week).</>,
        ]},
        { title: "Feature flags", items: [
          <><code style={codeTagStyle()}>bigtemplate-v3</code> at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>35%</strong>, <code style={codeTagStyle()}>ai-copilot</code> at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>12%</strong>.</>,
        ]},
      ];
      callout = { title: "Priority action", body: <>Confirm in <strong style={{ color: C.textPrimary, fontWeight: 600 }}>#release-v4.2</strong> that flag rollout matches the deployment runbook.</> };
      break;
    default:
      intro = (
        <>
          Based on your prompt, <strong style={{ color: C.textPrimary, fontWeight: 600 }}>two areas need attention</strong>:{" "}
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>ai-copilot rollout</strong> and{" "}
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>blocked bugs in PDF export &amp; authentication</strong>.
        </>
      );
      sections = [
        { title: "ai-copilot rollout", items: [
          <>The <code style={codeTagStyle()}>ai-copilot</code> flag is at <strong style={{ color: C.textPrimary, fontWeight: 600 }}>12%</strong> — hold expansion until Amplitude shows stable engagement.</>,
        ]},
        { title: "Blocked bugs by feature", items: [
          <><JiraIssueLink issueKey="BUG-3841" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span>) — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>PDF export / BigTemplate</strong> memory leak.</>,
          <><JiraIssueLink issueKey="BUG-3812" style={{ color: C.error, fontWeight: 600 }} /> (<span style={{ color: C.error, fontWeight: 600 }}>Blocked</span>) — <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Auth token refresh</strong> during long exports.</>,
        ]},
      ];
      callout = { title: "Priority action", body: <>Clear <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> bugs in the release plan first; hold ai-copilot expansion until adoption is confirmed.</> };
      break;
  }

  return (
    <W title="Key takeaways" source="jira" span={3} delay={delay} summaryTooltip="Synthesised by Iskra from your connected data sources.">
      <div style={{ display: "flex", flexDirection: "column", gap: 14, ...wfBody(), lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}>{intro}</p>
        {sections.map(s => <InsightSection key={s.title} title={s.title} items={s.items} />)}
        {callout && <SummaryCallout title={callout.title}>{callout.body}</SummaryCallout>}
      </div>
    </W>
  );
}

function WidgetSlackMessages({ delay }: { delay: number }) {
  const d = getMock().slack;
  const total = d.dailyMessages.reduce((s, v) => s + v);
  return (
    <W title="Message Volume" label="7 days" source="slack" span={2} delay={delay}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        <div>
          <div style={wfMetric()}>{fmt(total)}</div>
          <div style={wfLabel()}>messages this week</div>
        </div>
        <div>
          <div style={wfMetric()}>{d.avgResponse}</div>
          <div style={wfLabel()}>avg response time</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            <TrendingDown size={11} color={C.success} />
            <span style={{ ...wfLabel(), color: C.success }}>{Math.abs(d.responseChange)}% faster</span>
          </div>
        </div>
      </div>
      <Sparkline values={d.dailyMessages} />
    </W>
  );
}

function WidgetSlackChannels({ delay }: { delay: number }) {
  const d = getMock().slack;
  const max = d.channels[0].messages;
  return (
    <W title="Most Active Channels" source="slack" delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {d.channels.map((ch, i) => (
          <div key={ch.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={wfBody()}>{ch.name}</span>
              <span style={wfLabel()}>{fmt(ch.messages)}</span>
            </div>
            <div style={{ height: 3, background: widgetBarTrack(), borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(ch.messages / max) * 100}%`, background: C.spark, borderRadius: 2, opacity: 1 - i * 0.12 }} />
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetConfluenceOverview({ delay }: { delay: number }) {
  const d = getMock().confluence;
  return (
    <W title="Documentation Health" source="confluence" delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <DonutRing pct={d.coverage} color={coverageColor(d.coverage)} size={60} />
        <div>
          <div style={wfMetric()}>{d.coverage}%</div>
          <div style={wfLabel()}>doc coverage</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[{ v: fmt(d.totalPages), label: "total pages" }, { v: fmt(d.weeklyViews), label: "weekly views", change: d.viewsChange }].map(item => (
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 10, padding: "8px 10px" }}>
            <div style={wfStat()}>{item.v}</div>
            <div style={wfLabel()}>{item.label}</div>
            {"change" in item && item.change && (
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <TrendingUp size={10} color={C.success} />
                <span style={{ ...wfLabel(), color: C.success }}>{item.change}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetConfluencePages({ delay }: { delay: number }) {
  const d = getMock().confluence;
  return (
    <W title="Recently Updated" source="confluence" span={2} delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {d.pages.map((p, i) => (
          <div key={p.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < d.pages.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <FileText size={13} color={C.textMuted} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...wfBodyStrong(), fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div style={wfLabel()}>{p.space}</div>
            </div>
            <div style={{ ...wfLabel(), flexShrink: 0 }}>{p.ago}</div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetLDOverview({ delay }: { delay: number }) {
  const d = getMock().launchdarkly;
  return (
    <W title="Feature Flag Status" source="launchdarkly" delay={delay}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.bgElevated, borderRadius: 10, padding: "10px 12px" }}>
          <div style={wfMetric()}>{d.active}</div>
          <div style={{ ...wfLabel(), marginTop: 2 }}>active flags</div>
        </div>
        <div style={{ background: C.bgElevated, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ ...wfMetric(), color: C.textMuted }}>{d.inactive}</div>
          <div style={{ ...wfLabel(), marginTop: 2 }}>inactive</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Activity size={12} color={C.textMuted} />
        <span style={wfBody()}>{d.evaluations} evaluations this week</span>
        <TrendingUp size={11} color={C.success} />
        <span style={{ ...wfLabel(), color: C.success }}>+{d.evalChange}%</span>
      </div>
    </W>
  );
}

function WidgetLDFlags({ delay }: { delay: number }) {
  const d = getMock().launchdarkly;
  return (
    <W title="Active Rollouts" source="launchdarkly" span={2} delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {d.flags.map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 28, height: 16, borderRadius: 8, background: f.on ? C.success : "rgba(128,128,128,0.2)", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.2s", flexShrink: 0, marginTop: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", marginLeft: f.on ? "auto" : 0 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={wfBody()}>{f.key}</div>
              <div style={{ ...wfLabel(), marginTop: 3 }}>
                {f.enabledOn ? (
                  <>
                    Enabled <span style={{ color: C.textSecondary }}>{f.enabledOn}</span>
                    {f.rolloutTarget && (
                      <> · 100% by <span style={{ color: C.textSecondary }}>{f.rolloutTarget}</span></>
                    )}
                  </>
                ) : "Not enabled"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={wfBodyStrong()}>{f.rollout}%</span>
              <div style={{ width: 80, height: 4, background: widgetBarTrack(), borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${f.rollout}%`, background: f.on ? C.spark : C.textMuted, borderRadius: 2, opacity: f.on ? 1 : 0.5 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetSupportTickets({ delay }: { delay: number }) {
  const tickets = getMock().jira.supportTickets ?? [];
  const priorityColor = ticketPriorityColor;
  return (
    <W title="Support tickets" source="jira" span={2} delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {tickets.map((t, i) => (
          <div key={t.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < tickets.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <Bug size={13} color={priorityColor(t.priority)} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <JiraIssueLink issueKey={t.key} style={wfLabel()} />
                <span style={{ ...wfLabel(), fontWeight: 600, color: priorityColor(t.priority) }}>{t.priority}</span>
              </div>
              <div style={{ ...wfBodyStrong(), lineHeight: 1.4 }}>{t.summary}</div>
            </div>
            <span style={{ ...wfLabel(), flexShrink: 0 }}>{t.ageDays}d</span>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetFeatureAdoptionByTier({ feature, delay }: { feature: FeatureAdoptionByTier; delay: number }) {
  const max = Math.max(...feature.tiers.map(t => t.adoptionPct), 1);
  return (
    <W title={feature.displayName} source="amplitude" span={1} compact delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <code style={codeTagStyle()}>{feature.eventName}</code>
        <span style={wfLabel()}>·</span>
        <JiraIssueLink issueKey={feature.jiraEpicKey} style={wfBodyStrong()} />
        <span style={wfLabel()}>epic</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LICENSE_TIER_ORDER.map((tierId, i) => {
          const row = feature.tiers.find(t => t.tier === tierId);
          if (!row) return null;
          return (
            <div key={tierId}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, gap: 6 }}>
                <span style={wfBodyStrong()}>{tierId}</span>
                <span style={{ ...wfLabel(), textAlign: "right" }}>{row.adoptionPct}% · {fmt(row.activeUsers)} users</span>
              </div>
              <div style={{ height: 4, background: widgetBarTrack(), borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(row.adoptionPct / max) * 100}%`, background: C.spark, borderRadius: 2, opacity: 1 - i * 0.1 }} />
              </div>
              <div style={{ ...wfLabel(), marginTop: 2 }}>{fmt(row.seats)} seats on tier</div>
            </div>
          );
        })}
      </div>
    </W>
  );
}

function buildFeatureAdoptionWidgets(baseDelay: number): React.ReactNode[] {
  const features = getMock().amplitude.featureAdoptionByTier ?? [];
  return features.map((feature, i) => (
    <WidgetFeatureAdoptionByTier key={feature.eventName} feature={feature} delay={baseDelay + i * 0.04} />
  ));
}

function MomColHeader({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{ ...style, position: "relative", cursor: "help" }}
      onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(".mom-col-tooltip"); if (t) t.style.opacity = "1"; }}
      onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(".mom-col-tooltip"); if (t) t.style.opacity = "0"; }}
    >
      MoM
      <div
        className="mom-col-tooltip"
        style={{
          position: "absolute",
          right: 0,
          bottom: "calc(100% + 6px)",
          background: C.bgSurface,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 8,
          padding: "6px 10px",
          width: 210,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          opacity: 0,
          transition: "opacity 0.15s",
          pointerEvents: "none",
          zIndex: 50,
          ...wfLabel(),
          textTransform: "none",
          letterSpacing: "normal",
          fontWeight: 400,
          lineHeight: 1.45,
          whiteSpace: "normal",
          textAlign: "left",
        }}
      >
        Month over month — % change in usage compared to the previous month.
      </div>
    </div>
  );
}

function WidgetLowUsageFeatures({ delay }: { delay: number }) {
  const features = getMock().amplitude.lowUsageFeatures ?? [];
  const headerStyle: React.CSSProperties = {
    ...wfColHeader(),
    paddingBottom: 3,
    borderBottom: `1px solid ${C.border}`,
  };
  return (
    <W title="Lowest usage" source="amplitude" span={1} compact delay={delay}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 76px 44px", gap: "6px 6px", alignItems: "center" }}>
        <div style={headerStyle}>Event name</div>
        <div style={{ ...headerStyle, textAlign: "right", lineHeight: 1.2, whiteSpace: "normal" }}>Last month usage</div>
        <MomColHeader style={{ ...headerStyle, textAlign: "right", whiteSpace: "nowrap" }} />
        {features.map(f => {
          const momUp = f.momChange >= 0;
          return (
            <div key={f.eventName} style={{ display: "contents" }}>
              <ConfluenceDocLink href={f.confluenceUrl} label={f.eventName} />
              <span style={{ ...wfBodyStrong(), textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {fmt(f.monthlyUsers)}
              </span>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, ...wfBodyStrong(momUp ? C.success : C.error), fontVariantNumeric: "tabular-nums" }}>
                {momUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {momUp ? "+" : ""}{f.momChange}%
              </span>
            </div>
          );
        })}
      </div>
    </W>
  );
}

function WidgetSunsetCandidates({ delay }: { delay: number }) {
  const candidates = getMock().jira.sunsetCandidates ?? [];
  return (
    <W title="Sunset candidates" source="jira" span={1} compact delay={delay}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {candidates.map((c, i) => (
          <div
            key={c.feature}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              padding: "6px 0",
              borderBottom: i < candidates.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <AlertTriangle size={10} color={c.openBugs >= 10 ? C.error : C.warning} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...wfBodyStrong(), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.feature}
              </div>
              <div style={{ ...wfLabel(), marginTop: 1, lineHeight: 1.35 }}>
                {c.monthlyUsers}/mo · {c.openBugs} bugs · {c.supportTickets} tickets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 8px", marginTop: 3 }}>
                {SUNSET_PRIORITY_LABELS.map(({ key, label, priority }) => {
                  const count = c.bugPriorities[key];
                  if (!count) return null;
                  return (
                    <span key={key} style={{ ...wfLabel(), fontWeight: 600, color: ticketPriorityColor(priority) }}>
                      {count} {label}
                    </span>
                  );
                })}
              </div>
              <div style={{ ...wfLabel(), marginTop: 2, lineHeight: 1.35 }}>
                Oldest {c.oldestBugDays}d open · avg {c.avgOpenDays}d
              </div>
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetReleaseBlockers({ delay }: { delay: number }) {
  const jira = getMock().jira;
  const blockers = jira.releaseBlockers ?? [];
  return (
    <W title={jira.releaseVersion ?? "Release"} label="blockers" source="jira" span={3} badge="Delayed" delay={delay}>
      {jira.releasePlanStart && jira.releasePlanEnd && (
        <div style={{ marginBottom: 10, padding: "10px 12px", background: C.bgElevated, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ ...wfLabel(), marginBottom: 4 }}>Release plan window</div>
          <div style={wfBodyStrong()}>{jira.releasePlanStart} – {jira.releasePlanEnd}</div>
          <div style={{ ...wfLabel(), marginTop: 6, lineHeight: 1.45 }}>
            Only bugs with <span style={{ color: C.error, fontWeight: 600 }}>Blocked</span> status within this window caused the release to slip.
          </div>
        </div>
      )}
      <div style={{ marginBottom: 14, padding: "10px 12px", background: C.errorFaint, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <AlertCircle size={14} color={C.error} />
        <span style={wfBody(C.error)}>
          Postponed from <strong>{jira.releaseOriginalDate}</strong> to <strong>{jira.releaseNewDate}</strong>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {blockers.map(b => (
          <div key={b.feature}>
            <div style={{ ...wfBodyStrong(), marginBottom: 8 }}>{b.feature}</div>
            {b.bugs.map(bug => (
              <div key={bug.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0 6px 12px", borderLeft: `2px solid ${bugReleaseStatusColor(bug.status)}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2, flexWrap: "wrap" }}>
                    <JiraIssueLink issueKey={bug.key} style={wfLabel()} />
                    <span style={{ ...wfLabel(), fontWeight: 600, color: bugReleaseStatusColor(bug.status) }}>{bug.status}</span>
                    <span style={wfLabel()}>since {bug.blockedSince}</span>
                  </div>
                  <div style={wfBody()}>{bug.summary}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </W>
  );
}

const WIDGETS_BY_SOURCE: Record<SourceId, Array<{ id: string; node: (d: number) => React.ReactNode }>> = {
  amplitude:    [{ id: "amp-dau", node: d => <WidgetAmplitudeDAU key="amp-dau" delay={d} /> }, { id: "amp-ev", node: d => <WidgetAmplitudeEvents key="amp-ev" delay={d} /> }, { id: "amp-top", node: d => <WidgetAmplitudeTopEvents key="amp-top" delay={d} /> }],
  jira:         [{ id: "jira-sprint", node: d => <WidgetJiraSprint key="jira-sprint" delay={d} /> }, { id: "jira-bugs", node: d => <WidgetJiraBugs key="jira-bugs" delay={d} /> }, { id: "jira-vel", node: d => <WidgetJiraVelocity key="jira-vel" delay={d} /> }],
  slack:        [{ id: "slack-msg", node: d => <WidgetSlackMessages key="slack-msg" delay={d} /> }, { id: "slack-ch", node: d => <WidgetSlackChannels key="slack-ch" delay={d} /> }],
  confluence:   [{ id: "conf-ov", node: d => <WidgetConfluenceOverview key="conf-ov" delay={d} /> }, { id: "conf-pg", node: d => <WidgetConfluencePages key="conf-pg" delay={d} /> }],
  launchdarkly: [{ id: "ld-ov", node: d => <WidgetLDOverview key="ld-ov" delay={d} /> }, { id: "ld-flags", node: d => <WidgetLDFlags key="ld-flags" delay={d} /> }],
};

const SCENARIO_WIDGET_IDS: Partial<Record<DashboardScenarioId, Partial<Record<SourceId, string[]>>>> = {
  "feature-adoption": {
    amplitude: ["amp-ev", "amp-top"],
    jira: [],
    launchdarkly: ["ld-flags"],
  },
  "adoption-breakdown": {
    amplitude: ["amp-top"],
  },
  "sunsetting": {},
  "release-delays": {
    jira: [],
  },
  "full-health": {
    amplitude: ["amp-dau", "amp-ev", "amp-top"],
    jira: ["jira-sprint", "jira-bugs"],
    slack: ["slack-msg", "slack-ch"],
    confluence: ["conf-ov", "conf-pg"],
    launchdarkly: ["ld-ov", "ld-flags"],
  },
  "sprint-health": {
    jira: ["jira-sprint", "jira-bugs", "jira-vel"],
    launchdarkly: ["ld-flags"],
  },
  engagement: {
    amplitude: ["amp-dau", "amp-ev", "amp-top"],
  },
  "team-comms": {
    slack: ["slack-msg", "slack-ch"],
    launchdarkly: ["ld-ov", "ld-flags"],
  },
};

const SCENARIO_EXTRA_WIDGETS: Partial<Record<DashboardScenarioId, (d: number) => React.ReactNode[]>> = {
  "feature-adoption": d => [<WidgetSupportTickets key="support" delay={d + 0.08} />],
  "adoption-breakdown": d => buildFeatureAdoptionWidgets(d + 0.04),
  sunsetting: d => [
    <WidgetSunsetCandidates key="sunset" delay={d + 0.04} />,
    <WidgetLowUsageFeatures key="low-usage" delay={d + 0.08} />,
  ],
  "release-delays": d => [<WidgetReleaseBlockers key="blockers" delay={d + 0.04} />],
};

function buildDashboardWidgets(scenario: DashboardScenarioId, sources: SourceId[]): React.ReactNode[] {
  const override = SCENARIO_WIDGET_IDS[scenario];
  const widgets: React.ReactNode[] = [<WidgetFormattedInsights key="insights" delay={0} />];

  sources.forEach((source, si) => {
    const pool = WIDGETS_BY_SOURCE[source];
    const selected = override
      ? (override[source] ? pool.filter(w => override[source]!.includes(w.id)) : [])
      : pool;
    selected.forEach((w, wi) => widgets.push(w.node(si * 0.08 + wi * 0.06 + 0.04)));
  });

  const extras = SCENARIO_EXTRA_WIDGETS[scenario];
  if (extras) widgets.push(...extras(sources.length * 0.08));

  return widgets;
}

// ─── Shooting stars (dark mode only) ─────────────────────────────────────────
const SHOOTING_STARS = Array.from({ length: 14 }, (_, i) => {
  const r = (i + 1) * 241.73 + i * i * 37.31 + i * 113.7;
  return { id: i, left: 5 + (r % 85), top: -3 + ((r * 1.37) % 35), angle: 22 + ((r * 0.17) % 42), length: 70 + ((r * 0.43) % 130), dur: 0.45 + ((r * 0.023) % 0.7), cycle: 6 + ((r * 0.19) % 18), delay: (r * 0.07) % 25 };
});

function BackgroundAnimation({ isDark }: { isDark: boolean }) {
  if (!isDark) return null;
  const keyframesCss = SHOOTING_STARS.map(s => {
    const td = 380 + s.length, vP = ((s.dur / s.cycle) * 100).toFixed(2), fP = ((s.dur / s.cycle) * 100 * 0.6).toFixed(2), sP = (parseFloat(vP) + 0.4).toFixed(2);
    return `@keyframes ss-${s.id}{0%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}0.4%{opacity:.55;transform:rotate(${s.angle}deg) translateX(0px)}${fP}%{opacity:.45}${vP}%{opacity:0;transform:rotate(${s.angle}deg) translateX(${td}px)}${sP}%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}100%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}}`;
  }).join('');
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{keyframesCss}</style>
      {SHOOTING_STARS.map(s => (
        <div key={s.id} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.length, height: 1.5, background: "linear-gradient(to right, rgba(251,146,60,0), rgba(253,186,116,0.38))", borderRadius: 2, transformOrigin: "left center", animation: `ss-${s.id} ${s.cycle}s ${s.delay}s linear infinite`, opacity: 0 }} />
      ))}
    </div>
  );
}

// ─── Iskra Logo ───────────────────────────────────────────────────────────────
function IskraLogo({ centered = false, compact = false }: { centered?: boolean; compact?: boolean }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: centered || compact ? "4px 0" : "4px 12px",
      marginLeft: compact ? -8 : centered ? 0 : -5,
      justifyContent: centered ? "center" : "flex-start",
      width: centered ? "100%" : undefined,
    }}>
      <motion.svg viewBox="0 0 30 30" width="42" height="42" fill="none"
        animate={{ rotate: [0, 22, -18, 12, 0], scale: [1, 1.18, 0.93, 1.10, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${ISKRA_STAR.glow})` }}>
        <defs>
          <linearGradient id="lg1v3" x1="15" y1="0" x2="15" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor={ISKRA_STAR.gradTop} />
            <stop offset="1" stopColor={ISKRA_STAR.gradBottom} />
          </linearGradient>
        </defs>
        <path d="M15 0 L16.6 12 L28 15 L16.6 18 L15 30 L13.4 18 L2 15 L13.4 12 Z" fill="url(#lg1v3)" />
      </motion.svg>
      <div>
        <img src={iskraWordmark} alt="Iskra" style={{ height: 18, display: "block", marginBottom: 3, filter: isDarkMode ? "none" : "brightness(0) saturate(100%)" }} />
        <span style={{ fontSize: 11, fontWeight: 400, color: isDarkMode ? "rgba(255,255,255,0.55)" : C.textMuted, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: "0.02em", display: "block" }}>Appfire's data in one place</span>
      </div>
    </div>
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboards", Icon: Home },
  { id: "sources",   label: "Sources",   Icon: List },
];

// ─── Sources panel ────────────────────────────────────────────────────────────
const SOURCE_DETAILS: Record<SourceId, { workspace: string; description: string }> = {
  amplitude:    { workspace: "Appfire Analytics",  description: "Tracks user behaviour, product events, funnels, and retention across all Appfire surfaces. Used to monitor DAU/MAU, feature adoption, and session quality in real time." },
  jira:         { workspace: "Appfire Jira (APF)", description: "Connected to the main engineering project board. Provides sprint progress, velocity trends, bug distribution by priority, and backlog health across all active teams." },
  slack:        { workspace: "Appfire HQ",         description: "Reads message volume and response time metrics across team channels. Helps surface communication bottlenecks and identify the most active collaboration threads." },
  confluence:   { workspace: "Appfire Docs",       description: "Indexes internal documentation pages, wiki coverage, and recent edits. Enables tracking of documentation health and highlights knowledge gaps across product areas. Also tries to understand the business context behind documented features and Amplitude events." },
  launchdarkly: { workspace: "appfire-prod",       description: "Manages feature flags and gradual rollouts for the production environment. Exposes flag state, targeting rules, evaluation volume, and kill-switch status per release." },
};

function SourcesPanel({ isDark, activeSources, onToggleSource }: {
  isDark: boolean;
  activeSources: SourceId[];
  onToggleSource: (s: SourceId) => void;
}) {
  return (
    <div style={{ padding: "35px 28px 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={pageTitleStyle()}>Data Sources</h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{activeSources.length} of {ALL_SOURCES.length} sources configured</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ALL_SOURCES.map(s => {
          const { label } = getSourceConfig(s);
          const { workspace, description } = SOURCE_DETAILS[s];
          const isOn = activeSources.includes(s);
          return (
            <div key={s} style={{
              ...glassPanel(isDark), borderRadius: 16,
              overflow: "hidden",
              opacity: isOn ? 1 : 0.55, transition: "opacity 0.2s",
            }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Icon */}
                <SourceLogoBadge source={s} />
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{label}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: isOn ? C.success : C.textMuted, background: isOn ? C.successFaint : (isDark ? "rgba(255,255,255,0.06)" : C.bgElevated), padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isOn ? C.success : C.textMuted, flexShrink: 0 }} />
                      {isOn ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                    Workspace: <span style={{ color: C.textSecondary, fontWeight: 500 }}>{workspace}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{description}</div>
                </div>
                {/* Actions */}
                {!isOn && (
                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <button
                      onClick={() => onToggleSource(s)}
                      style={{ fontSize: 12, padding: "8px 16px", borderRadius: BUTTON_RADIUS, border: `1px solid ${C.successFaint}`, background: C.successFaint, cursor: "pointer", color: C.success, fontFamily: BUTTON_FONT, fontWeight: 600 }}>
                      Connect
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Wall-socket style rocker switch for dark / light mode. */
function SocketThemeSwitch({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  const [hover, setHover] = useState(false);
  const plate = isDark ? "#292524" : "#E7E5E4";
  const plateBorder = isDark ? "rgba(251,146,60,0.22)" : "rgba(124,92,231,0.18)";
  const recess = isDark ? "#1C1917" : "#D6D3D1";
  const rockerOff = isDark ? "#57534E" : "#A8A29E";
  const rockerOn = isDark ? "#FB923C" : "#7C5CE7";
  const glow = isDark ? "rgba(251,146,60,0.55)" : "rgba(124,92,231,0.45)";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        width: "100%",
        padding: "9px 12px",
        borderRadius: BUTTON_RADIUS,
        ...(hover
          ? {
              background: isDark ? "rgba(255,255,255,0.04)" : C.bgHover,
              border: "1px solid transparent",
              boxShadow: "none",
            }
          : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }),
        cursor: "pointer",
        transition: "all 0.12s",
      }}
    >
      <svg width={56} height={32} viewBox="0 0 56 32" fill="none" aria-hidden style={{ display: "block", flexShrink: 0 }}>
        <rect x={2} y={2} width={52} height={28} rx={7} fill={plate} stroke={plateBorder} strokeWidth={1.1} />
        <rect x={8} y={9} width={40} height={14} rx={4} fill={recess} />
        <motion.rect
          y={11}
          width={18}
          height={10}
          rx={3}
          initial={false}
          animate={{
            x: isDark ? 10 : 28,
            fill: isDark ? rockerOff : rockerOn,
            filter: isDark
              ? "drop-shadow(0 0 0 transparent)"
              : `drop-shadow(0 0 5px ${glow})`,
          }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
        />
        <motion.circle
          cy={16}
          r={1.8}
          initial={false}
          animate={{
            cx: isDark ? 19 : 37,
            fill: isDark ? "#78716C" : "#EDE9FE",
            opacity: isDark ? 0.55 : 1,
          }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
        />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, letterSpacing: "0.01em" }}>
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}

function IskraSignInScreen({
  isDark,
  onSignIn,
}: {
  isDark: boolean;
  onSignIn: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: C.bgBase,
        color: C.textPrimary,
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <BackgroundAnimation isDark={isDark} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 400,
          padding: "32px 28px",
          borderRadius: 18,
          ...glassPanel(isDark),
          textAlign: "left",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <IskraLogo compact />
        </div>
        <h1 style={{ ...pageTitleStyle(), margin: "0 0 8px", fontSize: 20 }}>Sign in to Iskra</h1>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
          Access is limited to accounts with an @appfire.com email address.
        </p>
        <motion.button
          type="button"
          onClick={onSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            padding: "10px 18px",
            borderRadius: BUTTON_RADIUS,
            border: "none",
            background: primaryCtaFill(isDark),
            color: primaryCtaTextColor(isDark),
            fontSize: 14,
            fontWeight: 600,
            fontFamily: BUTTON_FONT,
            cursor: "pointer",
            boxShadow: primaryCtaShadow(isDark),
          }}
        >
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
}

function IskraDeleteConfirmDialog({
  isOpen,
  dashboardName,
  isDark,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  dashboardName: string;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10050,
              background: isDark ? "rgba(0,0,0,0.62)" : "rgba(15,23,42,0.28)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10051,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              pointerEvents: "none",
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="iskra-delete-dialog-title"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.16 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "24px 24px 20px",
                borderRadius: 18,
                pointerEvents: "auto",
                ...glassPanel(isDark),
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.errorFaint,
                border: `1px solid ${isDark ? "rgba(248,113,113,0.28)" : "rgba(239,68,68,0.18)"}`,
              }}>
                <AlertTriangle size={18} color={C.error} aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  id="iskra-delete-dialog-title"
                  style={{
                    margin: "0 0 6px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.textPrimary,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Delete dashboard?
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.55, color: C.textMuted }}>
                  <span style={{ color: C.textSecondary, fontWeight: 500 }}>&ldquo;{dashboardName}&rdquo;</span>
                  {" "}will be permanently removed.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={onCancel}
                    style={{
                      padding: "8px 16px",
                      borderRadius: BUTTON_RADIUS,
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: C.textSecondary,
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: BUTTON_FONT,
                      cursor: "pointer",
                      transition: "background 0.12s, border-color 0.12s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : C.bgHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    style={{
                      padding: "8px 16px",
                      borderRadius: BUTTON_RADIUS,
                      border: "none",
                      background: isDark ? "#DC2626" : "#EF4444",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: BUTTON_FONT,
                      cursor: "pointer",
                      boxShadow: isDark ? "0 2px 10px rgba(220,38,38,0.35)" : "0 2px 8px rgba(239,68,68,0.25)",
                      transition: "background 0.12s, box-shadow 0.12s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "#B91C1C" : "#DC2626"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? "#DC2626" : "#EF4444"; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function LeftSidebar({ savedDashboards, activeId, activeDashboardName, onSelect, onRequestDelete, isDark, setIsDark, activeNav, setActiveNav, mousePos, onMouseMove, enabledSourceCount, onLogout }: {
  savedDashboards: SavedDashboard[]; activeId: string | null;
  activeDashboardName: string | null;
  onSelect: (id: string) => void; onRequestDelete: (id: string, name: string) => void;
  isDark: boolean; setIsDark: (v: (p: boolean) => boolean) => void;
  activeNav: string; setActiveNav: (v: string) => void;
  mousePos: { x: number; y: number }; onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  enabledSourceCount: number;
  onLogout: () => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountHover, setAccountHover] = useState(false);
  const [hoveredDashboardId, setHoveredDashboardId] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: PointerEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [userMenuOpen]);

  const sidebarInner = (
    <>
      <div style={{ padding: "22px 20px 16px" }}>
        <IskraLogo />
      </div>
      <div style={{ margin: "0 20px", height: 1, background: C.border, borderRadius: 1 }} />

      <div ref={userMenuRef} style={{ padding: "10px 10px 8px", position: "relative", zIndex: 30 }}>
        <button
          type="button"
          onClick={() => setUserMenuOpen(open => !open)}
          aria-expanded={userMenuOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
          onMouseEnter={() => setAccountHover(true)}
          onMouseLeave={() => setAccountHover(false)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: BUTTON_RADIUS,
            ...(userMenuOpen
              ? glassActiveNav()
              : accountHover
                ? {
                    background: isDark ? "rgba(255,255,255,0.04)" : C.bgHover,
                    border: "1px solid transparent",
                    boxShadow: "none",
                  }
                : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }),
            cursor: "pointer",
            textAlign: "left",
            marginBottom: 2,
            transition: "all 0.12s",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: isDark ? "linear-gradient(135deg, #FB923C, #F97316)" : "linear-gradient(135deg, #9B8AFB, #7C5CE7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", border: isDark ? "1.5px solid rgba(251,146,60,0.4)" : "none" }}>
              AK
            </div>
            <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#34D399", border: `2px solid ${C.bgSurface}` }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: "0.01em" }}>Alex Kim</div>
            <div style={{ fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>alex@company.com</div>
          </div>
          <ChevronDown
            size={14}
            aria-hidden
            style={{
              flexShrink: 0,
              color: C.textMuted,
              transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                top: "100%",
                marginTop: 4,
                padding: 4,
                borderRadius: BUTTON_RADIUS,
                ...glassPanel(isDark),
                boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.35)" : C.shadow,
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActiveNav("settings");
                  setUserMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 400,
                  fontFamily: BUTTON_FONT,
                  color: C.textPrimary,
                  textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : C.bgHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Settings size={14} color={C.textMuted} aria-hidden />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 400,
                  fontFamily: BUTTON_FONT,
                  color: C.textPrimary,
                  textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : C.bgHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={14} color={C.textMuted} aria-hidden />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: "10px 10px 4px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id}>
              <button onClick={() => setActiveNav(item.id === "dashboard" ? "dashboard" : item.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: BUTTON_RADIUS, ...(activeNav === item.id ? glassActiveNav() : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }), cursor: "pointer", color: navActiveColor(activeNav === item.id), fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, fontFamily: BUTTON_FONT, marginBottom: 2, transition: "all 0.12s", textAlign: "left" }}>
                <item.Icon size={15} />
                <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 5 }}>
                  {item.label}
                  {item.id === "sources" && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 400,
                      letterSpacing: "0.02em",
                      color: activeNav === item.id
                        ? (isDark ? "rgba(251,146,60,0.75)" : "rgba(124,92,231,0.55)")
                        : C.textMuted,
                    }}>
                      ({enabledSourceCount} out of {ALL_SOURCES.length})
                    </span>
                  )}
                </span>
                {item.id === "dashboard" && savedDashboards.length > 0 && (
                  <span style={{ marginLeft: "auto", background: C.sparkFaint, color: isDark ? C.sparkBright : C.spark, fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "0 6px", lineHeight: "16px" }}>{savedDashboards.length}</span>
                )}
              </button>

              {item.id === "dashboard" && savedDashboards.length > 0 && (
                <div style={{ marginTop: 6, marginBottom: 4 }}>
                  {savedDashboards.map(d => (
                    <div
                      key={d.id}
                      onClick={() => onSelect(d.id)}
                      onMouseEnter={() => setHoveredDashboardId(d.id)}
                      onMouseLeave={() => setHoveredDashboardId(null)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px 7px 34px", borderRadius: BUTTON_RADIUS, ...(activeId === d.id && activeNav === "dashboard" ? glassActiveNav() : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }), cursor: "pointer", marginBottom: 1, transition: "all 0.12s" }}
                    >
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeId === d.id && activeNav === "dashboard" ? C.spark : C.textMuted, flexShrink: 0, opacity: activeId === d.id && activeNav === "dashboard" ? 1 : 0.5 }} />
                      <div
                        title={d.id === activeId && activeDashboardName ? activeDashboardName : d.name}
                        style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: activeId === d.id ? 600 : 400, color: activeId === d.id && activeNav === "dashboard" ? C.spark : C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {d.id === activeId && activeDashboardName ? activeDashboardName : d.name}
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${d.id === activeId && activeDashboardName ? activeDashboardName : d.name}`}
                        onClick={e => {
                          e.stopPropagation();
                          onRequestDelete(
                            d.id,
                            d.id === activeId && activeDashboardName ? activeDashboardName : d.name,
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.textMuted,
                          padding: 2,
                          display: "flex",
                          flexShrink: 0,
                          opacity: hoveredDashboardId === d.id ? 1 : 0,
                          pointerEvents: hoveredDashboardId === d.id ? "auto" : "none",
                          transition: "opacity 0.12s",
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 10px 12px", flexShrink: 0, borderTop: `1px solid ${C.border}` }}>
          <SocketThemeSwitch isDark={isDark} onToggle={() => setIsDark(v => !v)} />
        </div>
      </div>
    </>
  );

  return (
    <div style={{
      width: 260, flexShrink: 0, height: "100dvh", position: "sticky", top: 0,
      background: C.bgBase,
      display: "flex", flexDirection: "column",
      zIndex: 20,
    }}>
      {isDark ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            background: sidebarSpotlightBackground(mousePos),
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            borderRight: `1px solid ${C.border}`,
            overflow: "hidden",
            position: "relative",
            transition: "background 0.15s ease",
          }}
          onMouseMove={onMouseMove}
        >
          {sidebarInner}
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: C.bgSurface,
          borderRight: `1px solid ${C.border}`,
          overflow: "hidden",
        }}>
          {sidebarInner}
        </div>
      )}
    </div>
  );
}

// ─── Source Card ──────────────────────────────────────────────────────────────
// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ isDark }: { isDark: boolean }) {
  const [email, setEmail] = useState("alex@appfire.com");
  const [name, setName] = useState("Alex Kim");
  const [role, setRole] = useState("Product Manager");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [defaultView, setDefaultView] = useState("dashboard");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
    background: isDark ? "rgba(255,255,255,0.05)" : C.bgSurface, color: C.textPrimary,
    fontSize: 13, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 6, display: "block",
  };
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ width: 36, height: 20, borderRadius: 20, background: on ? C.spark : C.bgElevated, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0, border: `1px solid ${on ? C.sparkBright : C.border}` }}>
      <div style={{ position: "absolute", top: 2, left: on ? 17 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "35px 28px 40px" }}>
      <h2 style={pageTitleStyle()}>Settings</h2>
      <p style={{ margin: "0 0 32px", fontSize: 13, color: C.textMuted }}>Manage your profile and preferences.</p>

      {/* Profile */}
      <div style={{ ...glassPanel(isDark), borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 20 }}>Profile</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: profileAvatarBg(isDark), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", flexShrink: 0 }}>AK</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Alex Kim</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Appfire · Product Manager</div>
          </div>
          <button style={{ marginLeft: "auto", fontSize: 12, padding: "8px 16px", borderRadius: BUTTON_RADIUS, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.textMuted, fontFamily: BUTTON_FONT }}>Change photo</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Default view</label>
            <select value={defaultView} onChange={e => setDefaultView(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
              <option value="dashboard">Dashboard</option>
              <option value="sources">Sources</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ ...glassPanel(isDark), borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 20 }}>Notifications</div>
        {[
          { label: "Email notifications", sub: "Receive dashboard updates and alerts by email", on: emailNotifs, toggle: () => setEmailNotifs(v => !v) },
          { label: "Slack notifications", sub: "Get notified in Slack when key metrics change", on: slackNotifs, toggle: () => setSlackNotifs(v => !v) },
          { label: "Weekly digest", sub: "Summary of your most important metrics every Monday", on: weeklyDigest, toggle: () => setWeeklyDigest(v => !v) },
        ].map(({ label, sub, on, toggle }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${C.border}` }} onClick={toggle}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{sub}</div>
            </div>
            <Toggle on={on} onToggle={toggle} />
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{ padding: "9px 24px", borderRadius: BUTTON_RADIUS, background: primaryCtaFill(isDark), border: "none", color: primaryCtaTextColor(isDark), fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: BUTTON_FONT, boxShadow: primaryCtaShadow(isDark) }}>
          Save changes
        </button>
      </div>
    </div>
  );
}

function SourceCard({ sourceId, onGenerate }: { sourceId: SourceId; onGenerate: (s: SourceId) => void }) {
  const { label } = getSourceConfig(sourceId);
  const { metric, detail, spark } = SOURCE_CARD_METRICS[sourceId];
  const gradient = sourceGradient(sourceId);
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(0,0,0,0.18)" }}
      transition={{ duration: 0.18 }}
      onClick={() => onGenerate(sourceId)}
      style={{ background: gradient, borderRadius: 18, padding: "18px 18px 16px", cursor: "pointer", position: "relative", overflow: "hidden", minWidth: 0 }}
    >
      {/* Decorative shine */}
      <div style={{ position: "absolute", top: -30, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
      {/* Three dots menu indicator */}
      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 3 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />)}
      </div>
      {/* Top: avatars placeholder (connected status) */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
        <div style={{ display: "flex" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: `rgba(255,255,255,${0.3 + i * 0.15})`, border: "1.5px solid rgba(255,255,255,0.6)", marginLeft: i > 0 ? -6 : 0 }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>Connected</span>
      </div>
      {/* Label */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6, letterSpacing: "-0.2px" }}>{label}</div>
      {/* Metric */}
      <div style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "-0.5px", marginBottom: 2 }}>{metric}</div>
      {/* Sparkline */}
      <div style={{ margin: "6px 0 8px" }}>
        <TinySparkline values={spark} />
      </div>
      {/* Detail */}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{detail}</div>
    </motion.div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function RightPanel({ isDark }: { isDark: boolean }) {
  const QUICK_STATS = [
    { label: "DAU", value: "14.8k", sub: "active users", color: C.amplitude },
    { label: "Sprint", value: "68%", sub: "completion", color: C.jira },
    { label: "Flags", value: "24", sub: "active", color: C.launchdarkly },
  ];
  return (
    <div style={{
      width: 272, flexShrink: 0, height: "100dvh", position: "sticky", top: 0,
      background: C.bgSurface,
      borderLeft: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      boxShadow: isDark ? "none" : "-2px 0 12px rgba(0,0,0,0.04)",
    }}>
      {/* Header */}
      <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Live Stats</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" }}>
          <Bell size={16} />
        </button>
      </div>

      {/* Quick stats row */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {QUICK_STATS.map(s => (
            <div key={s.label} style={{ background: isDark ? "rgba(255,255,255,0.05)" : C.bgElevated, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2, lineHeight: 1.3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {QUICK_INSIGHTS.map(group => (
          <div key={group.date} style={{ marginBottom: 16 }}>
            <div style={{ padding: "4px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{group.date}</span>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", padding: 0 }}>
                <span style={{ fontSize: 18, lineHeight: 1, letterSpacing: 2 }}>···</span>
              </button>
            </div>
            {group.events.map((ev, i) => {
              const src = getSourceConfig(ev.source);
              const grad = sourceGradient(ev.source);
              return (
                <div key={i} style={{ padding: "8px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, minWidth: 36 }}>{ev.time}</div>
                  </div>
                  <div style={{ width: 3, flexShrink: 0, alignSelf: "stretch", borderRadius: 2, background: grad, minHeight: 32 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{src.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 1, lineHeight: 1.3 }}>{ev.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{ev.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function RefreshDataButton({
  onClick,
  disabled,
  refreshing,
  size = 34,
}: {
  onClick: () => void;
  disabled: boolean;
  refreshing: boolean;
  size?: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const showTooltip = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTooltipPos({ top: r.bottom + 6, left: r.right });
    setTooltipVisible(true);
  }, []);

  return (
    <>
      <motion.button
        ref={btnRef}
        type="button"
        aria-label="Refresh data from connected sources"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipVisible(false)}
        onFocus={showTooltip}
        onBlur={() => setTooltipVisible(false)}
        whileHover={!disabled ? { scale: 1.04 } : undefined}
        whileTap={!disabled ? { scale: 0.96 } : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: BUTTON_RADIUS,
          border: `1px solid ${C.border}`,
          background: isDarkMode ? "rgba(255,255,255,0.05)" : C.bgElevated,
          color: C.textSecondary,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <RefreshCw
          size={15}
          style={refreshing ? { animation: "spin 0.8s linear infinite" } : undefined}
        />
      </motion.button>
      {tooltipVisible && createPortal(
        <div
          role="tooltip"
          style={{
            position: "fixed",
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translateX(-100%)",
            background: C.bgSurface,
            border: `1px solid ${C.borderStrong}`,
            borderRadius: 8,
            padding: "6px 10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            pointerEvents: "none",
            zIndex: 100000,
            fontSize: 11,
            color: C.textSecondary,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Refresh data
        </div>,
        document.body,
      )}
    </>
  );
}

function DashboardDataSourcesBar({
  sources,
  lastRefreshedAt,
  isDark,
  canRefresh,
  refreshing,
  onRefresh,
}: {
  sources: SourceId[];
  lastRefreshedAt: Date | null;
  isDark: boolean;
  canRefresh: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div
      style={{
        ...glassPanel(isDark),
        borderRadius: 12,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>Data from</span>
        {sources.map(source => {
          const { label } = getSourceConfig(source);
          return (
            <span
              key={source}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: C.textSecondary,
                fontWeight: 500,
                background: isDark ? "rgba(255,255,255,0.05)" : C.bgElevated,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "3px 8px 3px 4px",
              }}
            >
              <SourceLogoBadge source={source} boxSize={18} logoSize={12} />
              {label}
            </span>
          );
        })}
        {lastRefreshedAt && (
          <span style={{ fontSize: 11, color: C.textMuted }}>
            · Last refreshed {formatDataRefreshTime(lastRefreshedAt)}
          </span>
        )}
      </div>
      {canRefresh && (
        <RefreshDataButton
          onClick={onRefresh}
          disabled={refreshing}
          refreshing={refreshing}
          size={32}
        />
      )}
    </div>
  );
}

export default function IgniteIskraPageV3() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  C = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  isDarkMode = isDark;

  const [prompt, setPrompt] = useState("");
  const [activeSources, setActiveSources] = useState<SourceId[]>([...ALL_SOURCES]);
  const [generating, setGenerating] = useState(false);
  const [currentSources, setCurrentSources] = useState<SourceId[] | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [dataRefreshMode, setDataRefreshMode] = useState(false);
  const [lastDataRefreshAt, setLastDataRefreshAt] = useState<Date | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [sidebarMouse, setSidebarMouse] = useState({ x: 50, y: 30 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const historyIdRef = useRef(0);

  const syncDirtyForHistoryEntry = useCallback((entry: PromptHistoryEntry) => {
    const saved = activeDashboardId
      ? savedDashboards.find(d => d.id === activeDashboardId)
      : undefined;
    setIsDirty(!historyEntryMatchesSaved(entry, saved));
  }, [activeDashboardId, savedDashboards]);

  const restorePromptHistory = useCallback((entry: PromptHistoryEntry) => {
    const scenario = entry.scenario ?? detectScenario(entry.prompt);
    setDashboardContext(scenario);
    setCurrentSources(entry.sources);
    setCurrentPrompt(entry.prompt);
    setCurrentName(entry.name);
    setPrompt(entry.prompt);
    setActiveHistoryId(entry.id);
    syncDirtyForHistoryEntry(entry);
  }, [syncDirtyForHistoryEntry]);

  const handleGenerate = useCallback(
    (overridePrompt?: string) => {
      const p = (overridePrompt ?? prompt).trim();
      if (!p) return;
      const isRegenerate = currentSources !== null;
      setGenerating(true);
      setTimeout(() => {
        const scenario = detectScenario(p);
        setDashboardContext(scenario);
        const sources = detectSources(p, scenario).filter(s => activeSources.includes(s));
        const finalSources = sources.length > 0 ? sources : activeSources;
        setCurrentSources(finalSources);
        setCurrentPrompt(p);
        setGenerating(false);

        const pushHistory = (name: string) => {
          const entry: PromptHistoryEntry = {
            id: `h-${++historyIdRef.current}`,
            prompt: p,
            sources: finalSources,
            name,
            scenario,
            createdAt: new Date(),
          };
          setPromptHistory(prev => [...prev, entry]);
          setActiveHistoryId(entry.id);
        };

        if (isRegenerate) {
          setCurrentName(prev => {
            const name = prev ?? dashboardName(p);
            pushHistory(name);
            setIsDirty(true);
            return name;
          });
        } else {
          setCurrentName(prev => {
            const name = prev ?? dashboardName(p);
            const entry: PromptHistoryEntry = {
              id: `h-${++historyIdRef.current}`,
              prompt: p,
              sources: finalSources,
              name,
              scenario,
              createdAt: new Date(),
            };
            setPromptHistory([entry]);
            setActiveHistoryId(entry.id);
            const id = `d-${++idRef.current}`;
            setSavedDashboards(prevDash => [
              { id, name, prompt: p, sources: finalSources, createdAt: new Date(), lastRefreshedAt: new Date() },
              ...prevDash,
            ]);
            setActiveDashboardId(id);
            setIsDirty(false);
            setLastDataRefreshAt(new Date());
            return name;
          });
        }
      }, 900);
    },
    [prompt, activeSources, currentSources],
  );

  const handleRefreshData = useCallback(() => {
    if (!currentPrompt || !currentSources || !activeDashboardId || isDirty || generating) return;
    setDataRefreshMode(true);
    setGenerating(true);
    setTimeout(() => {
      const scenario = detectScenario(currentPrompt);
      setDashboardContext(scenario);
      const refreshedAt = new Date();
      setLastDataRefreshAt(refreshedAt);
      setSavedDashboards(prev =>
        prev.map(d =>
          d.id === activeDashboardId ? { ...d, lastRefreshedAt: refreshedAt } : d,
        ),
      );
      setDashboardRefreshKey(k => k + 1);
      setGenerating(false);
      setDataRefreshMode(false);
    }, 900);
  }, [activeDashboardId, currentPrompt, currentSources, generating, isDirty]);

  const handleSaveChanges = useCallback(() => {
    if (!currentSources || !currentName || !currentPrompt || !activeDashboardId) return;
    setSavedDashboards(prev =>
      prev.map(d =>
        d.id === activeDashboardId
          ? {
              ...d,
              name: currentName,
              prompt: currentPrompt,
              sources: currentSources,
              createdAt: new Date(),
            }
          : d,
      ),
    );
    if (activeHistoryId) {
      setPromptHistory(prev =>
        prev.map(e =>
          e.id === activeHistoryId
            ? { ...e, name: currentName, prompt: currentPrompt, sources: currentSources }
            : e,
        ),
      );
    }
    setIsDirty(false);
  }, [activeDashboardId, currentSources, currentName, currentPrompt, activeHistoryId]);

  const handleSaveAsNew = useCallback(() => {
    if (!currentSources || !currentName || !currentPrompt) return;
    const id = `d-${++idRef.current}`;
    setSavedDashboards(prev => [
      {
        id,
        name: currentName,
        prompt: currentPrompt,
        sources: currentSources,
        createdAt: new Date(),
        lastRefreshedAt: lastDataRefreshAt ?? new Date(),
      },
      ...prev,
    ]);
    setActiveDashboardId(id);
    setIsDirty(false);
  }, [currentSources, currentName, currentPrompt, lastDataRefreshAt]);

  const commitDashboardName = useCallback(() => {
    if (!activeDashboardId || !currentName) return;
    setSavedDashboards(prev =>
      prev.map(d => (d.id === activeDashboardId ? { ...d, name: currentName } : d)),
    );
  }, [activeDashboardId, currentName]);

  const handleGenerateSource = useCallback((sourceId: SourceId) => {
    const sourceName = getSourceConfig(sourceId).label;
    const p = `Show me ${sourceName} insights and key metrics`;
    const name = `${sourceName} Overview`;
    setPrompt(p);
    setActiveSources([sourceId]);
    setGenerating(true);
    setActiveDashboardId(null);
    setTimeout(() => {
      setDashboardContext("default");
      const sources: SourceId[] = [sourceId];
      setCurrentSources(sources);
      setCurrentName(name);
      setCurrentPrompt(p);
      const entry: PromptHistoryEntry = {
        id: `h-${++historyIdRef.current}`,
        prompt: p,
        sources,
        name,
        scenario: "default",
        createdAt: new Date(),
      };
      setPromptHistory([entry]);
      setActiveHistoryId(entry.id);
      const id = `d-${++idRef.current}`;
      setSavedDashboards(prev => [
        { id, name, prompt: p, sources, createdAt: new Date(), lastRefreshedAt: new Date() },
        ...prev,
      ]);
      setActiveDashboardId(id);
      setIsDirty(false);
      setLastDataRefreshAt(new Date());
      setGenerating(false);
    }, 900);
  }, []);

  const handleSelectDashboard = useCallback((id: string) => {
    const d = savedDashboards.find(x => x.id === id);
    if (!d) return;
    setDashboardContext(detectScenario(d.prompt));
    setCurrentSources(d.sources); setCurrentName(d.name); setCurrentPrompt(d.prompt);
    setPrompt(d.prompt);
    setActiveDashboardId(id);
    setIsDirty(false);
    setLastDataRefreshAt(d.lastRefreshedAt ?? d.createdAt);
    setActiveNav("dashboard");
    const match = [...promptHistory].reverse().find(e => historyEntryMatchesSaved(e, d));
    setActiveHistoryId(match?.id ?? null);
  }, [savedDashboards, promptHistory]);

  const handleDeleteDashboard = useCallback((id: string) => {
    setSavedDashboards(prev => prev.filter(d => d.id !== id));
    if (activeDashboardId === id) {
      setActiveDashboardId(null);
      setCurrentSources(null);
      setCurrentName(null);
      setCurrentPrompt(null);
      setIsDirty(false);
    }
  }, [activeDashboardId]);

  const handleNewDashboard = useCallback(() => {
    setDashboardContext("default");
    setCurrentSources(null); setCurrentName(null); setCurrentPrompt(null);
    setPrompt("");
    setActiveDashboardId(null);
    setActiveSources([...ALL_SOURCES]);
    setPromptHistory([]);
    setActiveHistoryId(null);
    setHistoryOpen(false);
    setIsDirty(false);
    setLastDataRefreshAt(null);
    setDataRefreshMode(false);
  }, []);

  const toggleSource = (s: SourceId) => setActiveSources(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s]);

  const hasDashboard = currentSources !== null;
  const isRefreshingData = generating && dataRefreshMode;
  const isRegenerating = generating && currentSources !== null && !dataRefreshMode;
  const showSavePair = isDirty || isRegenerating;
  const savePairEnabled = isDirty && !generating;
  const canRefreshData = Boolean(activeDashboardId && !isDirty && hasDashboard);

  if (!isAuthenticated) {
    return <IskraSignInScreen isDark={isDark} onSignIn={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bgBase,
      color: C.textPrimary,
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
    }}>
      <BackgroundAnimation isDark={isDark} />

      {/* Left Sidebar */}
      <LeftSidebar
        savedDashboards={savedDashboards} activeId={activeDashboardId}
        activeDashboardName={currentName}
        onSelect={handleSelectDashboard}
        onRequestDelete={(id, name) => setDeleteConfirm({ id, name })}
        isDark={isDark} setIsDark={setIsDark}
        activeNav={activeNav} setActiveNav={setActiveNav}
        enabledSourceCount={activeSources.length}
        mousePos={sidebarMouse}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setSidebarMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10,
        ...mainContentNotebookBg(isDark),
      }}>

        {/* Sources view */}
        {activeNav === "sources" && <SourcesPanel isDark={isDark} activeSources={activeSources} onToggleSource={toggleSource} />}

        {/* Settings view */}
        {activeNav === "settings" && <SettingsPanel isDark={isDark} />}

        {/* Dashboard view */}
        {activeNav !== "sources" && activeNav !== "settings" && <>
        {/* Top bar */}
        <div style={{ padding: "35px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 56 }}>
          {hasDashboard ? (
            <>
              {/* Left: New Dashboard */}
              <motion.button onClick={handleNewDashboard} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: BUTTON_RADIUS, background: "transparent", border: `1px solid ${C.border}`, cursor: "pointer", color: C.textMuted, fontSize: 13, fontWeight: 500, fontFamily: BUTTON_FONT, flexShrink: 0 }}>
                <ArrowLeft size={14} /><span>New Dashboard</span>
              </motion.button>

              {/* Center: Editable name */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    value={currentName ?? ""}
                    onChange={e => setCurrentName(e.target.value)}
                    onBlur={() => {
                      setIsEditingName(false);
                      commitDashboardName();
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        setIsEditingName(false);
                        commitDashboardName();
                      }
                    }}
                    autoFocus
                    style={{ ...pageTitleStyle(), margin: 0, background: "transparent", border: "none", borderBottom: `2px solid ${C.spark}`, outline: "none", textAlign: "center", minWidth: 200, maxWidth: 480 }}
                  />
                ) : (
                  <button onClick={() => { setIsEditingName(true); setTimeout(() => nameInputRef.current?.select(), 30); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: "100%", minWidth: 0, overflow: "hidden", background: "none", border: "none", cursor: "text", padding: "4px 8px", borderRadius: BUTTON_RADIUS }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : C.bgElevated; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <h1
                      title={currentName ?? undefined}
                      style={{
                        ...pageTitleStyle(),
                        margin: 0,
                        flex: "1 1 auto",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currentName}
                    </h1>
                    <Edit2 size={13} color={C.textMuted} style={{ opacity: 0.6, flexShrink: 0 }} />
                    {activeDashboardId && !isDirty && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: C.successFaint, color: C.success, fontWeight: 600, marginLeft: 2, flexShrink: 0 }}>SAVED</span>
                    )}
                    {isDirty && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: isDark ? "rgba(251,191,36,0.18)" : "#FFF8E6", color: isDark ? "#FDBA74" : "#B07800", fontWeight: 600, marginLeft: 2, flexShrink: 0 }}>UNSAVED CHANGES</span>
                    )}
                  </button>
                )}
              </div>

              {/* Right: disabled Save after auto-save; re-generating — disabled pair; dirty — Save as new + Save */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {showSavePair ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      disabled={!savePairEnabled}
                      onClick={savePairEnabled ? handleSaveAsNew : undefined}
                      whileHover={savePairEnabled ? { scale: 1.02 } : undefined}
                      whileTap={savePairEnabled ? { scale: 0.97 } : undefined}
                      style={{
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        borderRadius: BUTTON_RADIUS,
                        padding: "8px 16px",
                        cursor: savePairEnabled ? "pointer" : "default",
                        color: C.textMuted,
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: BUTTON_FONT,
                        opacity: savePairEnabled ? 1 : 0.85,
                      }}
                    >
                      Save as new
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      disabled={!savePairEnabled}
                      onClick={savePairEnabled ? handleSaveChanges : undefined}
                      whileHover={savePairEnabled ? { scale: 1.02 } : undefined}
                      whileTap={savePairEnabled ? { scale: 0.97 } : undefined}
                      style={{
                        border: "none",
                        borderRadius: BUTTON_RADIUS,
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: BUTTON_FONT,
                        background: savePairEnabled ? primaryCtaFill(isDark) : (isDark ? "rgba(255,255,255,0.07)" : C.bgElevated),
                        color: savePairEnabled ? primaryCtaTextColor(isDark) : C.textMuted,
                        cursor: savePairEnabled ? "pointer" : "default",
                        boxShadow: savePairEnabled ? primaryCtaShadow(isDark) : "none",
                        opacity: savePairEnabled ? 1 : 0.85,
                      }}
                    >
                      Save
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    disabled
                    style={{
                      border: "none",
                      borderRadius: BUTTON_RADIUS,
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: BUTTON_FONT,
                      background: isDark ? "rgba(255,255,255,0.07)" : C.bgElevated,
                      color: C.textMuted,
                      cursor: "default",
                      opacity: 0.85,
                    }}
                  >
                    Save
                  </motion.button>
                )}
              </div>
            </>
          ) : (
            <div>
              <h1 style={heroGradientTitleStyle()}>What's on your radar today?</h1>
              <p style={{ margin: 0, fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>Analysing all connected sources — <span style={{ color: C.textSecondary }}>Amplitude, Jira, Slack, Confluence & LaunchDarkly</span></p>
            </div>
          )}
        </div>

        {/* Prompt input */}
        <div style={{ padding: "20px 28px 0" }}>
          <motion.div
            whileFocusWithin={{ boxShadow: `0 0 0 2px ${C.spark}40, ${C.shadow}` } as never}
            style={{
              ...glassPanel(isDark),
              borderRadius: 18,
              overflow: "hidden",
              transition: "box-shadow 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", padding: "14px 16px 0", gap: 10 }}>
              <motion.svg viewBox="0 0 30 30" width="16" height="16" fill="none" flexShrink={0}
                animate={{ rotate: [0, 18, -14, 8, 0], scale: [1, 1.15, 0.94, 1.08, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ marginTop: 3, flexShrink: 0, filter: `drop-shadow(0 0 4px ${ISKRA_STAR.glow})` }}>
                <defs>
                  <linearGradient id="si1v3" x1="15" y1="0" x2="15" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor={ISKRA_STAR.gradTop} /><stop offset="1" stopColor={ISKRA_STAR.gradBottom} />
                  </linearGradient>
                </defs>
                <path d="M15 0 L16.6 12 L28 15 L16.6 18 L15 30 L13.4 18 L2 15 L13.4 12 Z" fill="url(#si1v3)" />
              </motion.svg>
              <textarea ref={inputRef} value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder={hasDashboard ? "Modify or extend this dashboard…" : "Ask me anything — sprint health, user retention, flag rollout…"} rows={2}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.textPrimary, fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 12px 12px", gap: 6, marginTop: 8 }}>
              <div style={{ flex: 1 }} />
              <motion.button
                onClick={() => handleGenerate()} disabled={!prompt.trim() || generating}
                whileHover={prompt.trim() && !generating ? { scale: 1.03 } : {}}
                whileTap={prompt.trim() && !generating ? { scale: 0.97 } : {}}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
                  borderRadius: BUTTON_RADIUS, border: "none", flexShrink: 0,
                  background: !prompt.trim() || generating ? (isDark ? "rgba(255,255,255,0.07)" : C.bgElevated) : (isDark ? primaryCtaFill(true) : C.spark),
                  color: !prompt.trim() || generating ? C.textMuted : (isDark ? primaryCtaTextColor(true) : "white"),
                  cursor: !prompt.trim() || generating ? "default" : "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: BUTTON_FONT,
                  boxShadow: prompt.trim() && !generating ? (isDark ? primaryCtaShadow(true) : `0 4px 14px ${C.sparkGlow}`) : "none",
                  transition: "all 0.15s",
                }}>
                {generating
                  ? <><RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }} /><span>{hasDashboard ? "Re-building…" : "Building…"}</span></>
                  : <><Zap size={13} /><span>{hasDashboard ? "Re-generate" : "Generate"}</span></>}
              </motion.button>
            </div>
          </motion.div>

          {/* Prompt history */}
          {promptHistory.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setHistoryOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 11, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "2px 0" }}>
                <motion.span animate={{ rotate: historyOpen ? 90 : 0 }} transition={{ duration: 0.18 }} style={{ display: "flex" }}>▶</motion.span>
                <span>{promptHistory.length} prompt{promptHistory.length > 1 ? "s" : ""} sent in this session</span>
              </button>
              {historyOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                  style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                  {promptHistory.map(entry => {
                    const isActive = entry.id === activeHistoryId;
                    return (
                      <div
                        key={entry.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => restorePromptHistory(entry)}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") restorePromptHistory(entry); }}
                        style={{
                          padding: "7px 12px",
                          borderRadius: BUTTON_RADIUS,
                          ...(isActive ? glassActiveNav() : { background: isDark ? "rgba(255,255,255,0.04)" : C.bgSurface, border: `1px solid ${C.border}`, boxShadow: "none" }),
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : C.bgHover;
                        }}
                        onMouseLeave={e => {
                          if (!isActive) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : C.bgSurface;
                        }}
                      >
                        <span style={{ fontSize: 12, color: isActive ? C.textPrimary : C.textSecondary, lineHeight: 1.4, fontWeight: isActive ? 500 : 400 }}>
                          {entry.prompt}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}

          {/* Suggested prompts */}
          {!hasDashboard && !generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.25 } }} style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, paddingLeft: 2 }}>…or use a prompt example to start</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p.id} onClick={() => { setPrompt(p.prompt); handleGenerate(p.prompt); }}
                  style={{ background: isDark ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.45)", backdropFilter: "blur(16px) saturate(160%)", WebkitBackdropFilter: "blur(16px) saturate(160%)", border: isDark ? "1px solid rgba(251,146,60,0.28)" : "1px solid rgba(255,255,255,0.7)", borderRadius: BUTTON_RADIUS, padding: "8px 16px", cursor: "pointer", color: isDark ? C.sparkBright : "#5B4BD4", fontSize: 12, fontWeight: 500, fontFamily: BUTTON_FONT, boxShadow: isDark ? "inset 0 1px 0 rgba(251,146,60,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(124,92,231,0.1)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(249,115,22,0.22)" : "rgba(255,255,255,0.58)"; e.currentTarget.style.borderColor = isDark ? "rgba(251,146,60,0.4)" : "rgba(255,255,255,0.9)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(249,115,22,0.14)" : "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = isDark ? "rgba(251,146,60,0.28)" : "rgba(255,255,255,0.7)"; }}>
                  {p.label}
                </button>
              ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Generating indicator — first build only; re-generate uses in-grid overlay */}
        <AnimatePresence>
          {generating && !currentSources && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: C.spark }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>Pulling data and building your dashboard…</div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Widget grid */}
        {hasDashboard && currentSources && (
          <div style={{ padding: "16px 28px 40px", position: "relative" }}>
            <DashboardDataSourcesBar
              sources={currentSources}
              lastRefreshedAt={lastDataRefreshAt}
              isDark={isDark}
              canRefresh={canRefreshData}
              refreshing={isRefreshingData}
              onRefresh={handleRefreshData}
            />
            <AnimatePresence>
              {(isRegenerating || isRefreshingData) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    background: isDark ? "rgba(15, 10, 7, 0.78)" : "rgba(247, 248, 249, 0.82)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    borderRadius: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                        style={{ width: 7, height: 7, borderRadius: "50%", background: C.spark }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>
                    {isRefreshingData
                      ? `Pulling latest data from ${currentSources.map(s => getSourceConfig(s).label).join(", ")}…`
                      : "Re-building your dashboard…"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              key={dashboardRefreshKey}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                opacity: isRegenerating || isRefreshingData ? 0.45 : 1,
                transition: "opacity 0.2s ease",
                pointerEvents: isRegenerating || isRefreshingData ? "none" : "auto",
              }}
            >
              {currentSources.length > 0 && buildDashboardWidgets(activeScenario, currentSources)}
            </div>
          </div>
        )}

        </> }

        <p
          style={{
            marginTop: "auto",
            padding: "16px 28px 22px",
            fontSize: 10,
            fontWeight: 400,
            lineHeight: 1.5,
            textAlign: "center",
            letterSpacing: "0.01em",
            color: isDark ? "rgba(251,146,60,0.16)" : "rgba(124,92,231,0.2)",
            userSelect: "none",
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Iskra is AI — it can make mistakes, so please check responses.
        </p>
      </div>


      <IskraDeleteConfirmDialog
        isOpen={deleteConfirm !== null}
        dashboardName={deleteConfirm?.name ?? ""}
        isDark={isDark}
        onConfirm={() => {
          if (deleteConfirm) handleDeleteDashboard(deleteConfirm.id);
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(28,22,20,0.35)"}; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
