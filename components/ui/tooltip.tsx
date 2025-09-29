import * as React from "react"
import * as RadixTooltip from "@radix-ui/react-tooltip"

export function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            className="z-50 rounded bg-black/90 px-2 py-1.5 text-xs text-white shadow-lg animate-fade-in"
          >
            {content}
            <RadixTooltip.Arrow className="fill-black/90" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
