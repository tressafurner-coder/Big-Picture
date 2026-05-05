import { ArrowLeft, ChevronDown, HelpCircle, Trash2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router";
import { Tooltip } from "./components/Tooltip";
import { Switch } from "./components/ui/switch";
import { cn } from "./components/ui/utils";
import { ads } from "./design/atlassianPageTokens";

type TokenStatus = "invalid" | "valid";

type TokenRow = {
  id: string;
  name: string;
  status: TokenStatus;
  creationDate: string;
  expirationDate: string;
  lastAccess: string;
};

type UserTokenGroup = {
  id: string;
  userName: string;
  tokens: TokenRow[];
};

const TOKEN_GROUPS: UserTokenGroup[] = [
  {
    id: "iryna",
    userName: "Iryna Ihnatiuk",
    tokens: [
      {
        id: "t1",
        name: "DashboardHub test",
        status: "invalid",
        creationDate: "2026-01-30 05:14:00",
        expirationDate: "2027-01-30 05:14:00",
        lastAccess: "2026-04-07 04:39:36",
      },
      {
        id: "t2",
        name: "BigPicture CI webhook",
        status: "valid",
        creationDate: "2026-02-12 11:22:15",
        expirationDate: "2028-02-12 11:22:15",
        lastAccess: "2026-05-04 18:01:02",
      },
      {
        id: "t3",
        name: "Sandbox integration",
        status: "valid",
        creationDate: "2026-03-01 09:00:00",
        expirationDate: "2027-03-01 09:00:00",
        lastAccess: "2026-05-03 22:45:11",
      },
    ],
  },
  {
    id: "marcus",
    userName: "Marcus Chen",
    tokens: [
      {
        id: "t4",
        name: "Jira Cloud connector",
        status: "valid",
        creationDate: "2025-11-08 14:30:00",
        expirationDate: "2026-11-08 14:30:00",
        lastAccess: "2026-05-05 07:12:44",
      },
      {
        id: "t5",
        name: "Legacy Power BI export",
        status: "invalid",
        creationDate: "2025-06-20 08:15:22",
        expirationDate: "2026-06-20 08:15:22",
        lastAccess: "2026-01-11 16:40:00",
      },
      {
        id: "t6",
        name: "Mobile app staging",
        status: "valid",
        creationDate: "2026-04-18 13:05:48",
        expirationDate: "2027-04-18 13:05:48",
        lastAccess: "2026-05-05 09:30:00",
      },
    ],
  },
  {
    id: "service",
    userName: "Service account · billing-sync",
    tokens: [
      {
        id: "t7",
        name: "Stripe nightly reconcile",
        status: "valid",
        creationDate: "2026-01-05 00:00:01",
        expirationDate: "Never",
        lastAccess: "2026-05-05 00:04:12",
      },
      {
        id: "t8",
        name: "Expired rotation batch",
        status: "invalid",
        creationDate: "2024-12-01 10:00:00",
        expirationDate: "2025-12-01 10:00:00",
        lastAccess: "2025-11-28 23:59:00",
      },
    ],
  },
];

function cloneTokenGroups(source: UserTokenGroup[]): UserTokenGroup[] {
  return source.map((g) => ({
    ...g,
    tokens: g.tokens.map((t) => ({ ...t })),
  }));
}

function TokenStatusBadge({ status }: { status: TokenStatus }) {
  if (status === "invalid") {
    return (
      <span className="inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#AE2E24] bg-[#FFECEB] ring-1 ring-inset ring-[#FFD5D2]">
        Invalid
      </span>
    );
  }
  return (
    <span className="inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#216E4E] bg-[#DCFFF1] ring-1 ring-inset ring-[#7EE2C1]">
      Valid
    </span>
  );
}

export default function ShowOnlyValidApiTokensPage() {
  const [groups, setGroups] = useState<UserTokenGroup[]>(() =>
    cloneTokenGroups(TOKEN_GROUPS),
  );

  const initialOpen = useMemo(
    () =>
      Object.fromEntries(TOKEN_GROUPS.map((g) => [g.id, true])) as Record<
        string,
        boolean
      >,
    [],
  );
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(initialOpen);
  const [hideInvalid, setHideInvalid] = useState(false);

  const totalTokenCount = useMemo(
    () => groups.reduce((n, g) => n + g.tokens.length, 0),
    [groups],
  );

  const hasAnyTokens = totalTokenCount > 0;

  const displayGroups = useMemo(() => {
    return groups
      .map((g) => ({
        ...g,
        tokens: hideInvalid ? g.tokens.filter((t) => t.status === "valid") : g.tokens,
      }))
      .filter((g) => g.tokens.length > 0);
  }, [groups, hideInvalid]);

  const toggleGroup = (id: string) => {
    setGroupOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddNewToken = () => {
    setGroups((prev) => {
      if (prev.length === 0) return prev;
      const now = new Date();
      const pad = (x: number) => String(x).padStart(2, "0");
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const id = `new-${now.getTime()}`;
      const next = [...prev];
      next[0] = {
        ...next[0],
        tokens: [
          ...next[0].tokens,
          {
            id,
            name: "New API token",
            status: "valid",
            creationDate: stamp,
            expirationDate: "Never",
            lastAccess: "—",
          },
        ],
      };
      return next;
    });
  };

  const handleRevokeAllTokens = () => {
    setGroups((prev) => prev.map((g) => ({ ...g, tokens: [] })));
  };

  return (
    <div className={cn("min-h-dvh w-full px-4 py-8 font-sans antialiased", ads.canvas)}>
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className={cn(
            "mb-6 inline-flex items-center gap-2 text-sm font-medium",
            ads.link,
            ads.linkHover,
          )}
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          All prototypes
        </Link>

        <div className={cn("overflow-hidden rounded-lg border shadow-sm", ads.border, ads.surface)}>
          <div className="border-b px-6 py-6" style={{ borderColor: "#DFE1E6" }}>
            <div className="flex items-center gap-2">
              <h1 className={cn(ads.titlePage, "text-2xl")}>API tokens</h1>
              <Tooltip content="Tokens authenticate BigPicture with other applications. Treat them like passwords.">
                <button
                  type="button"
                  className="rounded p-0.5 text-[#626F86] hover:bg-[#EBECF0] hover:text-[#44546F]"
                  aria-label="About API tokens"
                >
                  <HelpCircle className="size-4" strokeWidth={2} aria-hidden />
                </button>
              </Tooltip>
            </div>
            <p className={cn("mt-3 max-w-4xl", ads.bodySubtle)}>
              Tokens are used to authenticate BigPicture with other applications.
              Tokens need to be treated as securely as any other password. The list
              below shows all tokens created by all users on this instance.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center justify-end gap-5 border-b px-6 py-3"
            style={{ borderColor: "#DFE1E6" }}
          >
            <div className="flex shrink-0 items-center gap-3">
              <Tooltip content="Revoke all tokens on this instance">
                <button
                  type="button"
                  disabled={!hasAnyTokens}
                  onClick={handleRevokeAllTokens}
                  className={cn(
                    "rounded-[3px] border bg-white p-2 text-[#626F86] outline-none transition-colors",
                    ads.border,
                    "hover:bg-[#EBECF0] hover:text-[#44546F]",
                    "disabled:pointer-events-none disabled:opacity-40",
                  )}
                  aria-label="Revoke all tokens"
                >
                  <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                </button>
              </Tooltip>
              <span
                aria-hidden
                className="h-5 w-px shrink-0 rounded-full bg-[#DFE1E6]"
              />
            </div>
            <label
              htmlFor="hide-invalid-tokens"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#172B4D]"
            >
              <span>Hide invalid tokens</span>
              <Switch
                id="hide-invalid-tokens"
                checked={hideInvalid}
                onCheckedChange={setHideInvalid}
                aria-label="Hide all tokens with Invalid status"
              />
            </label>
            <button
              type="button"
              onClick={handleAddNewToken}
              className={cn(
                "rounded-[3px] px-4 py-2 font-sans text-sm font-semibold leading-5 text-white",
                ads.primaryInteractive,
                ads.primaryInteractiveHover,
              )}
            >
              Add new token
            </button>
          </div>

          <div className="overflow-x-auto px-0 pb-6 pt-2">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className={cn("border-b", ads.border, ads.surfaceSubtle)}>
                  <th className={cn("px-6 py-2.5 font-semibold", ads.overline)}>
                    Name
                  </th>
                  <th className={cn("px-4 py-2.5 font-semibold", ads.overline)}>
                    Status
                  </th>
                  <th className={cn("px-4 py-2.5 font-semibold", ads.overline)}>
                    Creation date
                  </th>
                  <th className={cn("px-4 py-2.5 font-semibold", ads.overline)}>
                    Expiration date
                  </th>
                  <th className={cn("px-4 py-2.5 font-semibold", ads.overline)}>
                    Last access
                  </th>
                  <th className="w-12 px-2 py-2.5" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {displayGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={cn("px-6 py-10 text-center text-sm", ads.bodySubtle)}
                    >
                      {!hasAnyTokens
                        ? "No API tokens on this instance."
                        : "No tokens match the current filter."}
                    </td>
                  </tr>
                ) : null}
                {displayGroups.map((group) => {
                  const open = groupOpen[group.id] ?? true;
                  return (
                    <Fragment key={group.id}>
                      <tr className={cn(ads.surfaceSubtle)}>
                        <td colSpan={5} className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-[3px] px-2 py-1 text-left text-sm font-semibold text-[#172B4D]",
                              ads.surfaceHover,
                            )}
                            aria-expanded={open}
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 shrink-0 text-[#626F86] transition-transform",
                                !open && "-rotate-90",
                              )}
                              aria-hidden
                            />
                            {group.userName}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            className="rounded p-1.5 text-[#626F86] hover:bg-[#EBECF0] hover:text-[#44546F]"
                            aria-label={`Remove tokens for ${group.userName}`}
                          >
                            <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                          </button>
                        </td>
                      </tr>
                      {open
                        ? group.tokens.map((token) => (
                            <tr
                              key={token.id}
                              className="bg-white hover:bg-[#FAFBFC]"
                            >
                              <td className={cn("px-10 py-3 pl-14 font-medium", ads.body)}>
                                {token.name}
                              </td>
                              <td className="px-4 py-3">
                                <TokenStatusBadge status={token.status} />
                              </td>
                              <td className={cn("px-4 py-3 tabular-nums", ads.bodySubtle)}>
                                {token.creationDate}
                              </td>
                              <td className={cn("px-4 py-3 tabular-nums", ads.bodySubtle)}>
                                {token.expirationDate}
                              </td>
                              <td className={cn("px-4 py-3 tabular-nums", ads.bodySubtle)}>
                                {token.lastAccess}
                              </td>
                              <td className="px-2 py-3 text-right">
                                <button
                                  type="button"
                                  className="rounded p-1.5 text-[#626F86] hover:bg-[#EBECF0] hover:text-[#44546F]"
                                  aria-label={`Delete token ${token.name}`}
                                >
                                  <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                                </button>
                              </td>
                            </tr>
                          ))
                        : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
