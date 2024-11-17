import type { CandlesId } from "@/libs/types";
import { int, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const candles = sqliteTable(
  "candles",
  {
    time: int("time", { mode: "timestamp_ms" }).notNull(),
    open: real("open").notNull(),
    close: real("close").notNull(),
    high: real("high").notNull(),
    low: real("low").notNull(),
    volume: real("volume").notNull(),
    closed: int("closed", { mode: "boolean" }).default(true),
    trades: int("trades").default(0).notNull(),
    candles_id: text("candles_id").$type<CandlesId>().notNull(),
  },
  (table) => ({
    candle_pk: primaryKey({
      name: "candle_pk",
      columns: [table.candles_id, table.time],
    }),
  }),
);
