import { cn } from "./ui/utils";

export type GlobalTeamsSplashVariant =
  | "no-permission"
  | "module-disabled";

type Props = {
  variant: GlobalTeamsSplashVariant;
  className?: string;
};

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
        {/* Rectangle placeholder for illustration — swap for asset URL later */}
        <div
          className="mb-5 h-[132px] w-full max-w-[320px] shrink-0 rounded-md bg-[#DFE1E6]"
          aria-hidden
        />
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
