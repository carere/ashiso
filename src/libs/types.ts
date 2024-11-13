import type { Epic } from "@carere/solux";
import type { CryptoService } from "./adapters/crypto.service";
import type { ExchangeFacade } from "./adapters/exchange.facade";
import type { rootSlice } from "./store/slices";

//
// Models
//

type Brand<K, T> = K & { __brand: T };

export type ExchangeSlug = Brand<string, "exchange">;
export type CryptoTicker = Brand<string, "crypto">;
export type ContractTicker = Brand<string, "contract">;
export type UTCTimestamp = Brand<number, "timestamp">;
export type MarketType = "Spot" | "Swap" | "Futures" | "Index" | "Fundamental";

export type Exchange = {
  slug: ExchangeSlug;
  name: string;
  logo?: string;
};

export type CryptoCurrency = {
  ticker: CryptoTicker;
  name: string;
  logo?: string;
};

export type Contract = {
  ticker: ContractTicker;
  logo?: string;
  name: string;
  base: CryptoTicker;
  quote: CryptoTicker;
  kind: MarketType;
  exchange: ExchangeSlug;
  onboardDate: UTCTimestamp;
  pricePrecision: number;
  volumePrecision: number;
  tickSize: number;
};

export type MarketMetadata = {
  cryptos: Record<string, CryptoCurrency>;
  contracts: Record<string, Contract>;
  exchanges: Record<string, Exchange>;
};

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
