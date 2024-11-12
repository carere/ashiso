import { DesktopMenu } from "@/components/organisms/desktop-menu";
import type { RouteSectionProps } from "@solidjs/router";

export default function Shell(props: RouteSectionProps) {
  return (
    <div class="flex flex-col h-full md:flex-row md:py-4 md:pr-4 bg-background">
      <DesktopMenu class="hidden md:flex md:shrink-0" />
      <div class="grow overflow-hidden md:flex">{props.children}</div>
      {/* <MobileMenu class="md:hidden" /> */}
    </div>
  );
}
