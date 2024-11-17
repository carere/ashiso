import { Button } from "@/components/atoms/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { FaIcon } from "@/components/icons/fa-icon";
import { setLayout, toggleChart } from "@/libs/store/events";
import { getSessionChartByTf } from "@/libs/store/selectors";
import type { TimeFrame } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import { nanoid } from "@carere/solux";
import { createMediaQuery } from "@solid-primitives/media";
import { Dict } from "@swan-io/boxed";
import { createDraggable, transformStyle } from "@thisbeyond/solid-dnd";
import { t } from "i18next";
import { type ComponentProps, For, Show, createEffect, createSignal } from "solid-js";
import { BackTestControls } from "./back-test";
import { DateSelector } from "./date-selector";

const TimeFrameSelector = (props: ComponentProps<"div"> & { sessionId: string }) => {
  const { state, dispatch } = useStore();

  const sessionCharts = () => Dict.keys(state.sessions.entities[props.sessionId].charts);

  const nbVisibleCharts = () => {
    return sessionCharts().filter((tf) => getSessionChartByTf(state, props.sessionId, tf).visible)
      .length;
  };

  return (
    <div class={cn("flex flex-col border-t md:border-t-0 md:flex-row shrink-0", props.class)}>
      <For each={sessionCharts()}>
        {(tf) => (
          <Button
            disabled={
              nbVisibleCharts() === 1 && getSessionChartByTf(state, props.sessionId, tf).visible
            }
            variant={"ghost"}
            size={"icon"}
            class={cn("rounded-none", {
              "text-brand hover:text-brand": getSessionChartByTf(state, props.sessionId, tf)
                .visible,
            })}
            onClick={() => {
              dispatch(
                toggleChart({
                  timeFrame: tf as TimeFrame,
                  sessionId: props.sessionId,
                }),
              );
            }}
          >
            {tf.replace("-", "")}
          </Button>
        )}
      </For>
    </div>
  );
};

const LayoutSelector = (props: ComponentProps<"div"> & { sessionId: string }) => {
  const { state, dispatch } = useStore();

  const layout = () => state.sessions.entities[props.sessionId].layout;

  return (
    <div
      class={cn(
        "flex flex-col md:flex-row border-t md:border-t-0 md:border-x shrink-0 rounded-none bg-background items-center",
        props.class,
      )}
    >
      <Tooltip>
        <TooltipTrigger
          as={Button}
          class={cn("shrink-0 rounded-none", {
            "text-brand hover:text-brand": layout() === "grid",
          })}
          size="icon"
          variant="ghost"
          onClick={() => dispatch(setLayout({ layout: "grid", id: props.sessionId }))}
        >
          <FaIcon name="border-all" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("grid_layout", { ns: "app" })}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          as={Button}
          class={cn("shrink-0 rounded-none", {
            "text-brand hover:text-brand": layout() === "vertical",
          })}
          size="icon"
          variant="ghost"
          onClick={() => dispatch(setLayout({ layout: "vertical", id: props.sessionId }))}
        >
          <FaIcon name="bars" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("v_layout", { ns: "app" })}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          as={Button}
          class={cn("shrink-0 rounded-none", {
            "text-brand hover:text-brand": layout() === "horizontal",
          })}
          size="icon"
          variant="ghost"
          onClick={() => dispatch(setLayout({ layout: "horizontal", id: props.sessionId }))}
        >
          <FaIcon name="bars" rotate="90" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("h_layout", { ns: "app" })}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export const Controls = (props: ComponentProps<"div"> & { sessionId: string }) => {
  const draggable = createDraggable(nanoid());
  const isSmall = createMediaQuery("(max-width: 768px)");
  const [open, setOpen] = createSignal(isSmall());

  createEffect(() => {
    if (isSmall()) setOpen(true);
  });

  return (
    <div
      style={transformStyle(draggable.transform)}
      class={cn(
        "flex flex-col border rounded-b rounded-t shrink-0 md:absolute md:-translate-x-1/2 md:z-50 md:flex-row md:items-center md:bg-background md:rounded-t-none",
        props.class,
      )}
      ref={(ref) => {
        draggable.ref(ref);
        (props.ref as (el: HTMLDivElement) => void)(ref);
      }}
    >
      <Button
        class="hidden md:block cursor-grab shrink-0 touch-none rounded-none active:cursor-grabbing"
        size="icon"
        variant="ghost"
        {...draggable.dragActivators}
      >
        <FaIcon name="grip-vertical" />
      </Button>
      <Show when={open()}>
        <DateSelector
          class="flex flex-col order-3 border-t md:border-t-0 md:order-none md:flex-row md:border-l shrink-0"
          sessionId={props.sessionId}
        />
        <BackTestControls
          class="flex flex-col md:flex-row border-t md:border-l md:border-t-0  shrink-0"
          sessionId={props.sessionId}
        />
        <LayoutSelector sessionId={props.sessionId} />
        <TimeFrameSelector class="order-2 md:order-none" sessionId={props.sessionId} />
      </Show>
      <Button
        size={"icon"}
        variant={"ghost"}
        class="hidden md:block rounded-none shrink-0 border-l"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FaIcon name="chevron-right" {...(open() && { rotate: "180" })} />
      </Button>
    </div>
  );
};
