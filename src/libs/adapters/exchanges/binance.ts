import type {
  AppError,
  Contract,
  ContractTicker,
  CryptoTicker,
  ExchangeSlug,
  MarketType,
  UTCTimestamp,
} from "@/libs/types";
import { UTCDate } from "@date-fns/utc";
import { Future, Result } from "@swan-io/boxed";
import xior from "xior";
import type { ExchangeGateway } from "../exchange.facade";

type FuturesSymbolFilter = {
  filterType: "PRICE_FILTER";
  minPrice: string;
  maxPrice: string;
  tickSize: string;
};

type ExchangeInfo = {
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

type Kline = [
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

const createBinanceExchangeGatewayError =
  (method: string) =>
  (error: unknown): AppError => ({
    kind: "ExchangeFacadeError",
    message: `ExchangeFacade (Binance) (${method}): ${(error as Error).message}`,
  });

const getTickSize = (filters: FuturesSymbolFilter[]): number => {
  const filter = filters.find((f) => f.filterType === "PRICE_FILTER");
  return filter ? Number(filter.tickSize) : 0.01;
};

export const binanceExchangeGateway = (restApiUrl: string): ExchangeGateway => {
  const xiorInstance = xior.create({ baseURL: restApiUrl });

  return {
    importPerpetualContracts: () =>
      Future.fromPromise(xiorInstance.get<ExchangeInfo>("/exchangeInfo"))
        .mapError(createBinanceExchangeGatewayError("importPerpetualContracts)"))
        .flatMapOk(({ data: { symbols } }) => {
          const validSymbols = symbols.filter(
            (s) => s.contractType === "PERPETUAL" && s.status === "TRADING",
          );

          return Future.allFromDict(
            validSymbols.reduce(
              (acc, { symbol }) => {
                acc[symbol] = Future.fromPromise(
                  xiorInstance.get<Kline[]>("/klines", {
                    params: { limit: 1, symbol, startTime: 0, interval: "1m" },
                  }),
                )
                  .mapError(createBinanceExchangeGatewayError("importPerpetualContracts)"))
                  .mapOk(({ data: klines }) => new UTCDate(klines[klines.length - 1][0]).getTime());
                return acc;
              },
              {} as Record<string, Future<Result<number, AppError>>>,
            ),
          )
            .map(Result.allFromDict)
            .mapOk(
              (onboardDates): Record<MarketType, Contract[]> => ({
                Swap: validSymbols.map((s) => ({
                  ticker: `BINANCE:${s.symbol}.P` as ContractTicker,
                  name: s.pair,
                  base: s.baseAsset as CryptoTicker,
                  quote: s.quoteAsset as CryptoTicker,
                  onboardDate: onboardDates[s.symbol] as UTCTimestamp,
                  kind: "Swap" as MarketType,
                  exchange: "binance" as ExchangeSlug,
                  pricePrecision: s.pricePrecision,
                  tickSize: getTickSize(s.filters),
                  volumePrecision: s.pricePrecision + s.quantityPrecision,
                  deprecated: false,
                })),
                Fundamental: [],
                Futures: [],
                Index: [],
                Spot: [],
              }),
            );
        }),
  };
};
