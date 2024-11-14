import type { Epic } from "@carere/solux";
import {
  type InferOutput,
  brand,
  isoTimestamp,
  literal,
  number,
  object,
  optional,
  pipe,
  record,
  string,
  union,
} from "valibot";
import type { CryptoService } from "./adapters/crypto.service";
import type { ExchangeFacade } from "./adapters/exchange.facade";
import type { rootSlice } from "./store/slices";

//
// Models
//

const ExchangeSlugSchema = pipe(string(), brand("exchange"));
export type ExchangeSlug = InferOutput<typeof ExchangeSlugSchema>;

const CryptoTickerSchema = pipe(string(), brand("crypto"));
export type CryptoTicker = InferOutput<typeof CryptoTickerSchema>;

const ContractTickerSchema = pipe(string(), brand("contract"));
export type ContractTicker = InferOutput<typeof ContractTickerSchema>;

const UTCTimestampSchema = pipe(number(), brand("timestamp"));
export type UTCTimestamp = InferOutput<typeof UTCTimestampSchema>;

const MarketTypeSchema = union([
  literal("Spot"),
  literal("Swap"),
  literal("Futures"),
  literal("Index"),
  literal("Fundamental"),
]);

export type MarketType = InferOutput<typeof MarketTypeSchema>;

export const ExchangeSchema = object({
  slug: ExchangeSlugSchema,
  name: string(),
  logo: optional(string()),
});

export type Exchange = InferOutput<typeof ExchangeSchema>;

export const CryptoCurrencySchema = object({
  ticker: CryptoTickerSchema,
  name: string(),
  logo: optional(string()),
});

export type CryptoCurrency = InferOutput<typeof CryptoCurrencySchema>;

export const ContractSchema = object({
  ticker: ContractTickerSchema,
  logo: optional(string()),
  name: string(),
  base: CryptoTickerSchema,
  quote: CryptoTickerSchema,
  kind: MarketTypeSchema,
  exchange: ExchangeSlugSchema,
  onboardDate: UTCTimestampSchema,
  pricePrecision: number(),
  volumePrecision: number(),
  tickSize: number(),
});

export type Contract = InferOutput<typeof ContractSchema>;

export const MarketMetadataSchema = object({
  lastUpdate: pipe(string(), isoTimestamp()),
  cryptos: record(CryptoTickerSchema, CryptoCurrencySchema),
  contracts: record(ContractTickerSchema, ContractSchema),
  exchanges: record(ExchangeSlugSchema, ExchangeSchema),
});

export type MarketMetadata = InferOutput<typeof MarketMetadataSchema>;

//
// Container
//

export type Container = {
  exchangeFacade: ExchangeFacade;
  cryptoService: CryptoService;
};

//
// Store
//

export type RootState = ReturnType<typeof rootSlice.getInitialState>;
export type AppEpic = Epic<RootState, Container>;

//
// User
//

export type UserConfig = {
  exchanges: "binance";
};

//
// App
//

export type AppError = {
  kind: "InternalError" | "CryptoServiceError" | "ExchangeFacadeError";
  message: string;
};
