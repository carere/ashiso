import { UTCDate } from "@date-fns/utc";
import { addResolution } from ".";
import type { ExchangeFacade } from "../adapters/exchange.facade";
import type { ExchangeSlug, StockPriceOption, UTCTimestamp } from "../types";

export async function* collect(
  exchangeFacade: ExchangeFacade,
  { from, resolution, multiplier, ticker, to }: StockPriceOption,
) {
  let hasDoneFetchingPrices = false;
  const exchange = ticker.split(":")[0].toLocaleLowerCase() as ExchangeSlug;
  const add = addResolution(resolution);

  const generateStockPriceFromExchange = async function* () {
    let start = new UTCDate(from);

    while (!hasDoneFetchingPrices) {
      if (start.getTime() >= to) {
        hasDoneFetchingPrices = true;
        continue;
      }

      const res = await exchangeFacade.fetch(
        {
          ticker,
          resolution,
          multiplier,
          from: start.getTime() as UTCTimestamp,
          to,
        },
        exchange,
      );

      if (res.isError()) {
        throw new Error(`Error fetching ${ticker}'s price (${res.error.message})`);
      }

      const candles = res.value;

      if (candles.length < exchangeFacade.getMaxKlinesLimit(exchange)) {
        hasDoneFetchingPrices = true;
      }

      if (candles.length > 0) {
        start = add(new UTCDate(candles[candles.length - 1].time), multiplier);
        if (start.getTime() > to) start = new UTCDate(to);
        yield candles;
      }
    }
  };

  for await (const candles of generateStockPriceFromExchange()) {
    yield candles;
  }

  return hasDoneFetchingPrices;
}
