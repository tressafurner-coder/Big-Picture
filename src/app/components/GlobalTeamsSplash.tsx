import { cn } from "./ui/utils";

export type GlobalTeamsSplashVariant =
  | "no-permission"
  | "module-disabled";

type Props = {
  variant: GlobalTeamsSplashVariant;
  className?: string;
};

const DS_ILLUSTRATIONS_FIGMA =
  "https://www.figma.com/design/krgcmeDpWmzmUHE5si4I3T/Illustrations-and-Icons?node-id=847-1014&t=nQBNxVgdaMTaIK2g-1";

const copy: Record<
  GlobalTeamsSplashVariant,
  { title: string; description: string }
> = {
  "no-permission": {
    title: "Insufficient permissions",
    description:
      "Contact your administrator to request access to Global Teams.",
  },
  "module-disabled": {
    title: "Global Teams module is disabled",
    description:
      "This module is currently disabled for your organization. Contact your administrator if you need access.",
  },
};

/** Placeholder full-view splash when opening Global Teams — wire routing / permission flags later. */
export function GlobalTeamsSplash({ variant, className }: Props) {
  const { title, description } = copy[variant];
  return (
    <div
      className={cn(
        "rounded-xl bg-[#F7F8F9] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        {/* Gray frame — swap interior for shipped illustration; devs: DS library link */}
        <div className="mb-5 flex h-[132px] w-full max-w-[320px] shrink-0 flex-col items-center justify-center rounded-md border border-[#C1C7D0] bg-[#DFE1E6] px-3 py-2 text-center">
          <a
            href={DS_ILLUSTRATIONS_FIGMA}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-full text-xs font-medium leading-snug text-[#0C66E4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#DFE1E6]"
          >
            Illustrations & icons (Design System · Figma)
          </a>
        </div>
        <h2 className="max-w-md text-[20px] font-semibold tracking-tight text-[#091E42]">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#42526E]">
          {description}
        </p>
      </div>
    </div>
  );
}
