import {
  addNewCandle,
  setCandles,
  updateCurrentCandle,
  updateIndicators,
} from "@/libs/store/events";
import { getCandles, isBackTestSession, isSelectionEnabled } from "@/libs/store/selectors";
import type {
  AnalyzerWorkerRequest,
  AnalyzerWorkerResponse,
  CandleWorkerResponse,
  CandlesId,
  ContractTicker,
  CrossHair,
  TimeFrame,
  TradingFrequency,
} from "@/libs/types";
import { useStore } from "@/libs/utils";
import { isFutureReached } from "@/libs/utils";
import type { AnalyzerData } from "@/libs/utils/analyzer";
import { UTCDate } from "@date-fns/utc";
import { useColorMode } from "@kobalte/core";
import {
  ColorType,
  CrosshairMode,
  type IChartApi,
  LineStyle,
  type MouseEventHandler,
  type Time,
  createChart,
} from "lightweight-charts";
import {
  type Accessor,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { match } from "ts-pattern";
import { GraphLegend } from "./legend/graph-legend";
import { Replay } from "./mode/replay";
import { Candles } from "./series/candles";
import { Volumes } from "./series/volumes";

export const Chart = (props: {
  sessionId: string;
  timeFrame: TimeFrame;
  updateCrossHair?: (crossHair: CrossHair) => void;
  crossHair: Accessor<CrossHair | undefined>;
}) => {
  let chartContainer: HTMLDivElement | undefined;
  let chart: IChartApi | undefined;

  const { colorMode } = useColorMode();
  const {
    state,
    container: { candlesFetcher, exchangeFacade, analyzers },
    dispatch,
  } = useStore();

  const chartId = `${props.sessionId}-${props.timeFrame}`;
  const ticker = state.sessions.entities[props.sessionId].ticker as ContractTicker;
  const multiplier = state.sessions.entities[props.sessionId].charts[props.timeFrame].multiplier;
  const resolution = state.sessions.entities[props.sessionId].charts[props.timeFrame].resolution;
  const candlesId: CandlesId = `${ticker}-${multiplier}-${resolution}`;
  const candles = getCandles(state, props.sessionId, candlesId);

  const actions = () => state.sessions.entities[props.sessionId].charts[props.timeFrame].indicators;

  const isReplayMode = () => Boolean(isBackTestSession(state, props.sessionId));

  const isLiveFeed = () => {
    const latestTime = candles().at(-1)?.time;
    return latestTime ? isFutureReached(new UTCDate(latestTime), resolution, multiplier) : false;
  };

  const [theChart, setChart] = createSignal<IChartApi | undefined>(undefined);
  const [crossHairPosition, updateCrossHairPosition] = createSignal(0);
  const [focus, setFocus] = createSignal(false);
  const [analysis, setAnalysis] = createSignal<AnalyzerData | undefined>(undefined);

  const crossHairMoveHandler: MouseEventHandler<Time> = (event) => {
    if (!event.time) return;

    updateCrossHairPosition((event.time as number) * 1000);

    if (!untrack(focus) || !props.updateCrossHair) return;

    const ch = untrack(props.crossHair);

    if (!ch || event.time !== ch.time) {
      props.updateCrossHair({
        sender: untrack(() => props.timeFrame),
        time: event.time as number,
      });
    }
  };

  const handleCandleMessage = (event: MessageEvent<CandleWorkerResponse>) => {
    match(event.data)
      .with({ type: "candles-fetched" }, ({ sender, data: candles }) => {
        if (sender !== chartId) return;
        console.log("[Main Thread - Candle]", event);
        dispatch(setCandles({ candles, candlesId, sessionId: props.sessionId }));
      })
      .otherwise(() => {});
  };

  const handleAnalyzerMessage = (event: MessageEvent<AnalyzerWorkerResponse>) => {
    match(event.data)
      .with({ type: "analyzed" }, ({ sender, data, analysis, kind }) => {
        if (sender !== chartId) return;
        console.log("[Main Thread - Indicator] Event received", event);
        setAnalysis(analysis);
        dispatch(
          updateIndicators({
            sessionId: props.sessionId,
            timeFrame: props.timeFrame,
            data,
            kind,
          }),
        );
      })
      .otherwise(() => {});
  };

  onMount(() => {
    if (chartContainer) {
      chart = createChart(chartContainer, {
        autoSize: true,
        grid: {
          horzLines: { visible: false },
          vertLines: { visible: false },
        },
        timeScale: {
          secondsVisible: false,
        },
      });

      Candles(
        chart,
        props.timeFrame,
        props.sessionId,
        props.crossHair,
        chartId,
        isLiveFeed,
        analysis,
      );

      chart.subscribeCrosshairMove(crossHairMoveHandler);
      candlesFetcher.addEventListener("message", handleCandleMessage);
      analyzers.addEventListener("message", handleAnalyzerMessage);

      setChart(chart);

      onCleanup(() => {
        analyzers.removeEventListener("message", handleAnalyzerMessage);
        candlesFetcher.removeEventListener("message", handleCandleMessage);
        chart?.unsubscribeCrosshairMove(crossHairMoveHandler);
        chart?.remove();
      });
    }
  });

  createEffect(() => {
    const aChart = theChart();
    if (actions().volume && aChart) {
      Volumes(aChart, props.timeFrame, props.sessionId);
    }
  });

  // Handle Indicators data
  createEffect(
    on(candles, (candles) => {
      if (candles.length === 0) return;
      analyzers.postMessage({
        type: "analyze",
        sender: chartId,
        kind: "start",
        data: {
          candles: unwrap(candles),
          timeFrame: props.timeFrame,
          frequency: state.sessions.entities[props.sessionId].frequency as TradingFrequency,
        },
      } satisfies AnalyzerWorkerRequest);
    }),
  );

  // Handle Live mode
  createEffect(() => {
    if (!isLiveFeed() || isReplayMode()) return;

    exchangeFacade.livePrices(candlesId, chartId, (candle) => {
      dispatch(updateCurrentCandle({ candlesId, candle, sessionId: props.sessionId }));
      if (candle.closed) {
        dispatch(addNewCandle({ candlesId, candle, sessionId: props.sessionId }));
      }
    });

    onCleanup(() => exchangeFacade.closeLivePrices(candlesId, chartId));
  });

  // Handle Replay mode
  createEffect(() => {
    if (isReplayMode() && chart) {
      Replay(chartId, chart, props.sessionId, props.timeFrame);
    }
  });

  createEffect(() => {
    if (!chart) return;

    const textColor = colorMode() === "dark" ? "#1D283A" : "#0F172A";

    chart.applyOptions({
      rightPriceScale: { borderColor: textColor },
      timeScale: {
        borderColor: textColor,
        timeVisible: resolution === "m" || resolution === "H",
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        horzLine: {
          visible: isSelectionEnabled(state, props.sessionId),
          color: textColor,
          labelBackgroundColor: textColor,
        },
        vertLine: {
          color: isSelectionEnabled(state, props.sessionId) ? "#F35758" : textColor,
          width: isSelectionEnabled(state, props.sessionId) ? 3 : 1,
          style: isSelectionEnabled(state, props.sessionId)
            ? LineStyle.Solid
            : LineStyle.LargeDashed,
          labelBackgroundColor: textColor,
        },
      },
      layout: {
        textColor: textColor,
        background: { type: ColorType.Solid, color: "transparent" },
      },
    });
  });

  return (
    <div class="relative rounded w-full h-full border border-border overflow-hidden">
      <GraphLegend
        sessionId={props.sessionId}
        timeFrame={props.timeFrame}
        currentTime={crossHairPosition()}
      />
      <div
        ref={chartContainer}
        class="w-full h-full"
        onMouseEnter={() => setFocus(true)}
        onMouseLeave={() => setFocus(false)}
      />
    </div>
  );
};
