import { UTCDate } from "@date-fns/utc";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { type SqliteRemoteDatabase, drizzle } from "drizzle-orm/sqlite-proxy";
import { pick } from "radash";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import { match } from "ts-pattern";
import { type ExchangeFacade, ashisoExchangeFacade } from "../adapters/exchange.facade";
import { binanceExchangeGateway } from "../adapters/exchanges/binance/binance";
import { migrate } from "../db/migrations";
import * as schema from "../db/schema";
import type {
  Candle,
  CandleWorkerRequest,
  CandleWorkerResponse,
  CandlesId,
  ExchangeSlug,
  Range,
  StockPriceOption,
  UTCTimestamp,
} from "../types";
import { collect } from "../utils/collect";
import { analyzeGapsInRange } from "../utils/graph";

let db: SqliteRemoteDatabase<typeof schema>;
let exchangeFacade: ExchangeFacade;

async function initialize() {
  const { driver } = new SQLocalDrizzle("ashiso.sqlite3");
  db = drizzle(driver, { schema });
  await migrate(db);
  await db.run(sql`PRAGMA journal_mode = WAL;`);

  exchangeFacade = ashisoExchangeFacade({
    ["binance" as ExchangeSlug]: binanceExchangeGateway(
      import.meta.env.VITE_BINANCE_REST_API_URL,
      import.meta.env.VITE_BINANCE_WS_API_URL,
    ),
  });
}

async function findMissingRanges(candlesId: CandlesId, opts: StockPriceOption): Promise<Range[]> {
  const timesFound = await db.query.candles.findMany({
    columns: { time: true },
    orderBy: [asc(schema.candles.time)],
    where: and(
      eq(schema.candles.candles_id, candlesId),
      gte(schema.candles.time, new UTCDate(opts.from)),
      lte(schema.candles.time, new UTCDate(opts.to)),
    ),
  });

  return analyzeGapsInRange(
    timesFound.reduce(
      (acc, { time }) => {
        acc[new UTCDate(time).getTime()] = true;
        return acc;
      },
      [] as Array<true>,
    ),
    opts.multiplier,
    opts.resolution,
    pick(opts, ["from", "to"]),
  );
}

async function retrieveMissingRanges(
  candlesId: CandlesId,
  ranges: Range[],
  opts: StockPriceOption,
): Promise<void> {
  for (const range of ranges) {
    const options: StockPriceOption = {
      ...range,
      ...pick(opts, ["ticker", "multiplier", "resolution"]),
    };

    for await (const items of collect(exchangeFacade, options)) {
      const candles = items.map((i) => ({
        ...i,
        candles_id: candlesId,
        time: new UTCDate(i.time),
      }));

      await db.insert(schema.candles).values(candles).execute();
    }
  }
}

addEventListener("message", async (event) => {
  await match<CandleWorkerRequest>(event.data)
    .with({ type: "initialize" }, async () => {
      await initialize();
      postMessage({ type: "initialized" } satisfies CandleWorkerResponse);
    })
    .with({ type: "fetch-candles" }, async ({ data, sender }) => {
      console.log("[Candles Fetcher] fetch-candles", {
        sender,
        from: new UTCDate(data.from).toISOString(),
        to: new UTCDate(data.to).toISOString(),
      });

      const candlesId: CandlesId = `${data.ticker}-${data.multiplier}-${data.resolution}`;

      const ranges = await findMissingRanges(candlesId, data);

      console.log("[Candles Fetcher] Missing Ranges", { sender, ranges });

      await retrieveMissingRanges(candlesId, ranges, data);

      const storedCandles = await db.query.candles.findMany({
        orderBy: [asc(schema.candles.time)],
        where: and(
          eq(schema.candles.candles_id, candlesId),
          gte(schema.candles.time, new UTCDate(data.from)),
          lte(schema.candles.time, new UTCDate(data.to)),
        ),
      });

      const candles: Candle[] = [];

      for (const c of storedCandles) {
        candles.push({
          ...c,
          ticker: data.ticker,
          closed: Boolean(c.closed),
          time: new UTCDate(c.time).getTime() as UTCTimestamp,
        });
      }

      postMessage({
        type: "candles-fetched",
        sender,
        data: candles,
      } satisfies CandleWorkerResponse);
    })
    .exhaustive();
});
