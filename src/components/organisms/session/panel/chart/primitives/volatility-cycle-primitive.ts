import { getVolatilityData } from "@/libs/store/selectors";
import type { TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import type { ISeriesApi } from "lightweight-charts";
import { createEffect, onCleanup, onMount } from "solid-js";
import { VolatilityCycleIndicator } from "../indicators/volatility-cycle";

export const VolatilityCyclePrimitive = (
  series: ISeriesApi<"Candlestick">,
  sessionId: string,
  timeFrame: TimeFrame,
) => {
  const { state } = useStore();

  const visibility = () =>
    state.sessions.entities[sessionId].charts[timeFrame].indicators.volatility;
  const volatility = getVolatilityData(state, sessionId, timeFrame);

  let volIndicator: VolatilityCycleIndicator | undefined;

  onMount(() => {
    volIndicator = new VolatilityCycleIndicator();
    volIndicator.setData(volatility());
    volIndicator.setVisible(visibility());
    series.attachPrimitive(volIndicator);

    onCleanup(() => {
      if (volIndicator) series.detachPrimitive(volIndicator);
    });
  });

  createEffect(() => {
    if (volIndicator) volIndicator.setData(volatility());
  });

  createEffect(() => {
    if (volIndicator) volIndicator.setVisible(visibility());
  });
};
