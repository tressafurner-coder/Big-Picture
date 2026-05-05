"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

/**
 * Atlas Kit Toggle (regular) — neutral track when off (N40), brand blue on (B400),
 * white thumb with subtle elevation. Matches BigPicture / Jira admin patterns.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-4 w-[28px] shrink-0 cursor-pointer items-center rounded-full p-[2px] outline-none transition-colors",
        "data-[state=unchecked]:bg-[#DFE1E6]",
        "data-[state=checked]:bg-[#0C66E4]",
        "focus-visible:ring-2 focus-visible:ring-[#0C66E4]/40 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3 shrink-0 rounded-full bg-white shadow-[0_1px_2px_rgba(9,30,66,0.18)] ring-1 ring-inset ring-[#091E421F]",
          "transition-transform duration-150 ease-out",
          "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
