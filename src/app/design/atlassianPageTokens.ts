/**
 * Atlassian Design System–aligned tokens for prototype pages (Atlas / Jira neutrals).
 * Colors: N800 ink, N200 secondary, N40 border, N20 canvas — see atlassian.design foundations.
 */
export const ads = {
  /** Primary text (DN800 / N800) */
  ink800: "text-[#172B4D]",
  /** Secondary / meta (N200) */
  ink200: "text-[#626F86]",
  /** Tertiary labels (N300) */
  ink300: "text-[#44546F]",
  border: "border-[#DFE1E6]",
  canvas: "bg-[#F7F8F9]",
  surface: "bg-white",
  surfaceSubtle: "bg-[#FAFBFC]",
  surfaceHover: "hover:bg-[#F1F2F4]",
  canvasMuted: "bg-[#F7F8F9]",
  link: "text-[#0C66E4]",
  linkHover: "hover:text-[#0055CC]",
  primaryInteractive: "bg-[#0C66E4]",
  primaryInteractiveHover: "hover:bg-[#0055CC]",
  danger: "text-[#AE2E24]",
  dangerHover: "hover:bg-[#FFECEB]",
  sidebarBg: "bg-[#172B4D]",
  sidebarMuted: "text-[#B6C2CF]",

  /** Page title — ~20px regular */
  titlePage: "font-sans text-xl font-normal leading-6 tracking-tight text-[#172B4D]",
  /** Standard UI copy — 14px / 20px */
  body: "font-sans text-sm font-normal leading-5 text-[#172B4D]",
  bodyMedium: "font-sans text-sm font-normal leading-5 text-[#172B4D]",
  bodySubtle: "font-sans text-sm leading-5 text-[#626F86]",
  /** Caption / helper — 12px / 16px */
  caption: "font-sans text-xs leading-4 text-[#626F86]",
  /** Field label — compact label (~11px regular) */
  labelField:
    "font-sans text-[11px] font-normal leading-4 tracking-normal text-[#172B4D]",
  /** Section overline / table header caps */
  overline:
    "font-sans text-[11px] font-normal uppercase leading-4 tracking-[0.06em] text-[#626F86]",
  /** Inline link */
  linkUi: "font-sans text-sm font-normal text-[#0C66E4] underline-offset-4 hover:underline",
  /** Tabs */
  tabActive: "font-sans text-sm font-normal leading-5 text-[#0C66E4]",
  tabInactive:
    "font-sans text-sm font-normal leading-5 text-[#626F86] hover:text-[#172B4D]",

  /** Form control chrome — flat border, 3px radius (Atlaskit field), no elevation */
  fieldControl:
    "rounded-[3px] border border-[#DFE1E6] bg-white px-3 py-2 font-sans text-sm font-normal leading-5 text-[#172B4D] shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-[#626F86] focus:border-[#0C66E4] focus:ring-2 focus:ring-[#0C66E4]/20",

  /**
   * BigPicture admin-style primitives (Atlas Kit–aligned: lozenges, icon buttons,
   * dynamic table rhythm).
   */
  /** Shell around dense tables / settings panels */
  shellElevated:
    "overflow-hidden rounded-[3px] border border-[#DFE1E6] bg-white shadow-sm",
  /** Row separators inside tables — matches N40 */
  tableDivideY: "divide-y divide-[#DFE1E6]",
  /** Neutral icon-only control — toolbar / table row actions */
  iconButtonNeutral:
    "inline-flex items-center justify-center rounded-[3px] p-1.5 text-[#626F86] outline-none transition-colors hover:bg-[#EBECF0] hover:text-[#44546F] focus-visible:ring-2 focus-visible:ring-[#0C66E4]/35 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40",
  /** Subtle bordered icon button — destructive-adjacent cluster */
  iconButtonBordered:
    "inline-flex items-center justify-center rounded-[3px] border bg-white p-2 text-[#626F86] outline-none transition-colors border-[#DFE1E6] hover:bg-[#EBECF0] hover:text-[#44546F] focus-visible:ring-2 focus-visible:ring-[#0C66E4]/35 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40",
  /** Primary CTA — bundles radius + type */
  buttonPrimary:
    "rounded-[3px] px-4 py-2 font-sans text-sm font-normal leading-5 text-white outline-none transition-colors shadow-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/40 focus-visible:ring-offset-2",
  /** Standard interactive table body row */
  tableRowBody: "bg-white transition-colors hover:bg-[#FAFBFC]",
  /** Table header row surface */
  tableHeadRow: "border-b border-[#DFE1E6] bg-[#FAFBFC]",
} as const;
