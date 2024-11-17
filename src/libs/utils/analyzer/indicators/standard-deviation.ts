import { CircularBuffer, type CircularBufferData } from "../circular-buffer";

export type StandardDeviationData = {
  values: CircularBufferData<number>;
};

export class StandardDeviation {
  private values: CircularBuffer;

  constructor(
    private period: number,
    data?: StandardDeviationData,
  ) {
    if (data) {
      this.values = new CircularBuffer(period, data.values);
    } else {
      this.values = new CircularBuffer(period);
    }
  }

  export(): StandardDeviationData {
    return {
      values: this.values.export(),
    };
  }

  nextValue(value: number, mean: number) {
    this.values.push(value);

    return Math.sqrt(
      this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period,
    );
  }

  momentValue(value: number, mean: number) {
    const rm = this.values.push(value);

    const result = Math.sqrt(
      this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period,
    );

    this.values.pushBack(rm);

    return result;
  }
}
