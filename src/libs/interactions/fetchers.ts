import { loading, updateMarketMetadata } from "@/libs/store/events";
import { type ExchangeSlug, type MarketMetadata, MarketMetadataSchema } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { query } from "@solidjs/router";
import { Dict, Future, Result } from "@swan-io/boxed";
import { differenceInDays } from "date-fns";
import { assign, diff, mapValues, merge, objectify, select, unique } from "radash";
import { parse } from "valibot";
import type { CryptoService } from "../adapters/crypto.service";
import type { ExchangeFacade } from "../adapters/exchange.facade";

const fetchMetadata = (cryptoService: CryptoService, exchangeFacade: ExchangeFacade) =>
  Future.all([cryptoService.import(), exchangeFacade.importAllContracts()])
    .map(Result.all)
    .mapOk(([importedCryptos, importedMarkets]): MarketMetadata => {
      // We get all crypto tickers from all contracts
      const cryptoTickersFromImportedMarkets = unique(
        Dict.values(importedMarkets).flatMap((m) => m.flatMap(({ base, quote }) => [base, quote])),
      );

      // We filter importedCryptos to only keep the
      // ones that are referenced by contracts
      const finalCryptos = importedCryptos.filter((c) =>
        cryptoTickersFromImportedMarkets.includes(c.ticker),
      );

      // We then filter all contracts by finalCryptos
      const finalContracts = mapValues(importedMarkets, (contracts) => {
        const cryptos = finalCryptos.map((c) => c.ticker);
        return contracts.filter((c) => cryptos.includes(c.base) && cryptos.includes(c.quote));
      });

      return {
        lastUpdate: String(new Date().getTime()),
        cryptos: objectify(finalCryptos, (c) => c.ticker),
        contracts: objectify(Dict.values(finalContracts).flat(), (c) => c.ticker),
        exchanges: {
          ["binance" as ExchangeSlug]: {
            slug: "binance" as ExchangeSlug,
            name: "Binance",
          },
        },
      };
    });

const MARKET_METADATA_KEY = "market-metadata";

export const getMarketMetadata = query(async () => {
  const {
    dispatch,
    container: { cryptoService, exchangeFacade },
  } = useStore();

  await Future.value(
    Result.fromExecution(() => {
      return parse(
        MarketMetadataSchema,
        JSON.parse(localStorage.getItem(MARKET_METADATA_KEY) ?? "{}"),
      );
    }),
  ).flatMap((result) =>
    result.match({
      Error: () => {
        dispatch(loading("Fetching market metadata"));
        return fetchMetadata(cryptoService, exchangeFacade).mapOk((metadata) => {
          localStorage.setItem(MARKET_METADATA_KEY, JSON.stringify(metadata));
          dispatch(updateMarketMetadata(metadata));
        });
      },
      Ok: (oldMetadata) => {
        if (Math.abs(differenceInDays(new Date(), new Date(+oldMetadata.lastUpdate))) < 1) {
          dispatch(updateMarketMetadata(oldMetadata));
          return Future.value(Result.Ok((() => {})()));
        }

        return fetchMetadata(cryptoService, exchangeFacade).mapOk((newMetadata) => {
          const deprecatedTickers = diff(
            Dict.keys(oldMetadata.contracts),
            Dict.keys(newMetadata.contracts),
          );

          const deprecatedContracts = select(
            Dict.values(oldMetadata.contracts),
            (c) => ({ ...c, deprecated: true }),
            (c) => deprecatedTickers.includes(c.ticker),
          );

          const finalMetadata: MarketMetadata = {
            ...newMetadata,
            cryptos: assign(newMetadata.cryptos, oldMetadata.cryptos),
            contracts: objectify(
              merge(Dict.values(newMetadata.contracts), deprecatedContracts, (c) => c.ticker),
              (c) => c.ticker,
            ),
          };

          localStorage.setItem(MARKET_METADATA_KEY, JSON.stringify(finalMetadata));
          dispatch(updateMarketMetadata(finalMetadata));
        });
      },
    }),
  );
}, MARKET_METADATA_KEY);
