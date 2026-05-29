import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, X, Save, Trash2, ArrowRight, TrendingUp, TrendingDown,
  Users, Bug, MessageSquare, Flag, FileText, CheckCircle,
  Activity, BarChart2, Zap, AlertCircle, LayoutDashboard, RefreshCw,
  Sun, Moon,
} from "lucide-react";

// ─── Color palettes ──────────────────────────────────────────────────────────
const DARK_PALETTE = {
  bgBase: "#071410",
  bgSurface: "#0D1F19",
  bgElevated: "#122A22",
  bgHover: "#163020",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  spark: "#FF3D00",
  sparkBright: "#FF6330",
  sparkFaint: "rgba(255,61,0,0.12)",
  sparkGlow: "rgba(255,61,0,0.25)",
  textPrimary: "#FFFFFF",
  textSecondary: "#FFFFFF",
  textMuted: "#9898B8",
  success: "#22C55E",
  successFaint: "rgba(34,197,94,0.12)",
  warning: "#F5A623",
  warningFaint: "rgba(245,166,35,0.12)",
  error: "#EF4444",
  errorFaint: "rgba(239,68,68,0.12)",
  info: "#38BDF8",
  amplitude: "#29C6FA",
  amplitudeFaint: "rgba(41,198,250,0.1)",
  jira: "#6FA8FF",
  jiraFaint: "rgba(111,168,255,0.1)",
  slack: "#D48EDB",
  slackFaint: "rgba(212,142,219,0.1)",
  confluence: "#6FA8FF",
  confluenceFaint: "rgba(111,168,255,0.1)",
  launchdarkly: "#A5AFFF",
  launchdarklyFaint: "rgba(165,175,255,0.1)",
};

const LIGHT_PALETTE = {
  bgBase: "#F4F4FA",
  bgSurface: "#FFFFFF",
  bgElevated: "#EEEEF6",
  bgHover: "#E6E6F2",
  border: "rgba(0,0,0,0.09)",
  borderStrong: "rgba(0,0,0,0.16)",
  spark: "#E83200",
  sparkBright: "#FF4D1A",
  sparkFaint: "rgba(232,50,0,0.08)",
  sparkGlow: "rgba(232,50,0,0.15)",
  textPrimary: "#0A0A18",
  textSecondary: "#0A0A18",
  textMuted: "#5A5A7A",
  success: "#16A34A",
  successFaint: "rgba(22,163,74,0.10)",
  warning: "#B45309",
  warningFaint: "rgba(180,83,9,0.10)",
  error: "#DC2626",
  errorFaint: "rgba(220,38,38,0.10)",
  info: "#0369A1",
  amplitude: "#0080B8",
  amplitudeFaint: "rgba(0,128,184,0.1)",
  jira: "#1A5FD0",
  jiraFaint: "rgba(26,95,208,0.1)",
  slack: "#7A2090",
  slackFaint: "rgba(122,32,144,0.1)",
  confluence: "#1A5FD0",
  confluenceFaint: "rgba(26,95,208,0.1)",
  launchdarkly: "#3040C8",
  launchdarklyFaint: "rgba(48,64,200,0.1)",
};

let C: typeof DARK_PALETTE = DARK_PALETTE;

// ─── Types ───────────────────────────────────────────────────────────────────
type SourceId = "amplitude" | "jira" | "slack" | "confluence" | "launchdarkly";

