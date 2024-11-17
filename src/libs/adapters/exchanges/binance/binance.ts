import type {
  AppError,
  Candle,
  CandlesId,
  Contract,
  ContractTicker,
  CryptoTicker,
  ExchangeSlug,
  MarketType,
  UTCTimestamp,
} from "@/libs/types";
import { diffResolution, findNearestCandleTime } from "@/libs/utils";
import { UTCDate } from "@date-fns/utc";
import { Future, Result } from "@swan-io/boxed";
import { type Observable, type Subscription, retry } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import xior from "xior";
import type { ExchangeGateway } from "../../exchange.facade";
import {
  type ExchangeInfo,
  type FuturesSymbolFilter,
  type Kline,
  type KlineInterval,
  MAX_KLINES,
  type WsMessageKlineRaw,
  getBinanceTicker,
} from "./types";

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

export const binanceExchangeGateway = (restApiUrl: string, wsApiUrl: string): ExchangeGateway => {
  const wsRegistry: Record<CandlesId, Observable<WsMessageKlineRaw>> = {};
  const subRegistry: Record<string, Subscription> = {};
  const xiorInstance = xior.create({ baseURL: restApiUrl });

  return {
    getMaxKlinesLimit: () => MAX_KLINES,
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
    closeLivePrices: (clientId) => subRegistry[clientId]?.unsubscribe(),
    livePrices: (candlesId, clientId, callback) => {
      const [ticker, multiplier, resolution] = candlesId.split("-");

      if (!wsRegistry[candlesId]) {
        wsRegistry[candlesId] = webSocket<WsMessageKlineRaw>({
          url: `${wsApiUrl}/ws/${getBinanceTicker(
            ticker as ContractTicker,
          ).toLocaleLowerCase()}@kline_${multiplier}${resolution.toLowerCase()}`,
          WebSocketCtor: WebSocket,
        }).pipe(retry({ delay: 3000 }));
      }

      subRegistry[clientId] = wsRegistry[candlesId].subscribe({
        next: (rawCandle) => {
          callback({
            open: Number.parseFloat(rawCandle.k.o as string),
            high: Number.parseFloat(rawCandle.k.h as string),
            low: Number.parseFloat(rawCandle.k.l as string),
            close: Number.parseFloat(rawCandle.k.c as string),
            volume: Number.parseFloat(rawCandle.k.v as string),
            closed: rawCandle.k.x,
            trades: rawCandle.k.n,
            time: rawCandle.k.t as UTCTimestamp,
            ticker: ticker as ContractTicker,
          });
        },
      });
    },
    fetch: ({ ticker, resolution, multiplier, from: start, to: end }, limit = MAX_KLINES) =>
      Future.fromPromise(
        xiorInstance.get<Kline[]>("/klines", {
          params: {
            limit,
            symbol: getBinanceTicker(ticker),
            ...(start && { startTime: start }),
            ...(end && { endTime: end }),
            interval: `${multiplier}${resolution.toLowerCase()}` as KlineInterval,
          },
        }),
      )
        .mapError(createBinanceExchangeGatewayError("ExchangeGateway (Binance:fetch)"))
        .mapOk(({ data: klines }) => {
          const diff = diffResolution(resolution);
          const candles: Candle[] = [];
          const currentTime = findNearestCandleTime(new UTCDate(), resolution, multiplier);
          for (const kline of klines) {
            const openTime = kline[0] as UTCTimestamp;
            const latestTime = new UTCDate(openTime);
            if (Math.abs(diff(currentTime, latestTime)) >= multiplier) {
              candles.push({
                time: openTime,
                open: Number.parseFloat(kline[1]),
                high: Number.parseFloat(kline[2]),
                low: Number.parseFloat(kline[3]),
                close: Number.parseFloat(kline[4]),
                volume: Number.parseFloat(kline[5]),
                closed: true,
                trades: kline[8],
                ticker,
              });
            }
          }
          return candles;
        }),
  };
};
