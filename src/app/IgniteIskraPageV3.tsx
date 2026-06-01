import { useState, useRef, useCallback } from "react";
import slackLogo from "../imports/slack-logo.png";
import confluenceLogo from "../imports/confluence-logo.png";
import amplitudeLogo from "../imports/amplitude-logo.png";
import launchdarklyLogo from "../imports/launchdarkly-logo.png";
import jiraLogo from "../imports/jira-logo.png";
import iskraWordmark from "../imports/iskra-wordmark.png";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, X, Save, Trash2, TrendingUp, TrendingDown,
  Bug, MessageSquare, Flag, FileText, CheckCircle,
  Activity, Zap, AlertCircle, RefreshCw,
  Sun, Moon, Settings, Home, BarChart2, List,
  Search, Bell, Edit2, ArrowLeft,
} from "lucide-react";

// ─── Color palettes ──────────────────────────────────────────────────────────
const DARK_PALETTE = {
  bgBase: "#0A0F0D",
  bgSurface: "#111918",
  bgElevated: "#182420",
  bgHover: "#1E2E29",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.16)",
  spark: "#E8112A",
  sparkBright: "#FF3347",
  sparkFaint: "rgba(232,17,42,0.12)",
  sparkGlow: "rgba(232,17,42,0.25)",
  textPrimary: "#F2F2F2",
  textSecondary: "#D8D8D8",
  textMuted: "#8A9A96",
  success: "#22C55E",
  successFaint: "rgba(34,197,94,0.12)",
  warning: "#F5A623",
  warningFaint: "rgba(245,166,35,0.12)",
  error: "#EF4444",
  errorFaint: "rgba(239,68,68,0.12)",
  info: "#38BDF8",
  amplitude: "#29C6FA",
  amplitudeFaint: "rgba(41,198,250,0.1)",
  jira: "#A78BFA",
  jiraFaint: "rgba(167,139,250,0.1)",
  slack: "#FB923C",
  slackFaint: "rgba(251,146,60,0.1)",
  confluence: "#60A5FA",
  confluenceFaint: "rgba(96,165,250,0.1)",
  launchdarkly: "#34D399",
  launchdarklyFaint: "rgba(52,211,153,0.1)",
  shadow: "none",
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
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
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
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    };
  }
  return {
    background: "#F0EDFF",
    border: "1px solid rgba(124,92,231,0.12)",
    boxShadow: "none",
  };
}

function navActiveColor(active: boolean): string {
  if (!active) return isDarkMode ? "rgba(255,255,255,0.65)" : C.textMuted;
  return isDarkMode ? "white" : C.spark;
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
    background: "linear-gradient(135deg, #4A7FD9 0%, #32B59A 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
type SourceId = "amplitude" | "jira" | "slack" | "confluence" | "launchdarkly";

interface SavedDashboard {
  id: string; name: string; prompt: string;
  sources: SourceId[]; createdAt: Date;
}

// ─── Source config ────────────────────────────────────────────────────────────
const SOURCE_CONFIG: Record<SourceId, { label: string; color: string; faint: string; Icon: React.FC<{ size?: number }> }> = {
  amplitude:    { label: "Amplitude",    color: C.amplitude,    faint: C.amplitudeFaint,    Icon: ({ size = 14 }) => <Activity size={size} /> },
  jira:         { label: "Jira",         color: C.jira,         faint: C.jiraFaint,         Icon: ({ size = 14 }) => <Bug size={size} /> },
  slack:        { label: "Slack",        color: C.slack,        faint: C.slackFaint,        Icon: ({ size = 14 }) => <MessageSquare size={size} /> },
  confluence:   { label: "Confluence",   color: C.confluence,   faint: C.confluenceFaint,   Icon: ({ size = 14 }) => <FileText size={size} /> },
  launchdarkly: { label: "LaunchDarkly", color: C.launchdarkly, faint: C.launchdarklyFaint, Icon: ({ size = 14 }) => <Flag size={size} /> },
};

const ALL_SOURCES: SourceId[] = ["amplitude", "jira", "slack", "confluence", "launchdarkly"];

// Vibrant card gradients (like the project cards in the reference)
const SOURCE_GRADIENTS: Record<SourceId, string> = {
  amplitude:    "linear-gradient(135deg, #9B8AFB 0%, #7C5CE7 100%)",
  jira:         "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
  slack:        "linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)",
  confluence:   "linear-gradient(135deg, #7DD3FC 0%, #38BDF8 100%)",
  launchdarkly: "linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)",
};

const SOURCE_CARD_METRICS: Record<SourceId, { metric: string; detail: string; spark: number[] }> = {
  amplitude:    { metric: "14.8k DAU",    detail: "+8.2% this week",     spark: [42,38,51,47,55,49,58] },
  jira:         { metric: "68% done",     detail: "Sprint 18 · 4d left", spark: [42,38,51,44,50,48] },
  slack:        { metric: "9.5k msgs",    detail: "7-day total",         spark: [124,98,142,113,151,72,134] },
  confluence:   { metric: "1.2k pages",   detail: "72% coverage",        spark: [48,52,45,58,61,55,68] },
  launchdarkly: { metric: "24 active",    detail: "4.2M evaluations",    spark: [18,20,19,22,21,23,24] },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
  amplitude: {
    dau: 14832, dauChange: 8.2, mau: 52104, mauChange: 3.1,
    weeklyEvents: [42000,38000,51000,47000,55000,49000,58000],
    topEvents: [
      { name: "dashboard_view", count: 28420 }, { name: "feature_clicked", count: 21840 },
      { name: "report_generated", count: 15660 }, { name: "export_triggered", count: 9230 },
      { name: "integration_added", count: 6410 },
    ],
    retention: [100,62,44,38,31,28,24],
  },
  jira: {
    sprintName: "Sprint 18", done: 34, total: 50, daysLeft: 4,
    open: 23, inProgress: 14, closed: 58,
    critical: 2, high: 8, medium: 15, low: 22,
    velocity: [42,38,51,44,50,48],
  },
  slack: {
    dailyMessages: [1240,980,1420,1130,1510,720,1340],
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
      { key: "new-dashboard-beta", on: true, rollout: 35 }, { key: "enhanced-search", on: true, rollout: 100 },
      { key: "ai-copilot", on: true, rollout: 12 }, { key: "csv-export-v2", on: false, rollout: 0 },
      { key: "performance-mode", on: true, rollout: 50 },
    ],
  },
};

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

