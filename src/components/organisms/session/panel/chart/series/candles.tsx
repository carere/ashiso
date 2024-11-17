import { fetching } from "@/libs/store/events";
import { getCandles } from "@/libs/store/selectors";
import type {
  AnalyzerWorkerRequest,
  CandleWorkerRequest,
  CandlesId,
  ContractTicker,
  CrossHair,
  TimeFrame,
  TradingFrequency,
  UTCTimestamp,
} from "@/libs/types";
import { useStore } from "@/libs/utils";
import { findNearestCandleTime, isFutureReached } from "@/libs/utils";
import type { AnalyzerData } from "@/libs/utils/analyzer";
import { getRangeFromBarsInfos, getRangeFromSelectedTime, moveToTime } from "@/libs/utils/graph";
import { UTCDate } from "@date-fns/utc";
import type {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  LogicalRange,
  Time,
} from "lightweight-charts";
import { debounce, pick, select } from "radash";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { BollingerBandsPrimitive } from "../primitives/bollinger-bands-primitive";
import { VolatilityCyclePrimitive } from "../primitives/volatility-cycle-primitive";

export const Candles = (
  chart: IChartApi,
  timeFrame: TimeFrame,
  sessionId: string,
  crossHair: Accessor<CrossHair | undefined>,
  chartId: string,
  isLive: Accessor<boolean>,
  analysis: Accessor<AnalyzerData | undefined>,
) => {
  const {
    state,
    dispatch,
    container: { candlesFetcher, analyzers },
  } = useStore();

  const [hasStTimeChanged, setHasStTimeChanged] = createSignal(false);
  const [isSetting, setting] = createSignal(false);
  const [aSeries, setSeries] = createSignal<ISeriesApi<"Candlestick"> | undefined>(undefined);

  let candleSeries: ISeriesApi<"Candlestick"> | undefined;
  let nbOfLoadedSeries = 0;
  let initialized = false;

  const ticker = state.sessions.entities[sessionId].ticker as ContractTicker;
  const contract = state.contracts.entities[ticker];
  const multiplier = state.sessions.entities[sessionId].charts[timeFrame].multiplier;
  const resolution = state.sessions.entities[sessionId].charts[timeFrame].resolution;
  const candlesId: CandlesId = `${ticker}-${multiplier}-${resolution}`;
  const actions = () => state.sessions.entities[sessionId].charts[timeFrame].indicators;
  const currentTime = () => state.sessions.entities[sessionId].backTest?.currentTime;
  const currentCandle = () => state.sessions.entities[sessionId].candles[candlesId]?.currentCandle;
  const replayMode = () => Boolean(state.sessions.entities[sessionId].backTest);
  const isFetching = () => state.sessions.entities[sessionId].charts[timeFrame].fetching;
  const rawCandles = getCandles(state, sessionId, candlesId);

  const shouldAllowFetchingFutureCandles = () => !isLive() && !replayMode();

  const selectedTime = () => {
    const sTime = state.sessions.entities[sessionId].selectedTime;
    if (sTime) {
      const nearestTime = findNearestCandleTime(
        new UTCDate(sTime),
        resolution,
        multiplier,
      ).getTime() as UTCTimestamp;
      return nearestTime <= contract.onboardDate ? contract.onboardDate : nearestTime;
    }
  };

  const shouldMoveToTime = () =>
    untrack(selectedTime) !== undefined && (nbOfLoadedSeries === 1 || untrack(hasStTimeChanged));

  const candles = createMemo((): CandlestickData[] => {
    return select(
      rawCandles(),
      (c) =>
        ({
          ...c,
          time: (c.time / 1000) as Time,
        }) as CandlestickData,
      (c) => {
        const time = untrack(currentTime) || untrack(selectedTime);
        return !untrack(replayMode) || !time || c.time <= time;
      },
    );
  });

  const fetchUponScroll = debounce({ delay: 200 }, (range: LogicalRange | null) => {
    if (!range || untrack(isFetching)) return;
    const barsInfo = candleSeries?.barsInLogicalRange(range);
    if (barsInfo) {
      const firstTime = (+(candleSeries?.dataByIndex(0)?.time as Time) * 1000) as UTCTimestamp;
      const endTime = +(candleSeries?.data().at(-1)?.time as Time) * 1000;

      const wantedRange = getRangeFromBarsInfos(
        pick(barsInfo, ["barsAfter", "barsBefore"]),
        contract.onboardDate,
        resolution,
        multiplier,
        firstTime,
        findNearestCandleTime(
          new UTCDate(endTime),
          resolution,
          multiplier,
        ).getTime() as UTCTimestamp,
        shouldAllowFetchingFutureCandles(),
      );

      if (!wantedRange) return;

      candlesFetcher.postMessage({
        type: "fetch-candles",
        sender: chartId,
        data: { ticker, multiplier, resolution, ...wantedRange },
      } satisfies CandleWorkerRequest);
      dispatch(fetching({ timeFrame, sessionId, fetching: true }));
    }
  });

  onMount(() => {
    candleSeries = chart.addCandlestickSeries({
      upColor: "#4ADE80",
      downColor: "#7F1D1D",
      borderUpColor: "#4ADE80",
      borderDownColor: "#7F1D1D",
      wickUpColor: "#4ADE80",
      wickDownColor: "#7F1D1D",
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: contract.pricePrecision,
        minMove: contract.tickSize,
      },
    });

    setSeries(candleSeries);

    chart.timeScale().subscribeVisibleLogicalRangeChange(fetchUponScroll);

    candlesFetcher.postMessage({
      type: "fetch-candles",
      sender: chartId,
      data: {
        ticker,
        multiplier,
        resolution,
        ...getRangeFromSelectedTime(contract.onboardDate, resolution, multiplier, selectedTime()),
      },
    } satisfies CandleWorkerRequest);
    dispatch(fetching({ timeFrame, sessionId, fetching: true }));

    onCleanup(() => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(fetchUponScroll);
      if (candleSeries) chart.removeSeries(candleSeries);
    });
  });

  createEffect(() => {
    const theSeries = aSeries();
    if (actions().bollinger && theSeries) {
      BollingerBandsPrimitive(theSeries, sessionId, timeFrame);
    }
  });

  createEffect(() => {
    const theSeries = aSeries();
    if (actions().volatility && theSeries) {
      VolatilityCyclePrimitive(theSeries, sessionId, timeFrame);
    }
  });

  // Manage live analysis
  createEffect(
    on(currentCandle, (candle) => {
      const latestTime = (candleSeries?.data().at(-1)?.time as number) * 1000;
      const futureReached = isFutureReached(new UTCDate(latestTime), resolution, multiplier);

      if (candle?.closed && futureReached) {
        analyzers.postMessage({
          type: "analyze",
          sender: chartId,
          kind: "update",
          data: {
            candles: [unwrap(candle)],
            timeFrame,
            frequency: state.sessions.entities[sessionId].frequency as TradingFrequency,
            previousAnalysis: untrack(analysis),
          },
        } satisfies AnalyzerWorkerRequest);
      }
    }),
  );

  createEffect(
    on(selectedTime, (sTime) => {
      if (!initialized) return;

      candlesFetcher.postMessage({
        type: "fetch-candles",
        sender: chartId,
        data: {
          ticker,
          multiplier,
          resolution,
          ...getRangeFromSelectedTime(contract.onboardDate, resolution, multiplier, sTime),
        },
      } satisfies CandleWorkerRequest);
      dispatch(fetching({ timeFrame, sessionId, fetching: true }));
      setHasStTimeChanged(true);
    }),
  );

  createEffect(
    on(candles, (candles) => {
      if (candles.length === 0) return;

      setting(true);
      if (!selectedTime()) chart.timeScale().resetTimeScale();
      candleSeries?.setData(candles);
      nbOfLoadedSeries++;
      if (shouldMoveToTime()) {
        moveToTime(selectedTime() as UTCTimestamp, chart);
        setHasStTimeChanged(false);
      }
      setting(false);
      dispatch(fetching({ timeFrame, sessionId, fetching: false }));
      initialized = true;
    }),
  );

  createEffect(
    on(currentCandle, (candle) => {
      if (!candle || isSetting()) return;

      candleSeries?.update({
        time: (candle.time / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
    }),
  );

  createEffect(
    on(crossHair, (ch) => {
      if (!ch) return;

      const range = chart.timeScale().getVisibleRange();

      if (candleSeries && range && ch.sender !== timeFrame) {
        if (ch.time >= (range.from as number) && ch.time <= (range.to as number)) {
          chart.setCrosshairPosition(0, ch.time as Time, candleSeries);
        } else {
          chart.clearCrosshairPosition();
        }
      }
    }),
  );
};
