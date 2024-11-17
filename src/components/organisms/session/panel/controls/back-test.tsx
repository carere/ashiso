import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { FaIcon } from "@/components/icons/fa-icon";
import {
  setBackTestSpeed,
  toggleBackTest,
  toggleBackTestRun,
  toggleBackTestSelection,
  updateBackTestCurrentTime,
} from "@/libs/store/events";
import {
  getLowestTimeFrame,
  isBackTestRunning,
  isBackTestSession,
  isBackTestStartSelected,
} from "@/libs/store/selectors";
import type { BackTestSpeed, FetchResolution } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import { addResolution } from "@/libs/utils/time";
import { UTCDate } from "@date-fns/utc";
import { createMediaQuery } from "@solid-primitives/media";
import { t } from "i18next";
import { type ComponentProps, For, Show } from "solid-js";
import { match } from "ts-pattern";

const SelectTime = (props: { sessionId: string }) => {
  const { state, dispatch } = useStore();
  const selectionEnabled = () =>
    Boolean(state.sessions.entities[props.sessionId].backTest?.selecting);

  return (
    <Tooltip>
      <TooltipTrigger
        as={Button}
        variant={"ghost"}
        size={"icon"}
        onClick={() => dispatch(toggleBackTestSelection(props.sessionId))}
        class={cn("rounded-none", {
          "text-brand hover:text-brand": selectionEnabled(),
        })}
      >
        <FaIcon name="backward-step" />
      </TooltipTrigger>
      <TooltipContent>
        <Show when={selectionEnabled()} fallback={<p>{t("date_selection_on", { ns: "app" })}</p>}>
          <p>{t("date_selection_off", { ns: "app" })}</p>
        </Show>
      </TooltipContent>
    </Tooltip>
  );
};

const PlayPause = (props: { sessionId: string }) => {
  const { state, dispatch } = useStore();

  return (
    <Button
      onClick={() => dispatch(toggleBackTestRun(props.sessionId))}
      class="rounded-none"
      variant={"ghost"}
      size={"icon"}
      disabled={!isBackTestStartSelected(state, props.sessionId)}
    >
      <Show when={isBackTestRunning(state, props.sessionId)} fallback={<FaIcon name="play" />}>
        <FaIcon name="pause" />
      </Show>
    </Button>
  );
};

const NextCandle = (props: { sessionId: string }) => {
  const { state, dispatch } = useStore();
  const replayCurrentTime = () => state.sessions.entities[props.sessionId].backTest?.currentTime;
  const startReplayTime = () => state.sessions.entities[props.sessionId].selectedTime;
  const timeFrame = () =>
    getLowestTimeFrame(state, props.sessionId).split("-") as [number, FetchResolution];

  return (
    <Tooltip>
      <TooltipTrigger
        as={Button}
        class="rounded-none"
        variant={"ghost"}
        size={"icon"}
        disabled={!isBackTestStartSelected(state, props.sessionId)}
        onClick={() => {
          const time = replayCurrentTime() || startReplayTime();
          if (!time) return;
          const [multiplier, resolution] = timeFrame();
          const add = addResolution(resolution);
          dispatch(
            updateBackTestCurrentTime({
              id: props.sessionId,
              time: add(new UTCDate(time), multiplier).getTime(),
            }),
          );
        }}
      >
        <FaIcon name="forward-step" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("next_candle", { ns: "app" })}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const SpeedSelector = (props: { sessionId: string }) => {
  const { state, dispatch } = useStore();
  const isSmall = createMediaQuery("(max-width: 768px)");
  const speed = () => state.sessions.entities[props.sessionId].backTest?.speed;

  return (
    <DropdownMenu placement={isSmall() ? "left" : "bottom"}>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger as={Button} class="rounded-none" variant={"ghost"} size={"icon"}>
            {`${speed()} x`}
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("speed_selector", { ns: "app" })}</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <For each={["0.1", "0.3", "0.5", "1", "3", "10"] as BackTestSpeed[]}>
          {(s) => (
            <DropdownMenuItem
              onClick={() => dispatch(setBackTestSpeed({ id: props.sessionId, speed: s }))}
            >
              <span>
                {match(s)
                  .with("0.1", () => "1 upd per 10 sec")
                  .with("0.3", () => "1 upd per 3 sec")
                  .with("0.5", () => "1 upd per 2 sec")
                  .with("1", () => "1 upd per sec")
                  .with("3", () => "3 upd per sec")
                  .with("10", () => "10 upd per sec")
                  .exhaustive()}
              </span>
            </DropdownMenuItem>
          )}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const BackTestControls = (props: ComponentProps<"button"> & { sessionId: string }) => {
  const { state, dispatch } = useStore();
  const backTestSession = () => state.sessions.entities[props.sessionId].backTest;

  return (
    <div class={cn("flex flex-row items-center", props.class)}>
      <Tooltip>
        <TooltipTrigger
          as={Button}
          variant={"ghost"}
          size={"icon"}
          onClick={() => dispatch(toggleBackTest(props.sessionId))}
          class={cn("rounded-none order-1 md:order-none", {
            "text-brand hover:text-brand": backTestSession(),
          })}
        >
          <FaIcon name="flask-vial" />
        </TooltipTrigger>
        <TooltipContent>
          <Show when={backTestSession()} fallback={<p>{t("back_test_on", { ns: "app" })}</p>}>
            <p>{t("back_test_off", { ns: "app" })}</p>
          </Show>
        </TooltipContent>
      </Tooltip>
      <Show when={isBackTestSession(state, props.sessionId)}>
        <SelectTime sessionId={props.sessionId} />
        <PlayPause sessionId={props.sessionId} />
        <NextCandle sessionId={props.sessionId} />
        <SpeedSelector sessionId={props.sessionId} />
      </Show>
    </div>
  );
};
