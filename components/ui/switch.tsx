"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  ref?: React.Ref<React.ElementRef<typeof SwitchPrimitive.Root>>;
}) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-6 w-12 items-center rounded-full border border-border bg-muted/60 p-0 transition-colors hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/30",
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none h-5 w-5 rounded-full bg-foreground transition-transform duration-200 ease-in-out data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[26px]" />
    </SwitchPrimitive.Root>
  );
}
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