interface SavedDashboard {
  id: string;
  name: string;
  prompt: string;
  sources: SourceId[];
  createdAt: Date;
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

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
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
      { name: "#design", messages: 228 }, { name: "#general", messages: 195 }, { name: "#data", messages: 163 },
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
  const fill = `${line} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 40 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        return <rect key={i} x={i * (bw + gap) + gap * 0.5} y={H - bh - 3} width={bw} height={bh} rx="0" fill={color} opacity={i === values.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

function DonutRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = 24, cx = 32, cy = 32, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
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
        background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 0,
        padding: "18px 20px 20px", gridColumn: span > 1 ? `span ${span}` : undefined,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span style={{ color, display: "flex" }}><Icon size={13} /></span>
        <span style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>{label}</span>
        {badge && <span style={{ marginLeft: "auto", fontSize: 11, color, background: `${color}20`, padding: "2px 8px", borderRadius: 0, fontWeight: 600 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500, marginBottom: 14 }}>{title}</div>
      {children}
    </motion.div>
  );
}

// ─── Individual widgets ───────────────────────────────────────────────────────
function WidgetAmplitudeDAU({ delay }: { delay: number }) {
  const d = MOCK.amplitude;
  return (
    <W title="Active Users" source="amplitude" delay={delay}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
        {[{ v: d.dau, ch: d.dauChange, label: "DAU" }, { v: d.mau, ch: d.mauChange, label: "MAU" }].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: "-1px" }}>{fmt(item.v)}</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <TrendingUp size={11} color={C.success} />
              <span style={{ fontSize: 13, color: C.success }}>{item.ch}%</span>
            </div>
          </div>
        ))}
      </div>
      <Sparkline values={d.retention} color={C.amplitude} />
      <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>7-day retention curve</div>
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
          <div style={{ fontSize: 13, color: C.textMuted }}>total this week</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 4 }}>
          <TrendingUp size={12} color={C.success} />
          <span style={{ fontSize: 13, color: C.success }}>+11.2% vs last week</span>
        </div>
      </div>
      <MiniBar values={d.weeklyEvents} color={C.amplitude} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d} style={{ fontSize: 13, color: C.textMuted }}>{d}</span>)}
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
              <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: "monospace" }}>{e.name}</span>
              <span style={{ fontSize: 13, color: C.textMuted }}>{fmt(e.count)}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(e.count / max) * 100}%`, background: C.amplitude, borderRadius: 0, opacity: i === 0 ? 1 : 0.5 }} />
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
          <div style={{ fontSize: 13, color: C.textMuted }}>{d.done} / {d.total} pts</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[{ label: "Open", val: d.open, color: C.warning }, { label: "In Progress", val: d.inProgress, color: C.jira }, { label: "Done", val: d.closed, color: C.success }].map(item => (
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 0, padding: "8px 10px", textAlign: "center" }}>
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
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${(b.val / total) * 100}%`, background: b.color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, color: b.color, fontWeight: 600, width: 20, textAlign: "right" }}>{b.val}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "8px 10px", background: d.critical > 0 ? C.errorFaint : C.successFaint, borderRadius: 0, display: "flex", alignItems: "center", gap: 6 }}>
        {d.critical > 0
          ? <><AlertCircle size={12} color={C.error} /><span style={{ fontSize: 11, color: C.error }}>{d.critical} critical bug{d.critical > 1 ? "s" : ""} need immediate attention</span></>
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
              <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: "monospace" }}>{ch.name}</span>
              <span style={{ fontSize: 13, color: C.textMuted }}>{fmt(ch.messages)}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${(ch.messages / max) * 100}%`, background: C.slack, borderRadius: 0, opacity: i === 0 ? 1 : 0.5 }} />
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
          <div key={item.label} style={{ background: C.bgElevated, borderRadius: 0, padding: "8px 10px" }}>
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
        <div style={{ background: C.bgElevated, borderRadius: 0, padding: "10px 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.success }}>{d.active}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>active flags</div>
        </div>
        <div style={{ background: C.bgElevated, borderRadius: 0, padding: "10px 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textMuted }}>{d.inactive}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>inactive</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Activity size={12} color={C.launchdarkly} />
        <span style={{ fontSize: 13, color: C.textSecondary }}>{d.evaluations} evaluations this week</span>
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
            <div style={{ width: 28, height: 16, borderRadius: 0, background: f.on ? C.success : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.2s" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", marginLeft: f.on ? "auto" : 0 }} />
            </div>
            <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: "monospace", flex: 1 }}>{f.key}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
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
  amplitude:    [{ id: "amp-dau",    node: d => <WidgetAmplitudeDAU key="amp-dau" delay={d} /> }, { id: "amp-ev",  node: d => <WidgetAmplitudeEvents key="amp-ev" delay={d} /> }, { id: "amp-top", node: d => <WidgetAmplitudeTopEvents key="amp-top" delay={d} /> }],
  jira:         [{ id: "jira-sprint",node: d => <WidgetJiraSprint key="jira-sprint" delay={d} /> }, { id: "jira-bugs",node: d => <WidgetJiraBugs key="jira-bugs" delay={d} /> }, { id: "jira-vel", node: d => <WidgetJiraVelocity key="jira-vel" delay={d} /> }],
  slack:        [{ id: "slack-msg",  node: d => <WidgetSlackMessages key="slack-msg" delay={d} /> }, { id: "slack-ch", node: d => <WidgetSlackChannels key="slack-ch" delay={d} /> }],
  confluence:   [{ id: "conf-ov",    node: d => <WidgetConfluenceOverview key="conf-ov" delay={d} /> }, { id: "conf-pg", node: d => <WidgetConfluencePages key="conf-pg" delay={d} /> }],
  launchdarkly: [{ id: "ld-ov",      node: d => <WidgetLDOverview key="ld-ov" delay={d} /> }, { id: "ld-flags",node: d => <WidgetLDFlags key="ld-flags" delay={d} /> }],
};

// ─── Background animation ─────────────────────────────────────────────────────
type FallItem =
  | { kind: "dot";  cx: number; startY: number; r: number;   dur: number }
  | { kind: "line"; cx: number; startY: number; len: number; dur: number };

const FALL_ITEMS: FallItem[] = Array.from({ length: 80 }, (_, i) => {
  const cx    = Math.round(20 + (i * 47 + i * i * 11) % 1570);
  const startY = Math.round((i * 137) % 1100) - 120;
  const dur   = 9 + (i * 1.7) % 16;
  const kind  = (["dot", "dot", "dot", "line", "line", "line"] as const)[i % 6];
  if (kind === "dot") return { kind, cx, startY, r: [1, 1.5, 2][i % 3], dur };
  return { kind: "line", cx, startY, len: 6 + (i * 7 + i * i * 2) % 22, dur };
});

function BackgroundAnimation() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        {FALL_ITEMS.map((item, i) => {
          const common = {
            animate: { opacity: [0, 0.45, 0.45, 0] } as { opacity: number[] },
            transition: { duration: item.dur, repeat: Infinity, ease: "linear" as const, times: [0, 0.08, 0.92, 1] },
          };
          if (item.kind === "dot") return (
            <motion.circle key={i} cx={item.cx} r={item.r} fill="rgba(160,190,255,1)"
              animate={{ cy: [item.startY, item.startY + 1150], ...common.animate }}
              transition={common.transition} />
          );
          if (item.kind === "line") return (
            <motion.line key={i} x1={item.cx} x2={item.cx} stroke="rgba(140,175,255,0.9)" strokeWidth="1"
              animate={{ y1: [item.startY, item.startY + 1150], y2: [item.startY + item.len, item.startY + item.len + 1150], ...common.animate }}
              transition={common.transition} />
          );
          return null;
        })}
      </svg>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function IskraLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <motion.svg viewBox="0 0 30 30" width="26" height="26" fill="none"
        animate={{ rotate: [0,18,-14,8,0], scale: [1,1.12,0.96,1.06,1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 6px rgba(255,80,10,0.7))" }}>
        <defs>
          <linearGradient id="lg1" x1="15" y1="0" x2="15" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B30" /><stop offset="1" stopColor="#FF1800" />
          </linearGradient>
        </defs>
        <path d="M15 0 L16.6 12 L28 15 L16.6 18 L15 30 L13.4 18 L2 15 L13.4 12 Z" fill="url(#lg1)" />
        <path d="M15 5 L16 12.5 L22 15 L16 17.5 L15 25 L14 17.5 L8 15 L14 12.5 Z" fill="white" opacity="0.18" />
      </motion.svg>
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textPrimary, fontFamily: "'Rubik', system-ui, sans-serif" }}>Iskra</span>
    </div>
  );
}

