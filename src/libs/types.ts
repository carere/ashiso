import type { Accessor } from "solid-js";
import {
  type InferOutput,
  boolean,
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
  deprecated: boolean(),
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
// BackTest
//

export type BackTestSpeed = "0.1" | "0.3" | "0.5" | "1" | "3" | "10";

export type BackTest = {
  currentTime?: UTCTimestamp;
  running: boolean;
  selecting: boolean;
  speed: BackTestSpeed;
};

//
// Candles
//

export type FetchResolution = "m" | "H" | "D" | "W" | "M" | "Q" | "Y";

export type Candle = {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  time: UTCTimestamp;
  closed: boolean;
  trades: number;
  ticker: ContractTicker;
};

export type CandlesId = `${ContractTicker}-${number}-${FetchResolution}`;

//
// Chart
//

export type IndicatorType = "volume" | "bollinger" | "volatility" | "phases";

export type Chart = {
  ticker: ContractTicker;
  multiplier: number;
  visible: boolean;
  fetching: boolean;
  resolution: FetchResolution;
  selectedTime?: UTCTimestamp;
  indicators: Record<IndicatorType, boolean>;
};

export type GraphLayoutProps = {
  sessionId: string;
  timeFrames: TimeFrame[];
  updateCrossHair?: (crossHair: CrossHair) => void;
  crossHair: Accessor<CrossHair | undefined>;
};

export type Range = { start: UTCTimestamp; end: UTCTimestamp };

//
// Indicators
//

export type TradingFrequency = "scalping" | "intra-day" | "swing";

export type BollingerBandData = {
  time: number;
  middle: number;
  upper: number;
  lower: number;
  volatility?: number;
  phase?: 1 | 2 | 3 | 4;
};

export type BBPhase = Pick<BollingerBandData, "phase" | "time">;
export type Volatility = Pick<BollingerBandData, "volatility" | "time">;
export type BBands = Pick<BollingerBandData, "middle" | "upper" | "lower" | "time">;

export type VolumeMA = {
  time: number;
  value: number;
};

export type UnitOfTime = {
  multiplier: number;
  resolution: FetchResolution;
};

export type UnitOfTimeToTradeOn = {
  bias: UnitOfTime;
  strategy: UnitOfTime;
  trading: UnitOfTime;
  precision: UnitOfTime;
};

//
// Session
//

export type CrossHair = { sender: TimeFrame; time: number };

export type TimeFrame = `${number}-${FetchResolution}`;

export type Session = {
  id: string;
  ticker?: ContractTicker;
  frequency?: TradingFrequency;
  selectedTime?: UTCTimestamp;
  layout: "grid" | "horizontal" | "vertical";
  draft: boolean;
  backTest?: BackTest;
  charts: Record<TimeFrame, Chart>;
  createdAt: UTCTimestamp;
  candles: Record<
    CandlesId,
    {
      currentCandle?: Candle;
      entities: Record<UTCTimestamp, Candle>;
      values: Candle[];
    }
  >;
  indicators: Record<
    TimeFrame,
    {
      volume: {
        entities: Record<UTCTimestamp, VolumeMA>;
        values: VolumeMA[];
      };
      bollinger: {
        entities: Record<UTCTimestamp, BBands>;
        values: BBands[];
      };
      volatility: {
        entities: Record<UTCTimestamp, Volatility>;
        values: Volatility[];
      };
      phases: {
        entities: Record<UTCTimestamp, BBPhase>;
        values: BBPhase[];
      };
    }
  >;
};