const SUGGESTED_PROMPTS = [
  "Show sprint health and deployment readiness",
  "User engagement and retention overview",
  "Team communication and feature flag status",
  "Full product health across all sources",
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function detectSources(prompt: string): SourceId[] {
  const t = prompt.toLowerCase();
  const found: SourceId[] = [];
  if (/amp|event|user|analytic|retention|funnel|dau|mau|session|track/.test(t)) found.push("amplitude");
  if (/jira|sprint|bug|issue|task|ticket|velocity|backlog|story/.test(t)) found.push("jira");
  if (/slack|message|channel|team|chat|thread/.test(t)) found.push("slack");
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
function W({ title, source, span = 1, badge, children, delay = 0 }: {
  title: string; source: SourceId; span?: 1 | 2 | 3;
  badge?: string; children: React.ReactNode; delay?: number;
}) {
  const { color, label, Icon } = SOURCE_CONFIG[source];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel(),
        borderRadius: 16,
        padding: "18px 20px 20px", gridColumn: span > 1 ? `span ${span}` : undefined,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1 }}>
          <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 600 }}>{title}</span>
          {badge && <span style={{ fontSize: 11, color, background: `${color}18`, padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>{badge}</span>}
        </div>
        <div className={`w-tooltip-wrap-${source}`} style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(".w-tooltip"); if (t) t.style.opacity = "1"; }}
          onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(".w-tooltip"); if (t) t.style.opacity = "0"; }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", fontSize: 10, color: C.textMuted, fontWeight: 700, userSelect: "none" }}>?</div>
          <div className="w-tooltip" style={{ position: "absolute", right: 0, top: 22, background: C.bgSurface, border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: "8px 12px", minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none", zIndex: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color, display: "flex" }}><Icon size={12} /></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{label}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>Data sourced from <strong style={{ color: C.textSecondary }}>{label}</strong> integration.</div>
          </div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Widget components ────────────────────────────────────────────────────────
function WidgetAmplitudeDAU({ delay }: { delay: number }) {
  const d = MOCK.amplitude;
  return (
    <W title="Active Users" source="amplitude" delay={delay}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        {[{ v: d.dau, ch: d.dauChange, label: "DAU" }, { v: d.mau, ch: d.mauChange, label: "MAU" }].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: "-1px" }}>{fmt(item.v)}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <TrendingUp size={11} color={C.success} />
              <span style={{ fontSize: 12, color: C.success }}>{item.ch}%</span>
            </div>
          </div>
        ))}
      </div>
      <Sparkline values={d.retention} color={C.amplitude} />
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>7-day retention curve</div>
    </W>
  );
}

