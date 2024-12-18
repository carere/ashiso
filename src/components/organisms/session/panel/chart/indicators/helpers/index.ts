import type { CandlestickData } from "lightweight-charts";

export interface BitmapPositionLength {
  /** coordinate for use with a bitmap rendering scope */
  position: number;
  /** length for use with a bitmap rendering scope */
  length: number;
}

export function drawSegment(
  ctx: CanvasRenderingContext2D,
  color: string,
  coordinates: [number, number][],
  style: "solid" | "dashed" = "solid",
  width = 1,
) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.setLineDash(style === "dashed" ? [5, 5] : []);
  ctx.lineWidth = width;
  const line = new Path2D();
  for (let i = 0; i < coordinates.length; i++) {
    const [x, y] = coordinates[i];
    if (i === 0) line.moveTo(x, y);
    else line.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke(line);
}

/**
 * Determines the bitmap position and length for a dimension of a shape to be drawn.
 * @param position1Media - media coordinate for the first point
 * @param position2Media - media coordinate for the second point
 * @param pixelRatio - pixel ratio for the corresponding axis (vertical or horizontal)
 * @returns Position of of the start point and length dimension.
 */
export function positionsBox(
  position1Media: number,
  position2Media: number,
  pixelRatio: number,
): BitmapPositionLength {
  const scaledPosition1 = Math.round(pixelRatio * position1Media);
  const scaledPosition2 = Math.round(pixelRatio * position2Media);
  return {
    position: Math.min(scaledPosition1, scaledPosition2),
    length: Math.abs(scaledPosition2 - scaledPosition1) + 1,
  };
}

/**
 * Calculates the bitmap position for an item with a desired length (height or width), and centred according to
 * an position coordinate defined in media sizing.
 * @param positionMedia - position coordinate for the bar (in media coordinates)
 * @param pixelRatio - pixel ratio. Either horizontal for x positions, or vertical for y positions
 * @param desiredWidthMedia - desired width (in media coordinates)
 * @returns Position of of the start point and length dimension.
 */
export function positionsLine(
  positionMedia: number,
  pixelRatio: number,
  desiredWidthMedia = 1,
  widthIsBitmap?: boolean,
): BitmapPositionLength {
  const scaledPosition = Math.round(pixelRatio * positionMedia);
  const lineBitmapWidth = widthIsBitmap
    ? desiredWidthMedia
    : Math.round(desiredWidthMedia * pixelRatio);
  const offset = Math.floor(lineBitmapWidth * 0.5);
  const position = scaledPosition - offset;
  return { position, length: lineBitmapWidth };
}

export const getLowestAndHighestInRange = (candle: CandlestickData[]) => {
  let lowest = Number.POSITIVE_INFINITY;
  let highest = Number.NEGATIVE_INFINITY;
  for (const c of candle) {
    if (c.low < lowest) lowest = c.low;
    if (c.high > highest) highest = c.high;
  }
  return { lowest, highest };
};
