import type { AppError, Contract, ExchangeSlug, MarketType } from "@/libs/types";
import { Future, Result } from "@swan-io/boxed";

export type ExchangeFacade = {
  importAllContracts(): Future<Result<Record<MarketType, Contract[]>, AppError>>;
};

export type ExchangeGateway = {
  importPerpetualContracts(): ReturnType<ExchangeFacade["importAllContracts"]>;
};

export const ashisoExchangeFacade = (
  gateways: Record<ExchangeSlug, ExchangeGateway>,
): ExchangeFacade => ({
  importAllContracts: () =>
    Future.all(
      (Object.keys(gateways) as ExchangeSlug[]).map((slug) =>
        gateways[slug].importPerpetualContracts(),
      ),
    )
      .map(Result.all)
      .mapOk((markets) =>
        markets.reduce(
          (acc, market) => {
            for (const key of Object.keys(market) as MarketType[]) {
              acc[key] = acc[key] ?? [];
              acc[key].push(...market[key]);
            }
            return acc;
          },
          {} as Record<MarketType, Contract[]>,
        ),
      ),
});