function WidgetAmplitudeEvents({ delay }: { delay: number }) {
  const d = MOCK.amplitude;
  return (
    <W title="Event Volume (7 days)" source="amplitude" span={2} delay={delay}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" }}>{fmt(d.weeklyEvents.reduce((a, b) => a + b))}</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>total this week</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 4 }}>
          <TrendingUp size={12} color={C.success} />
          <span style={{ fontSize: 12, color: C.success }}>+11.2% vs last week</span>
        </div>
      </div>
      <MiniBar values={d.weeklyEvents} color={C.amplitude} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d} style={{ fontSize: 11, color: C.textMuted }}>{d}</span>)}
      </div>
    </W>
  );
}

function WidgetAmplitudeTopEvents({ delay }: { delay: number }) {
  const d = MOCK.amplitude;
  const max = d.topEvents[0].count;
  return (
    <W title="Top Events" source="amplitude" delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {d.topEvents.map((e, i) => (
          <div key={e.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "monospace" }}>{e.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{fmt(e.count)}</span>
            </div>
            <div style={{ height: 3, background: "rgba(128,128,128,0.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(e.count / max) * 100}%`, background: C.amplitude, borderRadius: 2, opacity: i === 0 ? 1 : 0.5 }} />
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetJiraSprint({ delay }: { delay: number }) {
  const d = MOCK.jira;
  const pct = Math.round((d.done / d.total) * 100);
  return (
    <W title={d.sprintName} source="jira" badge={`${d.daysLeft}d left`} delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <DonutRing pct={pct} color={C.jira} size={60} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" }}>{pct}%</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{d.done} / {d.total} pts</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[{ label: "Open", val: d.open, color: C.warning }, { label: "In Progress", val: d.inProgress, color: C.jira }, { label: "Done", val: d.closed, color: C.success }].map(item => (
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetJiraBugs({ delay }: { delay: number }) {
  const d = MOCK.jira;
  const bugs = [{ label: "Critical", val: d.critical, color: C.error }, { label: "High", val: d.high, color: C.warning }, { label: "Medium", val: d.medium, color: C.jira }, { label: "Low", val: d.low, color: C.textMuted }];
  const total = bugs.reduce((s, b) => s + b.val, 0);
  return (
    <W title="Bug Distribution" source="jira" delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bugs.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted, width: 52 }}>{b.label}</span>
            <div style={{ flex: 1, height: 6, background: "rgba(128,128,128,0.1)", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(b.val / total) * 100}%`, background: b.color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, color: b.color, fontWeight: 600, width: 20, textAlign: "right" }}>{b.val}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "8px 10px", background: d.critical > 0 ? C.errorFaint : C.successFaint, borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
        {d.critical > 0
          ? <><AlertCircle size={12} color={C.error} /><span style={{ fontSize: 11, color: C.error }}>{d.critical} critical bugs need immediate attention</span></>
          : <><CheckCircle size={12} color={C.success} /><span style={{ fontSize: 11, color: C.success }}>No critical bugs</span></>}
      </div>
    </W>
  );
}

function WidgetJiraVelocity({ delay }: { delay: number }) {
  const d = MOCK.jira;
  const avg = Math.round(d.velocity.reduce((s, v) => s + v) / d.velocity.length);
  return (
    <W title="Velocity (last 6 sprints)" source="jira" delay={delay}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" }}>{avg}</div>
        <div style={{ fontSize: 11, color: C.textMuted, paddingBottom: 4 }}>avg pts / sprint</div>
      </div>
      <MiniBar values={d.velocity} color={C.jira} />
    </W>
  );
}

function WidgetSlackMessages({ delay }: { delay: number }) {
  const d = MOCK.slack;
  const total = d.dailyMessages.reduce((s, v) => s + v);
  return (
    <W title="Message Volume (7 days)" source="slack" span={2} delay={delay}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" }}>{fmt(total)}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>messages this week</div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>{d.avgResponse}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>avg response time</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            <TrendingDown size={11} color={C.success} />
            <span style={{ fontSize: 11, color: C.success }}>{Math.abs(d.responseChange)}% faster</span>
          </div>
        </div>
      </div>
      <Sparkline values={d.dailyMessages} color={C.slack} />
    </W>
  );
}

function WidgetSlackChannels({ delay }: { delay: number }) {
  const d = MOCK.slack;
  const max = d.channels[0].messages;
  return (
    <W title="Most Active Channels" source="slack" delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {d.channels.map((ch, i) => (
          <div key={ch.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "monospace" }}>{ch.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{fmt(ch.messages)}</span>
            </div>
            <div style={{ height: 3, background: "rgba(128,128,128,0.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(ch.messages / max) * 100}%`, background: C.slack, borderRadius: 2, opacity: i === 0 ? 1 : 0.5 }} />
            </div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetConfluenceOverview({ delay }: { delay: number }) {
  const d = MOCK.confluence;
  return (
    <W title="Documentation Health" source="confluence" delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <DonutRing pct={d.coverage} color={d.coverage >= 80 ? C.success : d.coverage >= 60 ? C.warning : C.error} size={60} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary }}>{d.coverage}%</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>doc coverage</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[{ v: fmt(d.totalPages), label: "total pages" }, { v: fmt(d.weeklyViews), label: "weekly views", change: d.viewsChange }].map(item => (
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{item.v}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{item.label}</div>
            {"change" in item && item.change && (
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <TrendingUp size={10} color={C.success} />
                <span style={{ fontSize: 10, color: C.success }}>{item.change}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetConfluencePages({ delay }: { delay: number }) {
  const d = MOCK.confluence;
  return (
    <W title="Recently Updated" source="confluence" span={2} delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {d.pages.map((p, i) => (
          <div key={p.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < d.pages.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <FileText size={13} color={C.confluence} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{p.space}</div>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>{p.ago}</div>
          </div>
        ))}
      </div>
    </W>
  );
}

function WidgetLDOverview({ delay }: { delay: number }) {
  const d = MOCK.launchdarkly;
  return (
    <W title="Feature Flag Status" source="launchdarkly" delay={delay}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.bgElevated, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.success }}>{d.active}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>active flags</div>
        </div>
        <div style={{ background: C.bgElevated, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textMuted }}>{d.inactive}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>inactive</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Activity size={12} color={C.launchdarkly} />
        <span style={{ fontSize: 12, color: C.textSecondary }}>{d.evaluations} evaluations this week</span>
        <TrendingUp size={11} color={C.success} />
        <span style={{ fontSize: 11, color: C.success }}>+{d.evalChange}%</span>
      </div>
    </W>
  );
}

function WidgetLDFlags({ delay }: { delay: number }) {
  const d = MOCK.launchdarkly;
  return (
    <W title="Active Rollouts" source="launchdarkly" span={2} delay={delay}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {d.flags.map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 16, borderRadius: 8, background: f.on ? C.success : "rgba(128,128,128,0.2)", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.2s" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", marginLeft: f.on ? "auto" : 0 }} />
            </div>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: "monospace", flex: 1 }}>{f.key}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 80, height: 4, background: "rgba(128,128,128,0.1)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${f.rollout}%`, background: f.on ? C.launchdarkly : C.textMuted, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: f.on ? C.launchdarkly : C.textMuted, width: 32, textAlign: "right" }}>{f.rollout}%</span>
            </div>
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

// ─── Shooting stars (dark mode only) ─────────────────────────────────────────
const SHOOTING_STARS = Array.from({ length: 14 }, (_, i) => {
  const r = (i + 1) * 241.73 + i * i * 37.31 + i * 113.7;
  return { id: i, left: 5 + (r % 85), top: -3 + ((r * 1.37) % 35), angle: 22 + ((r * 0.17) % 42), length: 70 + ((r * 0.43) % 130), dur: 0.45 + ((r * 0.023) % 0.7), cycle: 6 + ((r * 0.19) % 18), delay: (r * 0.07) % 25 };
});

function BackgroundAnimation({ isDark }: { isDark: boolean }) {
  if (!isDark) return null;
  const keyframesCss = SHOOTING_STARS.map(s => {
    const td = 380 + s.length, vP = ((s.dur / s.cycle) * 100).toFixed(2), fP = ((s.dur / s.cycle) * 100 * 0.6).toFixed(2), sP = (parseFloat(vP) + 0.4).toFixed(2);
    return `@keyframes ss-${s.id}{0%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}0.4%{opacity:1;transform:rotate(${s.angle}deg) translateX(0px)}${fP}%{opacity:.9}${vP}%{opacity:0;transform:rotate(${s.angle}deg) translateX(${td}px)}${sP}%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}100%{opacity:0;transform:rotate(${s.angle}deg) translateX(0px)}}`;
  }).join('');
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{keyframesCss}</style>
      {SHOOTING_STARS.map(s => (
        <div key={s.id} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.length, height: 1.5, background: "linear-gradient(to right, rgba(200,220,255,0), rgba(210,230,255,1))", borderRadius: 2, transformOrigin: "left center", animation: `ss-${s.id} ${s.cycle}s ${s.delay}s linear infinite`, opacity: 0 }} />
      ))}
    </div>
  );
}

// ─── Iskra Logo ───────────────────────────────────────────────────────────────
function IskraLogo() {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "4px 12px", marginLeft: -5 }}>
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
  { id: "settings",  label: "Settings",  Icon: Settings },
];

// ─── Sources panel ────────────────────────────────────────────────────────────
const SOURCE_DETAILS: Record<SourceId, { workspace: string; description: string }> = {
  amplitude:    { workspace: "Appfire Analytics",  description: "Tracks user behaviour, product events, funnels, and retention across all Appfire surfaces. Used to monitor DAU/MAU, feature adoption, and session quality in real time." },
  jira:         { workspace: "Appfire Jira (APF)", description: "Connected to the main engineering project board. Provides sprint progress, velocity trends, bug distribution by priority, and backlog health across all active teams." },
  slack:        { workspace: "Appfire HQ",         description: "Reads message volume and response time metrics across team channels. Helps surface communication bottlenecks and identify the most active collaboration threads." },
  confluence:   { workspace: "Appfire Docs",       description: "Indexes internal documentation pages, wiki coverage, and recent edits. Enables tracking of documentation health and highlights knowledge gaps across product areas." },
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
          const { label, Icon } = SOURCE_CONFIG[s];
          const { workspace, description } = SOURCE_DETAILS[s];
          const gradient = SOURCE_GRADIENTS[s];
          const isOn = activeSources.includes(s);
          return (
            <div key={s} style={{
              ...glassPanel(isDark), borderRadius: 16,
              overflow: "hidden",
              opacity: isOn ? 1 : 0.55, transition: "opacity 0.2s",
            }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Icon */}
                {(() => {
                  const logoMap: Partial<Record<SourceId, string>> = { slack: slackLogo, confluence: confluenceLogo, amplitude: amplitudeLogo, launchdarkly: launchdarklyLogo, jira: jiraLogo };
                  const logo = logoMap[s];
                  return (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: logo ? "white" : gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: logo ? `1px solid ${C.border}` : "none" }}>
                      {logo ? <img src={logo} alt={label} style={{ width: 26, height: 26, objectFit: "contain" }} /> : <Icon size={18} />}
                    </div>
                  );
                })()}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.textMuted, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 500 }}>
                    Configure
                  </button>
                  <button
                    onClick={() => onToggleSource(s)}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${isOn ? C.errorFaint : C.successFaint}`, background: isOn ? C.errorFaint : C.successFaint, cursor: "pointer", color: isOn ? C.error : C.success, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 600 }}>
                    {isOn ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeftSidebar({ savedDashboards, activeId, onSelect, onDelete, isDark, setIsDark, onNewDashboard, activeNav, setActiveNav, mousePos, onMouseMove, enabledSourceCount }: {
  savedDashboards: SavedDashboard[]; activeId: string | null;
  onSelect: (id: string) => void; onDelete: (id: string) => void;
  isDark: boolean; setIsDark: (v: (p: boolean) => boolean) => void;
  onNewDashboard: () => void; activeNav: string; setActiveNav: (v: string) => void;
  mousePos: { x: number; y: number }; onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  enabledSourceCount: number;
}) {
  return (
    <div style={{
      width: 260, flexShrink: 0, height: "100dvh", position: "sticky", top: 0,
      background: isDark ? "rgba(13,25,24,0.98)" : C.bgSurface,
      borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      zIndex: 20,
    }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 16px" }}>
          <IskraLogo />
        </div>
        <div style={{ margin: "0 20px", height: 1, background: C.border, borderRadius: 1 }} />

        {/* User profile */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #9B8AFB, #7C5CE7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", border: isDark ? "1.5px solid rgba(255,255,255,0.25)" : "none" }}>
                AK
              </div>
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#4AE87A", border: `2px solid ${isDark ? "#1a2e24" : C.bgSurface}` }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? "white" : C.textPrimary, letterSpacing: "0.01em" }}>Alex Kim</div>
              <div style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.6)" : C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>alex@company.com</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: "10px 10px 4px", flex: 1, overflowY: "auto" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id}>
              <button onClick={() => setActiveNav(item.id === "dashboard" ? "dashboard" : item.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, ...(activeNav === item.id ? glassActiveNav() : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }), cursor: "pointer", color: navActiveColor(activeNav === item.id), fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", marginBottom: 2, transition: "all 0.12s", textAlign: "left" }}>
                <item.Icon size={15} />
                <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 5 }}>
                  {item.label}
                  {item.id === "sources" && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 400,
                      letterSpacing: "0.02em",
                      color: activeNav === item.id
                        ? (isDark ? "rgba(255,255,255,0.5)" : "rgba(124,92,231,0.55)")
                        : (isDark ? "rgba(255,255,255,0.38)" : C.textMuted),
                    }}>
                      ({enabledSourceCount} out of {ALL_SOURCES.length})
                    </span>
                  )}
                </span>
                {item.id === "dashboard" && savedDashboards.length > 0 && (
                  <span style={{ marginLeft: "auto", background: isDark ? "rgba(255,255,255,0.2)" : C.sparkFaint, color: isDark ? "white" : C.spark, fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "0 6px", lineHeight: "16px" }}>{savedDashboards.length}</span>
                )}
              </button>

              {/* Dashboard sub-list */}
              {item.id === "dashboard" && savedDashboards.length > 0 && (
                <div style={{ marginTop: 6, marginBottom: 4 }}>
                  {savedDashboards.map(d => (
                    <div key={d.id} onClick={() => onSelect(d.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px 7px 34px", borderRadius: 10, ...(activeId === d.id && activeNav === "dashboard" ? glassActiveNav() : { background: "transparent", border: "1px solid transparent", boxShadow: "none" }), cursor: "pointer", marginBottom: 1, transition: "all 0.12s" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeId === d.id && activeNav === "dashboard" ? C.spark : C.textMuted, flexShrink: 0, opacity: activeId === d.id && activeNav === "dashboard" ? 1 : 0.5 }} />
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: activeId === d.id ? 600 : 400, color: activeId === d.id && activeNav === "dashboard" ? C.spark : (isDark ? "rgba(255,255,255,0.6)" : C.textMuted), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                      <button onClick={e => { e.stopPropagation(); onDelete(d.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 2, display: "flex", flexShrink: 0 }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
    <div onClick={onToggle} style={{ width: 36, height: 20, borderRadius: 20, background: on ? "#7C5CE7" : C.bgElevated, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0, border: `1px solid ${on ? "#5B4BD4" : C.border}` }}>
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
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #7C5CE7, #5B4BD4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", flexShrink: 0 }}>AK</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Alex Kim</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Appfire · Product Manager</div>
          </div>
          <button style={{ marginLeft: "auto", fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.textMuted, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Change photo</button>
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
        <button style={{ padding: "9px 24px", borderRadius: 10, background: "linear-gradient(135deg, #7C5CE7 0%, #7C5CE7 100%)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", boxShadow: "0 2px 14px rgba(124,92,231,0.35)" }}>
          Save changes
        </button>
      </div>
    </div>
  );
}

function SourceCard({ sourceId, onGenerate }: { sourceId: SourceId; onGenerate: (s: SourceId) => void }) {
  const { label } = SOURCE_CONFIG[sourceId];
  const { metric, detail, spark } = SOURCE_CARD_METRICS[sourceId];
  const gradient = SOURCE_GRADIENTS[sourceId];
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
    { label: "DAU", value: "14.8k", sub: "active users", color: "#0BBFB8" },
    { label: "Sprint", value: "68%", sub: "completion", color: "#8B5CF6" },
    { label: "Flags", value: "24", sub: "active", color: "#10B981" },
  ];
  return (
    <div style={{
      width: 272, flexShrink: 0, height: "100dvh", position: "sticky", top: 0,
      background: isDark ? "rgba(13,25,24,0.98)" : C.bgSurface,
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
              const src = SOURCE_CONFIG[ev.source];
              const grad = SOURCE_GRADIENTS[ev.source];
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
export default function IgniteIskraPageV3() {
  const [isDark, setIsDark] = useState(false);
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
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [sidebarMouse, setSidebarMouse] = useState({ x: 50, y: 30 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);


  const handleGenerate = useCallback((overridePrompt?: string) => {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) return;
    setGenerating(true);
    setActiveDashboardId(prev => { setIsDirty(!!prev); return prev; });
    setTimeout(() => {
      const sources = detectSources(p).filter(s => activeSources.includes(s));
      setCurrentSources(sources.length > 0 ? sources : activeSources);
      setCurrentName(prev => prev ?? dashboardName(p));
      setCurrentPrompt(p);
      setPromptHistory(prev => [...prev, p]);
      setGenerating(false);
    }, 900);
  }, [prompt, activeSources]);

  const handleGenerateSource = useCallback((sourceId: SourceId) => {
    const sourceName = SOURCE_CONFIG[sourceId].label;
    const p = `Show me ${sourceName} insights and key metrics`;
    setPrompt(p);
    setActiveSources([sourceId]);
    setGenerating(true);
    setActiveDashboardId(null);
    setTimeout(() => {
      setCurrentSources([sourceId]);
      setCurrentName(`${sourceName} Overview`);
      setCurrentPrompt(p);
      setGenerating(false);
    }, 900);
  }, []);

  const handleSave = useCallback(() => {
    if (!currentSources || !currentName || !currentPrompt) return;
    const id = `d-${++idRef.current}`;
    setSavedDashboards(prev => [{ id, name: currentName!, prompt: currentPrompt!, sources: currentSources!, createdAt: new Date() }, ...prev]);
    setActiveDashboardId(id);
    setIsDirty(false);
  }, [currentSources, currentName, currentPrompt]);

  const handleUpdate = useCallback(() => {
    if (!activeDashboardId || !currentSources || !currentName || !currentPrompt) return;
    setSavedDashboards(prev => prev.map(d => d.id === activeDashboardId
      ? { ...d, name: currentName!, prompt: currentPrompt!, sources: currentSources!, createdAt: new Date() }
      : d
    ));
    setIsDirty(false);
  }, [activeDashboardId, currentSources, currentName, currentPrompt]);

  const handleSaveAsNew = useCallback(() => {
    if (!currentSources || !currentName || !currentPrompt) return;
    const id = `d-${++idRef.current}`;
    setSavedDashboards(prev => [{ id, name: currentName!, prompt: currentPrompt!, sources: currentSources!, createdAt: new Date() }, ...prev]);
    setActiveDashboardId(id);
    setIsDirty(false);
  }, [currentSources, currentName, currentPrompt]);

  const handleSelectDashboard = useCallback((id: string) => {
    const d = savedDashboards.find(x => x.id === id);
    if (!d) return;
    setCurrentSources(d.sources); setCurrentName(d.name); setCurrentPrompt(d.prompt);
    setPrompt(d.prompt); setActiveDashboardId(id); setIsDirty(false); setActiveNav("dashboard");
  }, [savedDashboards]);

  const handleDeleteDashboard = useCallback((id: string) => {
    setSavedDashboards(prev => prev.filter(d => d.id !== id));
    if (activeDashboardId === id) { setActiveDashboardId(null); setCurrentSources(null); }
  }, [activeDashboardId]);

  const handleNewDashboard = useCallback(() => {
    setCurrentSources(null); setCurrentName(null); setCurrentPrompt(null);
    setPrompt(""); setActiveDashboardId(null); setActiveSources([...ALL_SOURCES]); setPromptHistory([]); setHistoryOpen(false); setIsDirty(false);
  }, []);

  const toggleSource = (s: SourceId) => setActiveSources(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s]);

  const hasDashboard = currentSources !== null && !generating;


  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bgBase,
      backgroundImage: isDark ? "none" : "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
      backgroundSize: isDark ? undefined : "28px 28px",
      color: C.textPrimary,
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
    }}>
      <BackgroundAnimation isDark={isDark} />

      {/* Left Sidebar */}
      <LeftSidebar
        savedDashboards={savedDashboards} activeId={activeDashboardId}
        onSelect={handleSelectDashboard} onDelete={handleDeleteDashboard}
        isDark={isDark} setIsDark={setIsDark} onNewDashboard={handleNewDashboard}
        activeNav={activeNav} setActiveNav={setActiveNav}
        enabledSourceCount={activeSources.length}
        mousePos={sidebarMouse}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setSidebarMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      />

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>

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
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, cursor: "pointer", color: C.textMuted, fontSize: 13, fontWeight: 500, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", flexShrink: 0 }}>
                <ArrowLeft size={14} /><span>New Dashboard</span>
              </motion.button>

              {/* Center: Editable name */}
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    value={currentName ?? ""}
                    onChange={e => setCurrentName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={e => { if (e.key === "Enter") setIsEditingName(false); }}
                    autoFocus
                    style={{ ...pageTitleStyle(), margin: 0, background: "transparent", border: "none", borderBottom: `2px solid ${C.spark}`, outline: "none", textAlign: "center", minWidth: 200, maxWidth: 480 }}
                  />
                ) : (
                  <button onClick={() => { setIsEditingName(true); setTimeout(() => nameInputRef.current?.select(), 30); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "text", padding: "4px 8px", borderRadius: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : C.bgElevated; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <h1 style={{ ...pageTitleStyle(), margin: 0 }}>{currentName}</h1>
                    <Edit2 size={13} color={C.textMuted} style={{ opacity: 0.6, flexShrink: 0 }} />
                    {activeDashboardId && !isDirty && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: C.successFaint, color: C.success, fontWeight: 600, marginLeft: 2 }}>SAVED</span>}
                    {activeDashboardId && isDirty && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: isDark ? "rgba(255,180,0,0.15)" : "#FFF8E6", color: "#B07800", fontWeight: 600, marginLeft: 2 }}>UNSAVED CHANGES</span>}
                  </button>
                )}
              </div>

              {/* Right: Save buttons */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {!activeDashboardId ? (
                  <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleSave}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #7C5CE7 0%, #7C5CE7 100%)", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", boxShadow: "0 2px 14px rgba(124,92,231,0.35)" }}>
                    <Save size={13} /><span>Save Dashboard</span>
                  </motion.button>
                ) : isDirty ? (
                  <>
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleSaveAsNew}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", color: C.textMuted, fontSize: 13, fontWeight: 500, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                      <Save size={13} /><span>Save as new</span>
                    </motion.button>
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleUpdate}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #7C5CE7 0%, #7C5CE7 100%)", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", boxShadow: "0 2px 14px rgba(124,92,231,0.35)" }}>
                      <RefreshCw size={13} /><span>Update</span>
                    </motion.button>
                  </>
                ) : (
                  <div style={{ width: 8 }} />
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 style={heroGradientTitleStyle()}>What's on your radar today?</h1>
                <p style={{ margin: 0, fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>Analysing all connected sources — <span style={{ color: C.textSecondary }}>Amplitude, Jira, Slack, Confluence & LaunchDarkly</span></p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.button
                  onClick={handleNewDashboard}
                  disabled={currentSources === null && !generating}
                  whileHover={currentSources !== null || generating ? { scale: 1.02 } : {}}
                  whileTap={currentSources !== null || generating ? { scale: 0.97 } : {}}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 999, background: (currentSources === null && !generating) ? (isDark ? "rgba(255,255,255,0.05)" : C.bgSurface) : C.spark, border: `1px solid ${(currentSources === null && !generating) ? C.border : "transparent"}`, cursor: (currentSources === null && !generating) ? "default" : "pointer", color: (currentSources === null && !generating) ? C.textMuted : "white", fontSize: 13, fontWeight: 600, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", boxShadow: (currentSources === null && !generating) ? "none" : "0 4px 14px rgba(124,92,231,0.35)", opacity: (currentSources === null && !generating) ? 0.5 : 1, transition: "all 0.15s" }}>
                  <Plus size={14} /><span>New Dashboard</span>
                </motion.button>
              </div>
            </>
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
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 20px",
                  borderRadius: 999, border: "none", flexShrink: 0,
                  background: !prompt.trim() || generating ? (isDark ? "rgba(255,255,255,0.07)" : C.bgElevated) : C.spark,
                  color: !prompt.trim() || generating ? C.textMuted : "white",
                  cursor: !prompt.trim() || generating ? "default" : "pointer",
                  fontSize: 13, fontWeight: 700, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  boxShadow: prompt.trim() && !generating ? "0 4px 16px rgba(124,92,231,0.35)" : "none",
                  transition: "all 0.15s",
                }}>
                {generating
                  ? <><RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }} /><span>Building…</span></>
                  : <><Zap size={13} /><span>Generate</span></>}
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
                  {promptHistory.map((p, i) => (
                    <div key={i} onClick={() => setPrompt(p)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 12px", borderRadius: 10, background: isDark ? "rgba(255,255,255,0.04)" : C.bgSurface, border: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.07)" : C.bgHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.04)" : C.bgSurface; }}>
                      <span style={{ fontSize: 10, color: C.textMuted, marginTop: 1, flexShrink: 0 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.4 }}>{p}</span>
                    </div>
                  ))}
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
                <button key={p} onClick={() => { setPrompt(p); handleGenerate(p); }}
                  style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.45)", backdropFilter: "blur(16px) saturate(160%)", WebkitBackdropFilter: "blur(16px) saturate(160%)", border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.7)", borderRadius: 20, padding: "5px 14px", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.85)" : "#5B4BD4", fontSize: 12, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(124,92,231,0.1)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.58)"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)"; }}>
                  {p}
                </button>
              ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Generating indicator */}
        <AnimatePresence>
          {generating && (
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
          <div style={{ padding: "16px 28px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {currentSources.flatMap((source, si) => WIDGETS_BY_SOURCE[source].map((w, wi) => w.node(si * 0.08 + wi * 0.06)))}
            </div>
          </div>
        )}

        </> }
      </div>


      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(28,22,20,0.35)"}; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
