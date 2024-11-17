import { UTCDate } from "@date-fns/utc";
import type { IChartApi, Time } from "lightweight-charts";
import {
  addResolution,
  diffResolution,
  findNearestCandleTime,
  isFutureReached,
  subResolution,
} from ".";
import type { FetchResolution, Range, UTCTimestamp } from "../types";

/**
 * Convert time in milliseconds to seconds
 *
 * @param time time in milliseconds
 * @returns Time in seconds
 */
export const fromMsToSeconds = (time: number) => time / 1000;

/**
 * Generate a range from the selected time
 *
 * @param onBoardDate The onBoardDate
 * @param resolution The resolution
 * @param multiplier The multiplier
 * @param selectedTime The selected time
 * @returns The range or undefined if not found
 */
export const getRangeFromSelectedTime = (
  onBoardDate: UTCTimestamp,
  resolution: FetchResolution,
  multiplier: number,
  selectedTime?: UTCTimestamp,
  now: () => UTCDate = () => new UTCDate(),
): Range => {
  const add = addResolution(resolution);
  const sub = subResolution(resolution);
  const diff = diffResolution(resolution);
  const nowTime = findNearestCandleTime(now(), resolution, multiplier);
  const nearestOnboardDate = findNearestCandleTime(
    new UTCDate(onBoardDate),
    resolution,
    multiplier,
  );

  if (selectedTime === undefined) {
    const start = sub(nowTime, multiplier * 3000).getTime() as UTCTimestamp;

    return {
      from:
        start <= nearestOnboardDate.getTime()
          ? (nearestOnboardDate.getTime() as UTCTimestamp)
          : start,
      to: nowTime.getTime() as UTCTimestamp,
    };
  }

  const currTime = findNearestCandleTime(new UTCDate(selectedTime), resolution, multiplier);

  if (currTime.getTime() === nowTime.getTime()) {
    const start = sub(nowTime, multiplier * 3000).getTime() as UTCTimestamp;

    return {
      from:
        start <= nearestOnboardDate.getTime()
          ? (nearestOnboardDate.getTime() as UTCTimestamp)
          : start,
      to: nowTime.getTime() as UTCTimestamp,
    };
  }

  if (currTime.getTime() <= nearestOnboardDate.getTime()) {
    const end = add(nearestOnboardDate, multiplier * 3000).getTime() as UTCTimestamp;

    return {
      from: nearestOnboardDate.getTime() as UTCTimestamp,
      to: (end >= nowTime.getTime() ? nowTime.getTime() : end) as UTCTimestamp,
    };
  }

  const candlesBeforeNow = Math.abs(diff(currTime, nowTime)) / multiplier;
  const candlesBeforeOnBoardDate = Math.abs(diff(currTime, nearestOnboardDate)) / multiplier;

  if (candlesBeforeNow < 1500 && candlesBeforeOnBoardDate < 1500) {
    return {
      from: nearestOnboardDate.getTime() as UTCTimestamp,
      to: nowTime.getTime() as UTCTimestamp,
    };
  }

  if (candlesBeforeNow < 750) {
    const newFrom = sub(nowTime, 3000 * multiplier);

    return {
      from: (newFrom <= nearestOnboardDate
        ? nearestOnboardDate.getTime()
        : newFrom.getTime()) as UTCTimestamp,
      to: nowTime.getTime() as UTCTimestamp,
    };
  }

  if (candlesBeforeOnBoardDate < 750) {
    const newTo = add(nearestOnboardDate, 3000 * multiplier);

    return {
      from: nearestOnboardDate.getTime() as UTCTimestamp,
      to: (newTo >= nowTime ? nowTime.getTime() : newTo.getTime()) as UTCTimestamp,
    };
  }

  const newFrom = sub(currTime, multiplier * 1500);
  const newTo = add(currTime, multiplier * 1500);

  return {
    from: (newFrom <= nearestOnboardDate
      ? nearestOnboardDate.getTime()
      : newFrom.getTime()) as UTCTimestamp,
    to: (newTo >= nowTime ? nowTime.getTime() : newTo.getTime()) as UTCTimestamp,
  };
};

/**
 * Get the range from the range of a chart
 *
 * @param barsNeeded Bars needed before & after the range
 * @param onBoardDate The onBoardDate
 * @param resolution The resolution
 * @param multiplier The multiplier
 * @param firstSeriesTime The first series time
 * @param latestSeriesTime The latest series time
 * @returns A range or undefined if not found
 */
