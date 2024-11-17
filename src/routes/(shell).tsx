import { DesktopMenu } from "@/components/organisms/menu/desktop";
import { MobileMenu } from "@/components/organisms/menu/mobile";
import { Loading } from "@/components/templates/loading";
import { getMarketMetadata } from "@/libs/interactions/fetchers";
import type { CandleWorkerResponse } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { Suspense, onCleanup, onMount, useTransition } from "solid-js";

export const route: RouteDefinition = {
  preload: () => getMarketMetadata(),
};

export default function Shell(props: RouteSectionProps) {
  const {
    container: { candlesFetcher },
  } = useStore();
  const [pending] = useTransition();
  createAsync(() => getMarketMetadata());

  const workerInitialized = (event: MessageEvent<CandleWorkerResponse>) => {
    if (event.data.type === "initialized") {
      console.log("[Main Thread] Worker initialized");
    }
  };

  onMount(() => {
    candlesFetcher.addEventListener("message", workerInitialized);
    candlesFetcher.postMessage({ type: "initialize" });

    onCleanup(() => {
      candlesFetcher.removeEventListener("message", workerInitialized);
    });
  });

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
