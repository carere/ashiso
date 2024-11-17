import { useSolux } from "@carere/solux";
import { UTCDate } from "@date-fns/utc";
import { type ClassValue, clsx } from "clsx";
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInWeeks,
  differenceInYears,
  startOfDay,
  startOfDecade,
  startOfHour,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from "date-fns";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";
import type { Container, RootState, TimeFrame, TradingFrequency } from "../types";
import type { FetchResolution, UnitOfTimeToTradeOn } from "../types";

//
// Utils
//

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

//
// Store
//

export const useStore = useSolux<RootState, Container>;

//
// TimeFrame & TradingFrequency
//

export const getTinyUnitOfTimeToTradeOn = (frequency: TradingFrequency): TimeFrame[] =>
  match<TradingFrequency, TimeFrame[]>(frequency)
    .with("scalping", () => ["1-m", "5-m", "30-m", "4-H"])
    .with("intra-day", () => ["5-m", "30-m", "4-H", "1-D"])
    .with("swing", () => ["30-m", "4-H", "1-D", "1-W"])
    .exhaustive();

export const getUnitOfTimeForTrading = (frequency: TradingFrequency): TimeFrame =>
  match<TradingFrequency, TimeFrame>(frequency)
    .with("scalping", () => "5-m")
    .with("intra-day", () => "30-m")
    .with("swing", () => "4-H")
    .exhaustive();

/**
 * Add a resolution to a date through date-fns
 *
 * @param resolution The resolution to use
 * @returns A function to add the resolution to a date
 */
export const addResolution = (resolution: FetchResolution) =>
  match<FetchResolution>(resolution)
    .with("m", () => addMinutes)
    .with("H", () => addHours)
    .with("D", () => addDays)
    .with("W", () => addWeeks)
    .with("M", () => addMonths)
    .with("Q", () => addQuarters)
    .with("Y", () => addYears)
    .exhaustive();

/**
 * Subtract a resolution to a date through date-fns
 *
 * @param resolution The resolution to use
 * @returns A function to minus the resolution to a date
 */
export const subResolution = (resolution: FetchResolution) =>
  match<FetchResolution>(resolution)
    .with("m", () => subMinutes)
    .with("H", () => subHours)
    .with("D", () => subDays)
    .with("W", () => subWeeks)
    .with("M", () => subMonths)
    .with("Q", () => subQuarters)
    .with("Y", () => subYears)
    .exhaustive();

/**
 * Start of a resolution to a date through date-fns
 *
 * @param resolution The resolution to use
 * @returns A function to start of the resolution to a date
 */
export const startOfResolution = (resolution: FetchResolution) =>
  match<FetchResolution>(resolution)
    .with("m", () => startOfHour)
    .with("H", () => startOfDay)
    .with("D", () => startOfWeek)
    .with("W", () => startOfMonth)
    .with("M", () => startOfYear)
    .with("Q", () => startOfYear)
    .with("Y", () => startOfDecade)
    .exhaustive();

/**
 * Difference in a resolution to a date through date-fns
 *
 * @param resolution The resolution to use
 * @returns A function to difference in the resolution to a date
 */
export const diffResolution = (resolution: FetchResolution) =>
  match<FetchResolution>(resolution)
    .with("m", () => differenceInMinutes)
    .with("H", () => differenceInHours)
    .with("D", () => differenceInDays)
    .with("W", () => differenceInWeeks)
    .with("M", () => differenceInMonths)
    .with("Q", () => differenceInQuarters)
    .with("Y", () => differenceInYears)
    .exhaustive();

/**
 * Find the nearest candle to the given time
 * @param time The time to find the nearest candle
 * @param resolution  The resolution
 * @param multiplier  The multiplier
 * @returns The nearest time as DateTime
 */
export const findNearestCandleTime = (
  time: UTCDate,
  resolution: FetchResolution,
  multiplier: number,
): UTCDate => {
  const startOf = startOfResolution(resolution);
  const diff = diffResolution(resolution);
  const add = addResolution(resolution);
  let startOfTime = resolution === "W" ? startOfWeek(time, { weekStartsOn: 1 }) : startOf(time);

  while (Math.abs(diff(time, startOfTime)) >= multiplier) {
    startOfTime = add(startOfTime, multiplier);
  }

  return startOfTime;
};

/**
 * Check if the time passed as parameter is the "now" candle
 *
 * @param time The time to know if is current candle
 * @param resolution The resolution
 * @param multiplier The multiplier
 * @returns True if future reached, false otherwise
 */
export const isFutureReached = (time: UTCDate, resolution: FetchResolution, multiplier: number) => {
  const diff = diffResolution(resolution);
  const nowTime = findNearestCandleTime(new UTCDate(), resolution, multiplier);
  const currentTime = findNearestCandleTime(time, resolution, multiplier);

  return Math.abs(diff(currentTime, nowTime)) <= multiplier;
};

/**
 * Get the unit of time to trade on for a given trading frequency
 * @param frequency The trading frequency
 * @returns The unit of time to trade on
 */
export const getUnitOfTimeToTradeOn = (frequency: TradingFrequency): UnitOfTimeToTradeOn =>
  match<TradingFrequency, UnitOfTimeToTradeOn>(frequency)
    .with("scalping", () => ({
      bias: { multiplier: 4, resolution: "H" },
      strategy: { multiplier: 30, resolution: "m" },
      trading: { multiplier: 5, resolution: "m" },
      precision: { multiplier: 1, resolution: "m" },
    }))
    .with("intra-day", () => ({
      bias: { multiplier: 1, resolution: "D" },
      strategy: { multiplier: 4, resolution: "H" },
      trading: { multiplier: 30, resolution: "m" },
      precision: { multiplier: 5, resolution: "m" },
    }))
    .with("swing", () => ({
      bias: { multiplier: 1, resolution: "W" },
      strategy: { multiplier: 1, resolution: "D" },
      trading: { multiplier: 4, resolution: "H" },
      precision: { multiplier: 30, resolution: "m" },
    }))
    .exhaustive();

/**
 * Return 0 if the number is NaN, otherwise return the number
 * @param a The number to check
 * @returns 0 if the number is NaN, otherwise return the number
 */
export const nz = (a: number) => (Number.isNaN(a) ? 0.0 : a);

/**
 * Calculate the SHA-256 hash of a message
 * @param message The message to hash
 * @returns The SHA-256 hash of the message
 */
export const digestMessage = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
  return hashHex;
};
