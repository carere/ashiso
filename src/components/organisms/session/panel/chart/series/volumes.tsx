import { getCandles } from "@/libs/store/selectors";
import type { CandlesId, ContractTicker, TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { findNearestCandleTime } from "@/libs/utils";
import { UTCDate } from "@date-fns/utc";
import type { HistogramData, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { select } from "radash";
import { createEffect, createMemo, createSignal, onCleanup, onMount, untrack } from "solid-js";
import { VolumeMAPrimitive } from "../primitives/volume-ma-primitive";

export const Volumes = (chart: IChartApi, timeFrame: TimeFrame, sessionId: string) => {
  const { state } = useStore();
  const [isSetting, setting] = createSignal(false);

  const ticker = state.sessions.entities[sessionId].ticker as ContractTicker;
  const contract = state.contracts.entities[ticker];
  const multiplier = state.sessions.entities[sessionId].charts[timeFrame].multiplier;
  const currentCandle = () => state.sessions.entities[sessionId].candles[candlesId]?.currentCandle;
  const resolution = state.sessions.entities[sessionId].charts[timeFrame].resolution;
  const candlesId: CandlesId = `${ticker}-${multiplier}-${resolution}`;
  const candles = getCandles(state, sessionId, candlesId);
  const currentTime = () => state.sessions.entities[sessionId].backTest?.currentTime;
  const replayMode = () => Boolean(state.sessions.entities[sessionId].backTest);
  const selectedTime = () => {
    const sTime = state.sessions.entities[sessionId].selectedTime;
    if (sTime) {
      return findNearestCandleTime(
        new UTCDate(sTime),
        resolution,
        multiplier,
      ).getTime() as UTCTimestamp;
    }
  };
  const [aSeries, setSeries] = createSignal<ISeriesApi<"Histogram"> | undefined>(undefined);

  let volumeSeries: ISeriesApi<"Histogram"> | undefined;

  const volumes = createMemo((): HistogramData[] => {
    return select(
      candles(),
      (c) =>
        ({
          time: (c.time / 1000) as number as UTCTimestamp,
          value: c.volume,
          color: c.open > c.close ? "#7F1D1D" : "#4ADE80",
        }) as HistogramData,
      (c) => {
        const time = untrack(currentTime) || untrack(selectedTime);
        return !untrack(replayMode) || !time || c.time <= time;
      },
    );
  });

  createEffect(() => {
    if (volumes().length === 0 || !aSeries()) return;
    setting(true);
    aSeries()?.setData(volumes());
    setting(false);
  });

  onMount(() => {
    volumeSeries = chart.addHistogramSeries({
      priceScaleId: "volume",
      priceLineVisible: false,
      lastValueVisible: false,
      baseLineVisible: true,
      priceFormat: {
        type: "volume",
        precision: contract.volumePrecision,
        minMove: contract.tickSize,
      },
    });

    setSeries(volumeSeries);

    VolumeMAPrimitive(volumeSeries, sessionId, timeFrame);

    chart.priceScale("volume").applyOptions({
      ticksVisible: false,
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

    onCleanup(() => {
      if (volumeSeries) chart.removeSeries(volumeSeries);
    });
  });

  createEffect(() => {
    const candle = currentCandle();
    if (!candle || untrack(isSetting)) return;
    volumeSeries?.update({
      time: (candle.time / 1000) as number as UTCTimestamp,
      value: candle.volume,
      color: candle.open > candle.close ? "#7F1D1D" : "#4ADE80",
    });
  });
};
