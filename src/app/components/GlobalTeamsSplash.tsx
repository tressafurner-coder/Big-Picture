import splashIllustrationUrl from "../../imports/global-teams-splash-illustration.svg";
import splashModuleDisabledUrl from "../../imports/global-teams-splash-module-disabled.svg";
import { cn } from "./ui/utils";

export type GlobalTeamsSplashVariant =
  | "no-permission"
  | "module-disabled";

const splashByVariant: Record<GlobalTeamsSplashVariant, string> = {
  "no-permission": splashIllustrationUrl,
  "module-disabled": splashModuleDisabledUrl,
};

type Props = {
  variant: GlobalTeamsSplashVariant;
  className?: string;
};

type SplashCopy = {
  title: string;
  description: string;
  /** Optional footer link (e.g. help centre). */
  readMore?: { label: string; href: string };
};

const copy: Record<GlobalTeamsSplashVariant, SplashCopy> = {
  "no-permission": {
    title: "Insufficient permissions",
    description:
      "Contact your administrator to request access to Global Teams.",
    readMore: {
      label: "Read more about roles and permissions",
      href: "https://example.com/",
    },
  },
  "module-disabled": {
    title: "Global Teams module is disabled",
    description:
      "This module is currently disabled for your organization. Contact your administrator if you need access.",
  },
};

/** Placeholder full-view splash when opening Global Teams — wire routing / permission flags later. */
export function GlobalTeamsSplash({ variant, className }: Props) {
  const { title, description, readMore } = copy[variant];
  const illustrationSrc = splashByVariant[variant];
  return (
    <div
      className={cn(
        "rounded-xl bg-[#F7F8F9] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <img
          src={illustrationSrc}
          alt=""
          width={160}
          height={160}
          className="mb-5 h-[100px] w-auto max-w-[min(100%,160px)] shrink-0 select-none object-contain"
          draggable={false}
        />
        <h2 className="max-w-md text-[20px] font-semibold tracking-tight text-[#091E42]">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#42526E]">
          {description}
        </p>
        {readMore ? (
          <a
            href={readMore.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block max-w-md text-sm font-medium text-[#0C66E4] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8F9]"
          >
            {readMore.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}
