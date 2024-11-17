import type { ContractTicker } from "@/libs/types";

export type FuturesSymbolFilter = {
  filterType: "PRICE_FILTER";
  minPrice: string;
  maxPrice: string;
  tickSize: string;
};

export type ExchangeInfo = {
  symbols: Array<{
    symbol: string;
    pair: string;
    contractType:
      | "PERPETUAL"
      | "CURRENT_MONTH"
      | "NEXT_MONTH"
      | "CURRENT_QUARTER"
      | "NEXT_QUARTER"
      | "PERPETUAL_DELIVERY";
    status:
      | "PENDING_TRADING"
      | "TRADING"
      | "PRE_DELIVERING"
      | "DELIVERING"
      | "DELIVERED"
      | "PRE_SETTLE"
      | "SETTLING"
      | "CLOSE";
    onboardDate: number;
    baseAsset: string;
    quoteAsset: string;
    pricePrecision: number;
    quantityPrecision: number;
    filters: FuturesSymbolFilter[];
  }>;
};

export type WsKey = string | "spot" | "margin" | "usdmfutures" | "coinmfutures" | "options";

export type WsMarket =
  | "spot"
  | "margin"
  | "isolatedMargin"
  | "usdm"
  | "usdmTestnet"
  | "coinm"
  | "coinmTestnet"
  | "options"
  | "optionsTestnet";

export type WsSharedBase = {
  wsMarket: WsMarket;
  wsKey: WsKey;
};

export type WsMessageKlineRaw = {
  e: "kline";
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: KlineInterval;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
} & WsSharedBase;

export const MAX_KLINES = 1500;

export declare type KlineInterval =
  | "1s"
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

export type Kline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

export const getBinanceTicker = (ticker: ContractTicker) =>
  ticker.replace(".P", "").replace("BINANCE:", "");

export const getTickSize = (filters: FuturesSymbolFilter[]): number => {
  const filter = filters.find((f) => f.filterType === "PRICE_FILTER");
  return filter ? Number(filter.tickSize) : 0.01;
};
