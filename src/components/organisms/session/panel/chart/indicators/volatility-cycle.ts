import type { Volatility } from "@/libs/types";
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

const PANE_HEIGHT_USED_PCT = 0.1;

class VolatilityCyclePaneRenderer implements ISeriesPrimitivePaneRenderer {
  _source: VolatilityCycleIndicatorPaneView;

  constructor(source: VolatilityCycleIndicatorPaneView) {
    this._source = source;
  }

  draw() {}

  drawBackground(target: CanvasRenderingTarget2D) {
    if (!this._source._source._visible) return;

    const points = this._source._data;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio);

      // Volatility Cycle upper line (0.8)
      drawSegment(
        ctx,
        this._source._source._visible ? "#787B86" : "transparent",
        this._source._upperLine,
        "dashed",
      );

      // Volatility Cycle line
      drawSegment(
        ctx,
        this._source._source._visible ? "#00897B" : "transparent",
        points.map((p) => [p.time as number, +(p.volatility as number).toFixed(3)]),
      );

      //Volatility Cycle lower line (0.2)
      drawSegment(
        ctx,
        this._source._source._visible ? "#787B86" : "transparent",
        this._source._lowerLine,
        "dashed",
      );

      ctx.restore();
    });
  }
}

class VolatilityCycleIndicatorPaneView implements ISeriesPrimitivePaneView {
  _source: VolatilityCycleIndicator;
  _data: Volatility[];
  _upperLine: [number, number][] = [];
  _lowerLine: [number, number][] = [];

  constructor(source: VolatilityCycleIndicator) {
    this._source = source;
    this._data = [];
  }

  update() {
    const series = this._source._series;
    const timeScale = this._source._chart?.timeScale();
    const paneSize = this._source._chart?.paneSize();
    if (!series || !timeScale || !paneSize) return;
    const range = timeScale.getVisibleRange();
    if (range === null) return;

    const paneHeight = Math.round(paneSize.height * PANE_HEIGHT_USED_PCT);
    const yUpperLine = paneSize.height - paneHeight * 0.8;
    const yLowerLine = paneSize.height - paneHeight * 0.2;

    this._upperLine = [
      [0, yUpperLine],
      [paneSize.width, yUpperLine],
    ];

    this._lowerLine = [
      [0, yLowerLine],
      [paneSize.width, yLowerLine],
    ];

    this._data = select(
      this._source._volatilityCycleData,
      (v) => ({
        time: (timeScale.timeToCoordinate(fromMsToSeconds(v.time) as Time) ?? -100) as UTCTimestamp,
        volatility: paneSize.height - paneHeight * (v.volatility as number),
      }),
      (v) =>
        fromMsToSeconds(v.time) >= (range.from as number) &&
        fromMsToSeconds(v.time) <= (range.to as number),
    );
  }

  renderer() {
    return new VolatilityCyclePaneRenderer(this);
  }
}

export class VolatilityCycleIndicator implements ISeriesPrimitive<Time> {
  _paneViews: VolatilityCycleIndicatorPaneView[];
  _volatilityCycleData: Volatility[] = [];
  _series: ISeriesApi<"Candlestick"> | undefined;
  _chart: IChartApi | undefined;
  _visible = false;
  _requestUpdate = () => {};

  constructor() {
    this._paneViews = [new VolatilityCycleIndicatorPaneView(this)];
  }

  setData(data: Volatility[]) {
    this._volatilityCycleData = data;
  }

  setVisible(visible: boolean) {
    this._visible = visible;
    this._requestUpdate();
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
}
