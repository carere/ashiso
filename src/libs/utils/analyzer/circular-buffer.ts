export type CircularBufferData<T> = {
  maxIndex: number;
  buffer: Array<T>;
  pointer: number;
  filled: boolean;
};

/**
 * Circular buffers (also known as ring buffers) are fixed-size buffers that work as if the memory is contiguous & circular in nature.
 * As memory is generated and consumed, data does not need to be reshuffled – rather, the head/tail pointers are adjusted.
 * When data is added, the head pointer advances. When data is consumed, the tail pointer advances.
 * If you reach the end of the buffer, the pointers simply wrap around to the beginning.
 */
export class CircularBuffer<T = number> {
  public filled = false;
  protected pointer = 0;
  protected buffer: Array<T>;
  protected maxIndex: number;

  /**
   * Constructor
   * @param length fixed buffer length
   */
  constructor(
    public length: number,
    data?: CircularBufferData<T>,
  ) {
    if (data) {
      this.buffer = data.buffer;
      this.pointer = data.pointer;
      this.maxIndex = data.maxIndex;
      this.filled = data.filled;
    } else {
      this.buffer = new Array(length);
      this.maxIndex = length - 1;
    }
  }

  /**
   * Push item to buffer, when buffer length is overflow, push will rewrite oldest item
   */
  public push(item: T) {
    const overwritten = this.buffer[this.pointer];

    this.buffer[this.pointer] = item;
    this.iteratorNext();

    return overwritten;
  }

  /**
   * Replace last added item in buffer (reversal push). May be used for revert push removed item.
   * @deprecated use peek instead
   */
  public pushBack(item: T) {
    this.iteratorPrev();
    const overwritten = this.buffer[this.pointer];
    this.buffer[this.pointer] = item;

    return overwritten;
  }

  /**
   * Get item for replacing, does not modify anything
   */
  public peek() {
    return this.buffer[this.pointer];
  }

  /**
   * Get last item inserted, does not modify anything
   */
  public revPeek() {
    const virtualPointer = this.pointer - 1 < 0 ? this.maxIndex : this.pointer - 1;
    return this.buffer[virtualPointer];
  }

  /**
   * Array like forEach loop
   */
  public forEach(callback: (value: T, index?: number) => void) {
    let idx = this.pointer;
    let virtualIdx = 0;

    while (virtualIdx !== this.length) {
      callback(this.buffer[idx], virtualIdx);
      idx = (this.length + idx + 1) % this.length;
      virtualIdx++;
    }
  }

  /**
   * Export data from CircularBuffer
   */
  public export() {
    return {
      maxIndex: this.maxIndex,
      buffer: this.buffer,
      pointer: this.pointer,
      filled: this.filled,
    };
  }

  /**
   * Get array from buffer
   */
  public toArray() {
    return this.buffer;
  }

  /**
   * Move iterator to next position
   */
  private iteratorNext() {
    this.pointer++;

    if (this.pointer > this.maxIndex) {
      this.pointer = 0;
      this.filled = true;
    }
  }

  /**
   * Move iterator to prev position
   */
  private iteratorPrev() {
    this.pointer--;

    if (this.pointer < 0) {
      this.pointer = this.maxIndex;
    }
  }
}

/**
 * Pick the lowest value (number) in a buffer
 *
 * @param vol the buffer to search within
 * @returns the lowest value in the buffer
 */
export const pickLowestInBuffer = (vol: CircularBuffer) =>
  vol.toArray().reduce((acc, curr) => (curr <= acc ? curr : acc), Number.POSITIVE_INFINITY);

/**
 * Pick the highest value (number) in a buffer
 *
 * @param vol  the buffer to search within
 * @returns the highest value in the buffer
 */
export const pickHighestInBuffer = (vol: CircularBuffer) =>
  vol.toArray().reduce((acc, curr) => (curr >= acc ? curr : acc), Number.NEGATIVE_INFINITY);