// ─── Dashboard sidebar ────────────────────────────────────────────────────────
function DashboardSidebar({ dashboards, activeId, onSelect, onDelete, onClose }: {
  dashboards: SavedDashboard[]; activeId: string | null;
  onSelect: (id: string) => void; onDelete: (id: string) => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
      style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 280, zIndex: 90, background: C.bgSurface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LayoutDashboard size={16} color={C.textMuted} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Saved Dashboards</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, lineHeight: 1 }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {dashboards.length === 0
          ? <div style={{ padding: "24px 8px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>No saved dashboards yet.</div>
          : dashboards.map(d => (
            <div key={d.id} onClick={() => onSelect(d.id)}
              style={{ display: "flex", alignItems: "center", padding: "10px", borderRadius: 0, background: activeId === d.id ? C.bgHover : "transparent", border: `1px solid ${activeId === d.id ? C.borderStrong : "transparent"}`, cursor: "pointer", gap: 8, marginBottom: 4 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  {d.sources.map(s => (
                    <span key={s} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 0, background: `${SOURCE_CONFIG[s].color}20`, color: SOURCE_CONFIG[s].color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {SOURCE_CONFIG[s].label.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); onDelete(d.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, lineHeight: 1, opacity: 0.6, padding: 4, borderRadius: 4 }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))
        }
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IgniteIskraPage() {
  const [isDark, setIsDark] = useState(true);
  C = isDark ? DARK_PALETTE : LIGHT_PALETTE;

  const [prompt, setPrompt] = useState("");
  const [activeSources, setActiveSources] = useState<SourceId[]>([...ALL_SOURCES]);
  const [generating, setGenerating] = useState(false);
  const [currentSources, setCurrentSources] = useState<SourceId[] | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);

  const handleGenerate = useCallback((overridePrompt?: string) => {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) return;
    setGenerating(true);
    setActiveDashboardId(null);
    setTimeout(() => {
      const sources = detectSources(p).filter(s => activeSources.includes(s));
      setCurrentSources(sources.length > 0 ? sources : activeSources);
      setCurrentName(dashboardName(p));
      setCurrentPrompt(p);
      setGenerating(false);
    }, 900);
  }, [prompt, activeSources]);

  const handleSave = useCallback(() => {
    if (!currentSources || !currentName || !currentPrompt) return;
    const id = `d-${++idRef.current}`;
    setSavedDashboards(prev => [{ id, name: currentName, prompt: currentPrompt, sources: currentSources, createdAt: new Date() }, ...prev]);
    setActiveDashboardId(id);
  }, [currentSources, currentName, currentPrompt]);

  const handleSelectDashboard = useCallback((id: string) => {
    const d = savedDashboards.find(x => x.id === id);
    if (!d) return;
    setCurrentSources(d.sources); setCurrentName(d.name); setCurrentPrompt(d.prompt);
    setPrompt(d.prompt); setActiveDashboardId(id); setShowSidebar(false);
  }, [savedDashboards]);

  const handleDeleteDashboard = useCallback((id: string) => {
    setSavedDashboards(prev => prev.filter(d => d.id !== id));
    if (activeDashboardId === id) { setActiveDashboardId(null); setCurrentSources(null); }
  }, [activeDashboardId]);

  const toggleSource = (s: SourceId) => setActiveSources(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s]);

  const hasDashboard = currentSources !== null && !generating;

  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bgBase,
      color: C.textPrimary,
      fontFamily: "'Rubik', system-ui, sans-serif",
    }}>
      <BackgroundAnimation />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(7,20,16,0.88)" : "rgba(244,244,250,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <IskraLogo />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {savedDashboards.length > 0 && (
            <button onClick={() => setShowSidebar(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, background: showSidebar ? C.bgElevated : "transparent", border: `1px solid ${showSidebar ? C.borderStrong : C.border}`, borderRadius: 0, padding: "6px 12px", cursor: "pointer", color: C.textSecondary, fontSize: 13 }}>
              <LayoutDashboard size={13} />
              <span>Dashboards</span>
              <span style={{ marginLeft: 2, background: C.spark, color: "white", fontSize: 13, fontWeight: 700, borderRadius: 0, padding: "0 5px", lineHeight: "16px" }}>{savedDashboards.length}</span>
            </button>
          )}
          {hasDashboard && activeDashboardId === null && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={handleSave}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.spark, border: "none", borderRadius: 0, padding: "6px 14px", cursor: "pointer", color: "white", fontSize: 13, fontWeight: 600 }}>
              <Save size={13} /><span>Save Dashboard</span>
            </motion.button>
          )}
          <button onClick={() => { setCurrentSources(null); setCurrentName(null); setCurrentPrompt(null); setPrompt(""); setActiveDashboardId(null); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 12px", cursor: "pointer", color: C.textSecondary, fontSize: 13 }}>
            <Plus size={13} /><span>New Dashboard</span>
          </button>
          <motion.button onClick={() => setIsDark(v => !v)} whileTap={{ scale: 0.92 }}
            style={{ width: 36, height: 36, borderRadius: 0, border: `1px solid ${C.border}`, background: C.bgElevated, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={isDark ? "sun" : "moon"} initial={{ opacity: 0, rotate: -30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 30, scale: 0.7 }} transition={{ duration: 0.18 }} style={{ display: "flex" }}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSidebar(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.5)" }} />
            <DashboardSidebar dashboards={savedDashboards} activeId={activeDashboardId} onSelect={handleSelectDashboard} onDelete={handleDeleteDashboard} onClose={() => setShowSidebar(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 120px", position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Prompt area */}
        <div style={{ maxWidth: 680, margin: "0 auto 48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {!hasDashboard && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 36, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <motion.svg
                  viewBox="0 0 100 100" width="96" height="96"
                  animate={{ rotate: [0, 22, -18, 10, 0], scale: [1, 1.18, 0.94, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: isDark ? "drop-shadow(0 0 6px #FF6030) drop-shadow(0 0 18px #FF3D00) drop-shadow(0 0 40px #CC2A00)" : "drop-shadow(0 0 4px #FF6030) drop-shadow(0 0 10px #FF3D00)", overflow: "visible" }}
                >
                  {/* Sharp 4-pointed star: long vertical + horizontal points, tiny diagonal notches */}
                  <path d="M50 2 L54 46 L98 50 L54 54 L50 98 L46 54 L2 50 L46 46 Z" fill={C.spark} />
                  <defs>
                    <radialGradient id="starg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={isDark ? "#FFFFFF" : "#CC2200"} stopOpacity={isDark ? 0.6 : 0.5} />
                      <stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path d="M50 2 L54 46 L98 50 L54 54 L50 98 L46 54 L2 50 L46 46 Z" fill="url(#starg)" />
                </motion.svg>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", color: C.textPrimary, marginBottom: 10, lineHeight: 1.2 }}>Ask me anything.</h1>
              <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
                I pull from our internal tools like Amplitude, Jira, Slack, Confluence, and LaunchDarkly<br />and I can build dashboards around your questions.
              </p>
            </motion.div>
          )}

          {/* Prompt input */}
          <div style={{ position: "relative", width: "100%" }}>
            <motion.div
              whileFocusWithin={{ boxShadow: `0 0 0 1px ${C.spark}60, 0 0 40px ${C.spark}18` } as never}
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : C.bgSurface,
                backdropFilter: "blur(16px)",
                border: `1px solid ${isDark ? "rgba(255,90,20,0.18)" : C.border}`,
                boxShadow: isDark ? `0 0 60px rgba(255,61,0,0.07), inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
                overflow: "hidden",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Input row */}
              <div style={{ display: "flex", alignItems: "flex-start", padding: "16px 18px 0", gap: 10 }}>
                <span style={{ color: C.spark, fontFamily: "monospace", fontWeight: 700, fontSize: 16, marginTop: 3, flexShrink: 0, userSelect: "none" }}>▸</span>
                <textarea ref={inputRef} value={prompt} onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder="Show me sprint health and user retention…" rows={2}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.textPrimary, fontSize: 15, resize: "none", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }} />
              </div>

              {/* Bottom bar */}
              <div style={{ display: "flex", alignItems: "center", padding: "10px 14px 14px", gap: 8, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : C.border}`, marginTop: 10 }}>
                <div style={{ display: "flex", gap: 5, flex: 1, flexWrap: "wrap" }}>
                  {ALL_SOURCES.map(s => {
                    const { label } = SOURCE_CONFIG[s];
                    const active = activeSources.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSource(s)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 7px", borderRadius: 0, border: `1px solid ${active ? `${C.success}50` : C.border}`, background: active ? `${C.success}0D` : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 500, color: active ? C.textPrimary : C.textMuted, transition: "all 0.12s", letterSpacing: "0.01em" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: active ? C.success : C.textMuted, boxShadow: active ? `0 0 6px ${C.success}` : "none", transition: "all 0.12s" }} />
                        {label}
                      </button>
                    );
                  })}
                </div>
                <motion.button
                  onClick={() => handleGenerate()} disabled={!prompt.trim() || generating}
                  whileHover={prompt.trim() && !generating ? { scale: 1.03 } : {}}
                  whileTap={prompt.trim() && !generating ? { scale: 0.97 } : {}}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "9px 22px",
                    borderRadius: 0, border: "none", flexShrink: 0,
                    background: !prompt.trim() || generating ? C.bgElevated : `linear-gradient(135deg, #FF5A1A 0%, #FF2000 100%)`,
                    color: !prompt.trim() || generating ? C.textMuted : "white",
                    cursor: !prompt.trim() || generating ? "default" : "pointer",
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
                    boxShadow: prompt.trim() && !generating ? "0 0 24px rgba(255,61,0,0.35)" : "none",
                    transition: "all 0.15s",
                  }}>
                  {generating
                    ? <><RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite" }} /><span>Building…</span></>
                    : <><Zap size={13} /><span>Generate</span></>}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Suggested prompts */}
          {!hasDashboard && !generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, textAlign: "center", marginBottom: 10 }}>Prompt examples</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTED_PROMPTS.map(p => (
                  <button key={p} onClick={() => { setPrompt(p); handleGenerate(p); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", color: C.textMuted, fontSize: 13, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.textSecondary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Generating state */}
        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "48px 0", alignSelf: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: C.spark }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>Pulling data and building your dashboard…</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard header */}
        {hasDashboard && currentName && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, alignSelf: "stretch" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px" }}>{currentName}</h2>
                {activeDashboardId && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 0, background: C.successFaint, color: C.success, fontWeight: 600 }}>SAVED</span>}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{currentPrompt}</div>
            </div>
          </motion.div>
        )}

        {/* Widget grid */}
        {hasDashboard && currentSources && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, width: "100%" }}>
            {currentSources.flatMap((source, si) => WIDGETS_BY_SOURCE[source].map((w, wi) => w.node(si * 0.08 + wi * 0.06)))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(10,10,24,0.4)"}; }
      `}</style>
    </div>
  );
}
