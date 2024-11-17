import type {
  AppError,
  Candle,
  CandlesId,
  Contract,
  ExchangeSlug,
  MarketType,
  StockPriceOption,
} from "@/libs/types";
import { Dict, Future, Result } from "@swan-io/boxed";

export type ExchangeFacade = {
  importAllContracts(): Future<Result<Record<MarketType, Contract[]>, AppError>>;
  livePrices(candlesId: CandlesId, clientId: string, callback: (candle: Candle) => void): void;
  closeLivePrices(candlesId: CandlesId, clientId: string): void;
  fetch(options: StockPriceOption, slug: ExchangeSlug): Future<Result<Candle[], AppError>>;
  getMaxKlinesLimit(slug: ExchangeSlug): number;
};

export type ExchangeGateway = {
  importPerpetualContracts: ExchangeFacade["importAllContracts"];
  closeLivePrices(clientId: string): void;
  livePrices: ExchangeFacade["livePrices"];
  fetch(options: StockPriceOption, limit?: number): ReturnType<ExchangeFacade["fetch"]>;
  getMaxKlinesLimit(): ReturnType<ExchangeFacade["getMaxKlinesLimit"]>;
};

export const ashisoExchangeFacade = (
  gateways: Record<ExchangeSlug, ExchangeGateway>,
): ExchangeFacade => ({
  importAllContracts: () =>
    Future.all(Dict.keys(gateways).map((slug) => gateways[slug].importPerpetualContracts()))
      .map(Result.all)
      .mapOk((markets) =>
        markets.reduce(
          (acc, market) => {
            for (const key of Dict.keys(market)) {
              acc[key] = acc[key] ?? [];
              acc[key].push(...market[key]);
            }
            return acc;
          },
          {} as Record<MarketType, Contract[]>,
        ),
      ),
  closeLivePrices: (candlesId, clientId) => {
    const slug = candlesId.split("-")[0].split(":")[0].toLowerCase() as ExchangeSlug;

    if (!gateways[slug]) throw new Error(`Exchange '${slug}' not found`);

    return gateways[slug].closeLivePrices(clientId);
  },
  livePrices: (candlesId, clientId, callback) => {
    const slug = candlesId.split("-")[0].split(":")[0].toLowerCase() as ExchangeSlug;

    if (!gateways[slug]) throw new Error(`Exchange '${slug}' not found`);

    gateways[slug].livePrices(candlesId, clientId, callback);
  },
  fetch: (options, slug) => {
    if (!gateways[slug]) {
      return Future.value(
        Result.Error({
          kind: "ExchangeFacadeError",
          message: `Fetch: Exchange '${slug}' not found`,
        }),
      );
    }

    return gateways[slug].fetch(options);
  },
  getMaxKlinesLimit: (slug) => {
    if (!gateways[slug]) throw new Error(`Exchange '${slug}' not found`);

    return gateways[slug].getMaxKlinesLimit();
  },
});
