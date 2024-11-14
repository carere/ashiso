import { DesktopMenu } from "@/components/organisms/desktop-menu";
import { MobileMenu } from "@/components/organisms/mobile-menu";
import { Loading } from "@/components/templates/loading";
import { getMarketMetadata } from "@/libs/interactions/fetchers";
import { cn } from "@/libs/utils";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { Suspense, useTransition } from "solid-js";

export const route: RouteDefinition = {
  preload: () => getMarketMetadata(),
};

export default function Shell(props: RouteSectionProps) {
  const [pending] = useTransition();
  createAsync(() => getMarketMetadata());

  return (
    <div class="flex flex-col h-full md:flex-row md:py-4 md:pr-4 bg-background">
      <DesktopMenu class="hidden md:flex md:shrink-0" />
      <div
        class={cn("grow overflow-hidden md:flex transition-opacity", {
          "pointer-events-none opacity-50": pending(),
        })}
      >
        <Suspense fallback={<Loading />}>{props.children}</Suspense>
      </div>
      <MobileMenu class="md:hidden" />
    </div>
  );
}
