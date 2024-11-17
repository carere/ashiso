import { CircularBuffer, type CircularBufferData } from "../circular-buffer";

export type SmallMovingAverageData = {
  circular: CircularBufferData<number>;
  sum: number;
};

/**
 * Simple Moving Average
 *
 * console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
 * => [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
 * =>   │       │       │       │       │       └─(6+7+8+9)/4
 * =>   │       │       │       │       └─(5+6+7+8)/4
 * =>   │       │       │       └─(4+5+6+7)/4
 * =>   │       │       └─(3+4+5+6)/4
 * =>   │       └─(2+3+4+5)/4
 * =>   └─(1+2+3+4)/4
 */
export class SmallMovingAverage {
  private circular: CircularBuffer;
  private sum = 0;

  constructor(
    private period: number,
    data?: SmallMovingAverageData,
  ) {
    if (data) {
      this.circular = new CircularBuffer(period, data.circular);
      this.sum = data.sum;
      this.nextValue = (value: number) => {
        this.sum = this.sum - this.circular.push(value) + value;
        return this.sum / this.period;
      };
      this.momentValue = (value: number) => {
        return (this.sum - this.circular.peek() + value) / this.period;
      };
    } else {
      this.circular = new CircularBuffer(period);
    }
  }

  export(): SmallMovingAverageData {
    return {
      circular: this.circular.export(),
      sum: this.sum,
    };
  }

  nextValue(value: number) {
    this.circular.push(value);
    this.sum += value;

    if (!this.circular.filled) {
      return;
    }

    this.nextValue = (value: number) => {
      this.sum = this.sum - this.circular.push(value) + value;

      return this.sum / this.period;
    };

    this.momentValue = (value: number) => {
      return (this.sum - this.circular.peek() + value) / this.period;
    };

    return this.sum / this.period;
  }

  momentValue(_: number): number {
    throw new Error(
      "You called momentValue before the first value was calculated. Please call nextValue first.",
    );
  }
}
