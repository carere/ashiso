import { getBollingerBandsData } from "@/libs/store/selectors";
import type { TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import type { ISeriesApi } from "lightweight-charts";
import { createEffect, onCleanup, onMount } from "solid-js";
import { BollingerBandsIndicator } from "../indicators/bollinger-bands";

export const BollingerBandsPrimitive = (
  series: ISeriesApi<"Candlestick">,
  sessionId: string,
  timeFrame: TimeFrame,
) => {
  const { state } = useStore();

  const visibility = () =>
    state.sessions.entities[sessionId].charts[timeFrame].indicators.bollinger;
  const bollingerBandsData = getBollingerBandsData(state, sessionId, timeFrame);

  let bbIndicator: BollingerBandsIndicator | undefined;

  onMount(() => {
    bbIndicator = new BollingerBandsIndicator();
    bbIndicator.setData(bollingerBandsData());
    bbIndicator.setVisible(visibility());
    series.attachPrimitive(bbIndicator);

    onCleanup(() => {
      if (bbIndicator) series.detachPrimitive(bbIndicator);
    });
  });

  createEffect(() => {
    if (bbIndicator) bbIndicator.setData(bollingerBandsData());
  });

  createEffect(() => {
    if (bbIndicator) bbIndicator.setVisible(visibility());
  });
};
