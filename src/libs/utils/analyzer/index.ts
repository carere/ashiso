import type { Candle } from "@/libs/types.js";
import { BollingerBandsInfo, type BollingerBandsInfoData } from "./indicators/bollinger-bands-info";
import {
  VolumeMovingAverage,
  type VolumeMovingAverageData,
} from "./indicators/volume-moving-average";

export type AnalyzerData = {
  indicators: {
    bbInfos: BollingerBandsInfoData;
    vma: VolumeMovingAverageData;
  };
};

export class Analyzer {
  private indicators: {
    bbInfos: BollingerBandsInfo;
    vma: VolumeMovingAverage;
  };

  constructor(period: number, data?: AnalyzerData) {
    this.indicators = {
      bbInfos: new BollingerBandsInfo(period, data?.indicators.bbInfos),
      vma: new VolumeMovingAverage(200, data?.indicators.vma),
    };
  }

  export(): AnalyzerData {
    return {
      indicators: {
        bbInfos: this.indicators.bbInfos.export(),
        vma: this.indicators.vma.export(),
      },
    };
  }

  analyze(candle: Candle) {
    return {
      bbInfos: this.indicators.bbInfos.nextValue(candle),
      vma: this.indicators.vma.nextValue(candle),
    };
  }
}

export type AnalyzerResult = ReturnType<Analyzer["analyze"]>;
