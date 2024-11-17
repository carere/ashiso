import { Button } from "@/components/atoms/button";
import { FaIcon } from "@/components/icons/fa-icon";
import { toggleIndicator } from "@/libs/store/events";
import type { IndicatorType, TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { Dict } from "@swan-io/boxed";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { match } from "ts-pattern";
import { BollingerPreview } from "./bollinger-preview";
import { PairPreview } from "./pair-preview";
import { PhasePreview } from "./phase-preview";
import { VolatilityPreview } from "./volatility-preview";
import { VolumePreview } from "./volume-preview";

const fromIndicatorToHumanReadable = (indicator: IndicatorType) =>
  match(indicator)
    .with("bollinger", () => "Bollinger Bands")
    .with("volatility", () => "Volatility Cycle")
    .with("volume", () => "Volume")
    .with("phases", () => "Bollinger Bands Phases")
    .exhaustive();

const IndicatorPreview = (props: {
  id: IndicatorType;
  sessionId: string;
  timeFrame: TimeFrame;
  currentTime: number;
}) => {
  const { state, dispatch } = useStore();

  const visible = () =>
    state.sessions.entities[props.sessionId].charts[props.timeFrame].indicators[props.id];

  const toggle = () =>
    dispatch(
      toggleIndicator({
        indicator: props.id,
        sessionId: props.sessionId,
        timeFrame: props.timeFrame,
      }),
    );

  return (
    <div class="flex transition-colors text-sm bg-background/80 gap-2 py-0.5 items-center border border-transparent hover:border-border">
      <span classList={{ "text-gray-500": !visible() }}>
        {fromIndicatorToHumanReadable(props.id)}
      </span>
      <FaIcon
        class="hover:cursor-pointer"
        classList={{ "text-gray-500": !visible() }}
        size="xs"
        onClick={toggle}
        name={visible() ? "eye" : "eye-slash"}
      />
      <Show when={visible()}>
        <Switch>
          <Match when={props.id === "phases"}>
            <PhasePreview
              sessionId={props.sessionId}
              timeFrame={props.timeFrame}
              time={props.currentTime}
            />
          </Match>
          <Match when={props.id === "volume"}>
            <VolumePreview
              sessionId={props.sessionId}
              timeFrame={props.timeFrame}
              time={props.currentTime}
            />
          </Match>
          <Match when={props.id === "volatility"}>
            <VolatilityPreview
              sessionId={props.sessionId}
              timeFrame={props.timeFrame}
              time={props.currentTime}
            />
          </Match>
          <Match when={props.id === "bollinger"}>
            <BollingerPreview
              sessionId={props.sessionId}
              timeFrame={props.timeFrame}
              time={props.currentTime}
            />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export const GraphLegend = (props: {
  sessionId: string;
  timeFrame: TimeFrame;
  currentTime: number;
}) => {
  const { state } = useStore();
  const [show, toggle] = createSignal(false);

  const indicators = () =>
    Dict.keys(state.sessions.entities[props.sessionId].charts[props.timeFrame].indicators);

  const visibleIndicatorsCount = () =>
    indicators().reduce((acc, i) => {
      const visible =
        state.sessions.entities[props.sessionId].charts[props.timeFrame].indicators[i];
      return acc + (visible ? 1 : 0);
    }, 0);

  return (
    <div class="absolute top-1 left-1 z-50 flex flex-col gap-1 items-start">
      <PairPreview
        sessionId={props.sessionId}
        timeFrame={props.timeFrame}
        time={props.currentTime}
      />
      <Show when={show()}>
        <div class="flex flex-col rounded justify-start">
          <For each={indicators()}>
            {(id) => (
              <IndicatorPreview
                id={id as IndicatorType}
                sessionId={props.sessionId}
                timeFrame={props.timeFrame}
                currentTime={props.currentTime}
              />
            )}
          </For>
        </div>
      </Show>
      <Button
        class="px-1.5 h-6 gap-1 items-center justify-center"
        size={"sm"}
        variant={"outline"}
        onClick={() => toggle((p) => !p)}
      >
        <FaIcon name={show() ? "chevron-up" : "chevron-down"} size="xs" />
        <span class="text-xs">{visibleIndicatorsCount()}</span>
      </Button>
    </div>
  );
};
