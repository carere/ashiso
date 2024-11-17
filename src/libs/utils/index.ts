import { useSolux } from "@carere/solux";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";
import type { Container, RootState, TimeFrame, TradingFrequency } from "../types";

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
