import type { VolumeMA } from "@/libs/types";
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

class VolumeMAPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _source: VolumeMAIndicatorPaneView;

  constructor(source: VolumeMAIndicatorPaneView) {
    this._source = source;
  }

  draw(target: CanvasRenderingTarget2D) {
    if (!this._source._source._visible) return;

    const points = this._source._data;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio);

      drawSegment(
        ctx,
        "#f97316",
        points.map((p) => [p.time, p.value]),
        "solid",
        2,
      );

      ctx.restore();
    });
  }
}

class VolumeMAIndicatorPaneView implements ISeriesPrimitivePaneView {
  _source: VolumeMAIndicator;
  _data: VolumeMA[];

  constructor(source: VolumeMAIndicator) {
    this._source = source;
    this._data = [];
  }

  update() {
    const series = this._source._series;
    const timeScale = this._source._chart?.timeScale();
    if (!series || !timeScale) return;
    const range = timeScale.getVisibleRange();
    if (range === null) return;

    this._data = select(
      this._source._volumeMAVolumeMAData,
      (vma) => ({
        time: (timeScale.timeToCoordinate(fromMsToSeconds(vma.time) as Time) ??
          -100) as UTCTimestamp,
        value: series.priceToCoordinate(vma.value) ?? -100,
      }),
      (vma) =>
        fromMsToSeconds(vma.time) >= (range.from as number) &&
        fromMsToSeconds(vma.time) <= (range.to as number),
    );
  }

  renderer() {
    return new VolumeMAPaneRenderer(this);
  }
}

export class VolumeMAIndicator implements ISeriesPrimitive<Time> {
  _paneViews: VolumeMAIndicatorPaneView[];
  _volumeMAVolumeMAData: VolumeMA[] = [];
  _series: ISeriesApi<"Candlestick"> | undefined;
  _chart: IChartApi | undefined;
  _visible = true;

  constructor() {
    this._paneViews = [new VolumeMAIndicatorPaneView(this)];
  }

  setData(data: VolumeMA[]) {
    this._volumeMAVolumeMAData = data;
  }

  updateAllViews() {
    for (const pw of this._paneViews) {
      pw.update();
    }
  }

  paneViews() {
    return this._paneViews;
  }

  attached({ series, chart }: SeriesAttachedParameter<Time>) {
    this._series = series as ISeriesApi<"Candlestick">;
    this._chart = chart;
  }
}
