import type { AppError, Contract, ExchangeSlug, MarketType } from "@/libs/types";
import { Future, Result } from "@swan-io/boxed";

export type ExchangeFacade = {
  importPerpetualContracts(
    slug: ExchangeSlug,
  ): Future<Result<Record<MarketType, Contract[]>, AppError>>;
};

export type ExchangeGateway = {
  importPerpetualContracts(): ReturnType<ExchangeFacade["importPerpetualContracts"]>;
};

export const ashisoExchangeFacade = (
  gateways: Record<ExchangeSlug, ExchangeGateway>,
): ExchangeFacade => ({
  importPerpetualContracts: (slug) => {
    if (!gateways[slug]) {
      return Future.value(
        Result.Error({
          kind: "InternalError",
          message: `Cannot find '${slug}' exchange gateway`,
        } as AppError),
      );
    }

    return gateways[slug].importPerpetualContracts();
  },
});
