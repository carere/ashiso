import {
  fetching,
  initBackTest,
  stopBackTest,
  updateBackTestCurrentTime,
  updateCurrentCandle,
} from "@/libs/store/events";
import {
  getCandles,
  getLowestTimeFrame,
  isBackTestRunning,
  isSelectionEnabled,
} from "@/libs/store/selectors";
import type {
  BackTest,
  CandleWorkerRequest,
  CandlesId,
  ContractTicker,
  TimeFrame,
  UTCTimestamp,
} from "@/libs/types";
import { useStore } from "@/libs/utils";
import { addResolution, isFutureReached } from "@/libs/utils";
import { getFutureRangeForReplay } from "@/libs/utils/graph";
import { UTCDate } from "@date-fns/utc";
import { createTimer } from "@solid-primitives/timer";
import type { IChartApi, MouseEventHandler, Time } from "lightweight-charts";
import { createEffect, on, onCleanup, onMount, untrack } from "solid-js";
import { match } from "ts-pattern";

export const Replay = (
  chartId: string,
  chart: IChartApi,
  sessionId: string,
  timeFrame: TimeFrame,
) => {
  const {
    state,
    dispatch,
    container: { candlesFetcher },
  } = useStore();

  const ticker = state.sessions.entities[sessionId].ticker as ContractTicker;
  const multiplier = state.sessions.entities[sessionId].charts[timeFrame].multiplier;
  const resolution = state.sessions.entities[sessionId].charts[timeFrame].resolution;
  const candlesId = `${ticker}-${multiplier}-${resolution}` as CandlesId;
  const backTest = state.sessions.entities[sessionId].backTest as BackTest;
  const add = addResolution(resolution);
  const currentTime = () => backTest.currentTime;
  const startTime = () => state.sessions.entities[sessionId].selectedTime;
  const candles = getCandles(state, sessionId, candlesId);

  const running = () => isBackTestRunning(state, sessionId);
  const speed = () =>
    match(backTest.speed)
      .with("0.1", () => 10000)
      .with("0.3", () => 3333)
      .with("0.5", () => 2000)
      .with("1", () => 1000)
      .with("3", () => 333)
      .with("10", () => 100)
      .exhaustive();

  const startSelectionHandler: MouseEventHandler<Time> = (event) => {
    const selectionEnabled = untrack(() => isSelectionEnabled(state, sessionId));

    if (!selectionEnabled || !event.time) return;

    dispatch(
      initBackTest({
        sessionId,
        startTime: ((event.time as number) * 1000) as UTCTimestamp,
      }),
    );
  };

  onMount(() => {
    chart.subscribeClick(startSelectionHandler);

    onCleanup(() => {
      chart.unsubscribeClick(startSelectionHandler);
    });
  });

  // Manage speed and play / pause for replay mode
  if (getLowestTimeFrame(state, sessionId) === `${multiplier}-${resolution}`) {
    const callback = () => {
      const time = untrack(currentTime) || untrack(startTime);
      if (!time) return;
      dispatch(
        updateBackTestCurrentTime({
          id: sessionId,
          time: add(new UTCDate(time), multiplier).getTime(),
        }),
      );
    };

    createTimer(callback, () => running() && speed(), setInterval);

    // Stop replay if we reached the present day
    createEffect(() => {
      const time = currentTime();
      if (!time) return;
      if (isFutureReached(new UTCDate(time), resolution, multiplier)) {
        dispatch(stopBackTest(sessionId));
      }
    });
  }

  // update current candle with current replay time
  createEffect(
    on(currentTime, (time) => {
      if (!time || !state.sessions.entities[sessionId].candles[candlesId]) {
        return;
      }
      const candle = state.sessions.entities[sessionId].candles[candlesId].entities[time];
      if (candle) {
        dispatch(updateCurrentCandle({ sessionId, candlesId, candle }));
      }
    }),
  );

  // We fetch candles if we have less than 750 candles left during replay
  createEffect(
    on(currentTime, (time) => {
      const range = getFutureRangeForReplay(
        candles().at(-1)?.time as UTCTimestamp,
        time as UTCTimestamp,
        resolution,
        multiplier,
      );
      if (!range) return;

      console.log("Fetch because of Current Time change");

      candlesFetcher.postMessage({
        type: "fetch-candles",
        sender: chartId,
        data: {
          ticker,
          multiplier,
          resolution,
          ...range,
        },
      } satisfies CandleWorkerRequest);
      dispatch(fetching({ timeFrame, sessionId, fetching: true }));
    }),
  );
};
