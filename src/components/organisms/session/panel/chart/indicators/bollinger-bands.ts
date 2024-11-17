import type { BollingerBandData } from "@/libs/types";
import { fromMsToSeconds } from "@/libs/utils/graph";
import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import { select } from "radash";
import { drawSegment } from "./helpers";

type Sequence = { direction: "up" | "down"; sequences: [number, number][] };

function getSequences(data: BollingerBandData[], kind: "upper" | "lower"): Sequence[] {
  const sequences: Sequence[] = [];
  let currentDirection: "up" | "down" = "up";
  let currentSequence: [number, number][] = [[data[0].time, data[0][kind]]];

  for (let i = 1; i < data.length; i++) {
    const currentData = data[i];
    const previousData = data[i - 1];

    if (currentData[kind] >= previousData[kind]) {
      if (currentDirection === "down") {
        sequences.push({ direction: "down", sequences: currentSequence });
        currentSequence = [[previousData.time, previousData[kind]]];
        currentDirection = "up";
      }
      currentSequence.push([currentData.time, currentData[kind]]);
    } else if (currentData[kind] < previousData[kind]) {
      if (currentDirection === "up") {
        sequences.push({ direction: "up", sequences: currentSequence });
        currentSequence = [[previousData.time, previousData[kind]]];
        currentDirection = "down";
      }
      currentSequence.push([currentData.time, currentData[kind]]);
    }
  }

  sequences.push({ direction: currentDirection, sequences: currentSequence });

  return sequences;
}

class BandsIndicatorPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _source: BollingerBandsIndicatorPaneView;

  constructor(source: BollingerBandsIndicatorPaneView) {
    this._source = source;
  }

  draw() {}

  drawBackground(target: CanvasRenderingTarget2D) {
    const points = this._source._data;
    if (this._source._data.length === 0) return;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio);

      drawSegment(
        ctx,
        this._source._source._visible ? "#4CAF50" : "transparent",
        points.map((p) => [p.time, p.middle]),
      );
      this.drawLine(ctx, "upper");
      this.drawLine(ctx, "lower");

      ctx.restore();
    });
  }

  drawLine(ctx: CanvasRenderingContext2D, kind: keyof Pick<BollingerBandData, "lower" | "upper">) {
    const blue = this._source._source._visible ? "#2196F3" : "transparent";
    const red = this._source._source._visible ? "#F55253" : "transparent";

    for (const { direction, sequences } of getSequences(this._source._data, kind)) {
      const color = direction === "up" ? red : blue;
      drawSegment(ctx, color, sequences);
    }
  }
}

class BollingerBandsIndicatorPaneView implements ISeriesPrimitivePaneView {
  _source: BollingerBandsIndicator;
  _data: BollingerBandData[] = [];

  constructor(source: BollingerBandsIndicator) {
    this._source = source;
  }

  update() {
    const series = this._source._series;
    const timeScale = this._source._chart?.timeScale();
    if (!series || !timeScale) return;
    const range = timeScale.getVisibleRange();
    if (range === null) return;

    this._data = select(
      this._source._bollingerBandsData,
      (b) => ({
        time: (timeScale.timeToCoordinate(fromMsToSeconds(b.time) as Time) ?? -100) as UTCTimestamp,
        middle: series.priceToCoordinate(b.middle) ?? -100,
        upper: series.priceToCoordinate(b.upper) ?? -100,
        lower: series.priceToCoordinate(b.lower) ?? -100,
      }),
      (b) =>
        fromMsToSeconds(b.time) >= (range.from as number) &&
        fromMsToSeconds(b.time) <= (range.to as number),
    );
  }

  renderer() {
    return new BandsIndicatorPaneRenderer(this);
  }
}

export class BollingerBandsIndicator implements ISeriesPrimitive<Time> {
  _paneViews: BollingerBandsIndicatorPaneView[];
  _bollingerBandsData: BollingerBandData[] = [];
  _series: ISeriesApi<"Candlestick"> | undefined;
  _chart: IChartApi | undefined;
  _visible = false;
  _requestUpdate = () => {};

  constructor() {
    this._paneViews = [new BollingerBandsIndicatorPaneView(this)];
  }

  updateAllViews() {
    for (const pw of this._paneViews) {
      pw.update();
    }
  }

  paneViews() {
    return this._paneViews;
  }

  attached({ series, chart, requestUpdate }: SeriesAttachedParameter<Time>) {
    this._series = series as ISeriesApi<"Candlestick">;
    this._chart = chart;
    this._requestUpdate = requestUpdate;
  }

  setVisible(visible: boolean) {
    this._visible = visible;
    this._requestUpdate();
  }

  setData(data: BollingerBandData[]) {
    this._bollingerBandsData = data;
  }
}
