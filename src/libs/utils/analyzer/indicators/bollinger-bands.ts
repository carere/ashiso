import { SmallMovingAverage, type SmallMovingAverageData } from "./small-moving-average";
import { StandardDeviation, type StandardDeviationData } from "./standard-deviation";

export type BollingerBandExportData = {
  sd: StandardDeviationData;
  sma: SmallMovingAverageData;
};

export class BollingerBands {
  private sd: StandardDeviation;
  private sma: SmallMovingAverage;

  constructor(
    period = 20,
    private stdDev = 2,
    data?: BollingerBandExportData,
  ) {
    if (data) {
      this.sd = new StandardDeviation(period, data.sd);
      this.sma = new SmallMovingAverage(period, data.sma);
    } else {
      this.sd = new StandardDeviation(period);
      this.sma = new SmallMovingAverage(period);
    }
  }

  export(): BollingerBandExportData {
    return {
      sd: this.sd.export(),
      sma: this.sma.export(),
    };
  }

  nextValue(close: number) {
    const middle = this.sma.nextValue(close);
    const sd = middle && this.sd.nextValue(close, middle);

    if (middle === undefined || sd === undefined) return;

    const lower = middle - this.stdDev * sd;
    const upper = middle + this.stdDev * sd;

    this.nextValue = (close: number) => {
      const middle = this.sma.nextValue(close) as number;
      const sd = this.sd.nextValue(close, middle);
      const lower = middle - this.stdDev * sd;
      const upper = middle + this.stdDev * sd;

      return { lower, middle, upper, sd };
    };

    return { lower, middle, upper, sd };
  }

  momentValue(close: number) {
    const middle = this.sma.momentValue(close);
    const sd = this.sd.momentValue(close, middle);
    const lower = middle - this.stdDev * sd;
    const upper = middle + this.stdDev * sd;

    return { lower, middle, upper };
  }
}
