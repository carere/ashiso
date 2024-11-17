import type { Candle } from "@/libs/types";
import { SmallMovingAverage, type SmallMovingAverageData } from "./small-moving-average";

export type VolumeMovingAverageData = {
  sma: SmallMovingAverageData;
};

export class VolumeMovingAverage {
  private sma: SmallMovingAverage;

  constructor(period: number, data?: VolumeMovingAverageData) {
    if (data) {
      this.sma = new SmallMovingAverage(period, data.sma);
    } else {
      this.sma = new SmallMovingAverage(period);
    }
  }

  export(): VolumeMovingAverageData {
    return {
      sma: this.sma.export(),
    };
  }

  nextValue(candle: Candle) {
    const ma = this.sma.nextValue(candle.volume) as number | undefined;
    return ma ? { time: candle.time, value: ma } : undefined;
  }

  momentValue(candle: Candle) {
    const ma = this.sma.momentValue(candle.volume) as number | undefined;
    return ma ? { time: candle.time, value: ma } : undefined;
  }
}
