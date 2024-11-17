import type { BollingerBandData, SimpleCandle } from "@/libs/types";
import { sort } from "radash";
import { match } from "ts-pattern";
import { nz } from "../..";
import {
  CircularBuffer,
  type CircularBufferData,
  pickHighestInBuffer,
  pickLowestInBuffer,
} from "../circular-buffer";
import { type BollingerBandExportData, BollingerBands } from "./bollinger-bands";

type Phase = BollingerBandData["phase"];
type BBResult = Omit<BollingerBandData, "phase" | "volatility">;

const sortBbResult = (results: BBResult[]) => sort(results, (r) => r.time);

const findFirstPhase = (volatility: number): Phase | undefined =>
  volatility < 0.2 ? 1 : undefined;

const findSecondPhase = (bbData: BBResult[]): Phase | undefined => {
  const [previous, current] = bbData;

  const bandsAreMovingInOppositeDirection =
    current.upper >= previous.upper && current.lower <= previous.lower;

  return bandsAreMovingInOppositeDirection ? 2 : undefined;
};

const findThirdPhase = (bbData: BBResult[]): Phase | undefined => {
  const [previous, current] = bbData;

  const bandsAreMovingTogether =
    (current.upper >= previous.upper && current.lower >= previous.lower) ||
    (current.upper <= previous.upper && current.lower <= previous.lower);

  return bandsAreMovingTogether ? 3 : undefined;
};

const findFourthPhase = (bbData: BBResult[]): Phase | undefined => {
  const [previous, current] = bbData;

  const bandsAreClosing = current.upper < previous.upper && current.lower > previous.lower;

  return bandsAreClosing ? 4 : undefined;
};

const findAPhase = (bbData: BBResult[], volatility: number) =>
  findFirstPhase(volatility) ||
  findSecondPhase(bbData) ||
  findThirdPhase(bbData) ||
  findFourthPhase(bbData);

export type BollingerBandsInfoData = {
  bbCalculator: BollingerBandExportData;
  bbResults: CircularBufferData<BBResult>;
  bbwResults: CircularBufferData<number>;
  lastDelta: number | undefined;
  lastPhase: BollingerBandData["phase"] | undefined;
};

export class BollingerBandsInfo {
  private bbCalculator: BollingerBands;
  private bbResults: CircularBuffer<BBResult>;
  private bbwResults: CircularBuffer<number>;
  private lastDelta: number | undefined;
  private lastPhase: BollingerBandData["phase"] | undefined;

  constructor(period: number, data?: BollingerBandsInfoData) {
    if (data) {
      this.bbCalculator = new BollingerBands(period, 2, data.bbCalculator);
      this.bbwResults = new CircularBuffer(period, data.bbwResults);
      this.bbResults = new CircularBuffer(2, data.bbResults);
      this.lastDelta = data.lastDelta;
      this.lastPhase = data.lastPhase;
    } else {
      this.bbCalculator = new BollingerBands(period);
      this.bbwResults = new CircularBuffer(period);
      this.bbResults = new CircularBuffer(2);
    }
  }

  private processVolatilityCycle(bbResult: Omit<BBResult, "time">) {
    let volatility: number | undefined;

    const bbw = (bbResult.upper - bbResult.lower) / bbResult.middle;
    this.bbwResults.push(bbw);
    const lbbw = nz(pickLowestInBuffer(this.bbwResults));
    const hbbw = nz(pickHighestInBuffer(this.bbwResults));
    const d = nz((bbw - hbbw) / (hbbw - lbbw));

    if (this.lastDelta !== undefined) {
      volatility = nz((this.lastDelta + d) / 2.0) + 1.0;
    }

    this.lastDelta = d;

    return volatility;
  }

  private processBollingerPhase(volatility: number | undefined) {
    let phase: BollingerBandData["phase"] | undefined;
    if (this.bbResults.filled && volatility !== undefined) {
      const sortedBbResults = sortBbResult(this.bbResults.toArray());

      phase = match(this.lastPhase)
        .with(1, () => findSecondPhase(sortedBbResults) || this.lastPhase)
        .with(2, () => findThirdPhase(sortedBbResults) || this.lastPhase)
        .with(
          3,
          () =>
            findFourthPhase(sortedBbResults) || findSecondPhase(sortedBbResults) || this.lastPhase,
        )
        .with(
          4,
          () =>
            findFirstPhase(volatility) ||
            findSecondPhase(sortedBbResults) ||
            findThirdPhase(sortedBbResults) ||
            this.lastPhase,
        )
        .with(undefined, () => findAPhase(sortedBbResults, volatility))
        .exhaustive();

      this.lastPhase = phase;
    }
    return phase;
  }

  public export(): BollingerBandsInfoData {
    return {
      bbCalculator: this.bbCalculator.export(),
      bbResults: this.bbResults.export(),
      bbwResults: this.bbwResults.export(),
      lastDelta: this.lastDelta,
      lastPhase: this.lastPhase,
    };
  }

  public nextValue(candle: SimpleCandle) {
    const bbResult = this.bbCalculator.nextValue(candle.close);

    if (bbResult) {
      this.bbResults.push({ ...bbResult, time: candle.time });
      const volatility = this.processVolatilityCycle(bbResult);
      const phase = this.processBollingerPhase(volatility);

      return {
        time: candle.time,
        upper: bbResult.upper,
        middle: bbResult.middle,
        lower: bbResult.lower,
        volatility,
        phase,
      } as BollingerBandData;
    }
  }
}