export const getRangeFromBarsInfos = (
  barsNeeded: { barsBefore: number; barsAfter: number },
  onBoardDate: UTCTimestamp,
  resolution: FetchResolution,
  multiplier: number,
  firstSeriesTime: UTCTimestamp,
  latestSeriesTime: UTCTimestamp,
  allowFetchingFutureCandles = true,
  now: () => UTCDate = () => new UTCDate(),
): Range | undefined => {
  const diff = diffResolution(resolution);
  const add = addResolution(resolution);
  const sub = subResolution(resolution);
  const firstCandleTime = new UTCDate(firstSeriesTime);
  const actualOnboardDate = findNearestCandleTime(new UTCDate(onBoardDate), resolution, multiplier);

  if (barsNeeded.barsBefore < 750 && Math.abs(diff(actualOnboardDate, firstCandleTime)) !== 0) {
    const startTime = sub(firstCandleTime, multiplier * 3000).getTime() as UTCTimestamp;

    return {
      from: (startTime <= actualOnboardDate.getTime()
        ? actualOnboardDate.getTime()
        : startTime) as UTCTimestamp,
      to: latestSeriesTime,
    };
  }

  const currentTime = findNearestCandleTime(now(), resolution, multiplier);
  const latestTime = new UTCDate(latestSeriesTime);
  const shouldFetch =
    allowFetchingFutureCandles && Math.abs(diff(currentTime, latestTime)) >= multiplier * 2;

  if (barsNeeded.barsAfter < 750 && shouldFetch) {
    console.log("We need more bars after");
    const potentialEndTime = add(new UTCDate(latestSeriesTime), multiplier * 3000);

    return {
      from: firstCandleTime.getTime() as UTCTimestamp,
      to: (potentialEndTime >= currentTime
        ? currentTime
        : potentialEndTime
      ).getTime() as UTCTimestamp,
    };
  }
};

/**
 * Analyze gaps in a range
 *
 * @param times A list of times found in DB
 * @param multiplier The multiplier
 * @param resolution The resolution
 * @param range The range to analyze
 * @returns Gaps found in the specified range
 */
export const analyzeGapsInRange = (
  times: Array<true>,
  multiplier: number,
  resolution: FetchResolution,
  range: Range,
): Range[] => {
  const ranges: Range[] = [];
  let requireNewRange = true;
  const add = addResolution(resolution);

  for (
    let index = new UTCDate(range.from);
    index <= new UTCDate(range.to);
    index = add(index, multiplier)
  ) {
    const lastRange = ranges[ranges.length - 1];

    if (!times[index.getTime()]) {
      if (lastRange && requireNewRange) {
        lastRange.to = index.getTime() as UTCTimestamp;
      } else {
        requireNewRange = true;
        ranges.push({
          from: index.getTime() as UTCTimestamp,
          to: index.getTime() as UTCTimestamp,
        });
      }
    } else {
      requireNewRange = false;
    }
  }

  return ranges;
};

/**
 * Move the chart to the specified time
 *
 * @param time Time to move on
 * @param chart The chart
 */
export const moveToTime = (time: UTCTimestamp, chart?: IChartApi) => {
  const visibleLogical = chart?.timeScale().getVisibleLogicalRange();
  const coordinate = chart?.timeScale().timeToCoordinate((time / 1000) as Time);

  if (visibleLogical != null && coordinate != null) {
    const logical = chart?.timeScale().coordinateToLogical(coordinate);

    if (logical != null) {
      const nbSteps = +Math.abs(visibleLogical.to - visibleLogical.from).toFixed(0);
      const from = logical - nbSteps / 2;
      const to = logical + nbSteps / 2;

      chart?.timeScale().setVisibleLogicalRange({ from, to });
    }
  }
};

/**
 * Get the range to fetch for replay, if we don't have enough candles
 *
 * @param lastTime The last time we have in the store
 * @param currentTime The current time we have in the store
 * @param resolution The resolution
 * @param multiplier The multiplier
 * @returns The range to fetch for replay or undefined if we don't need to fetch
 */
export const getFutureRangeForReplay = (
  lastTime: UTCTimestamp,
  currentTime: UTCTimestamp,
  resolution: FetchResolution,
  multiplier: number,
): Range | undefined => {
  const lastUtcTime = new UTCDate(lastTime);

  if (isFutureReached(lastUtcTime, resolution, multiplier)) return;

  const currentUtcTime = findNearestCandleTime(new UTCDate(currentTime), resolution, multiplier);
  const diff = diffResolution(resolution);

  if (Math.abs(diff(currentUtcTime, lastUtcTime)) / multiplier < 750) {
    const add = addResolution(resolution);
    const nowUtcTime = findNearestCandleTime(new UTCDate(), resolution, multiplier);
    const newTo = add(currentUtcTime, multiplier * 1500);
    return {
      from: add(currentUtcTime, multiplier).getTime() as UTCTimestamp,
      to: (newTo.getTime() >= nowUtcTime.getTime()
        ? nowUtcTime.getTime()
        : newTo.getTime()) as UTCTimestamp,
    };
  }
};
