import type { Epic } from "@carere/solux";
import type { Accessor } from "solid-js";
import {
  type InferOutput,
  array,
  boolean,
  brand,
  custom,
  isoTimestamp,
  literal,
  number,
  object,
  optional,
  pick,
  pipe,
  record,
  string,
  union,
} from "valibot";
import type { CryptoService } from "./adapters/crypto.service";
import type { ExchangeFacade } from "./adapters/exchange.facade";
import type { rootSlice } from "./store/slices";
import type { AnalyzerData } from "./utils/analyzer";

//
// Container
//

export type Container = {
  exchangeFacade: ExchangeFacade;
  cryptoService: CryptoService;
  candlesFetcher: Worker;
  analyzers: Worker;
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

const BackTestSpeedSchema = union([
  literal("0.1"),
  literal("0.3"),
  literal("0.5"),
  literal("1"),
  literal("3"),
  literal("10"),
]);

export type BackTestSpeed = InferOutput<typeof BackTestSpeedSchema>;

const BackTestSchema = object({
  currentTime: optional(UTCTimestampSchema),
  running: boolean(),
  selecting: boolean(),
  speed: BackTestSpeedSchema,
});

export type BackTest = InferOutput<typeof BackTestSchema>;

//
// Candles
//

const FetchResolutionSchema = union([
  literal("m"),
  literal("H"),
  literal("D"),
  literal("W"),
  literal("M"),
]);

export type FetchResolution = InferOutput<typeof FetchResolutionSchema>;

const CandleSchema = object({
  open: number(),
  close: number(),
  high: number(),
  low: number(),
  volume: number(),
  closed: boolean(),
  trades: number(),
  time: UTCTimestampSchema,
  ticker: ContractTickerSchema,
});

export type Candle = InferOutput<typeof CandleSchema>;

export type SimpleCandle = Omit<Candle, "trades" | "volume" | "ticker">;

const CandlesIdSchema = custom<`${ContractTicker}-${number}-${FetchResolution}`>((input) =>
  typeof input === "string" ? /^\w+-\d+-(m|H|D|W|M)$/.test(input) : false,
);

export type CandlesId = InferOutput<typeof CandlesIdSchema>;

export type StockPriceOption = {
  ticker: ContractTicker;
  multiplier: number;
  resolution: FetchResolution;
  from: UTCTimestamp;
  to: UTCTimestamp;
};

//
// Chart
//

const IndicatorTypeSchema = union([
  literal("volume"),
  literal("bollinger"),
  literal("volatility"),
  literal("phases"),
]);

export type IndicatorType = InferOutput<typeof IndicatorTypeSchema>;

const ChartSchema = object({
  ticker: ContractTickerSchema,
  multiplier: number(),
  visible: boolean(),
  fetching: boolean(),
  resolution: FetchResolutionSchema,
  selectedTime: optional(UTCTimestampSchema),
  indicators: record(IndicatorTypeSchema, boolean()),
});

export type Chart = InferOutput<typeof ChartSchema>;

export type GraphLayoutProps = {
  sessionId: string;
  timeFrames: TimeFrame[];
  updateCrossHair?: (crossHair: CrossHair) => void;
  crossHair: Accessor<CrossHair | undefined>;
};

export type Range = Pick<StockPriceOption, "from" | "to">;

//
// Indicators
//

const TradingFrequencySchema = union([literal("scalping"), literal("intra-day"), literal("swing")]);

export type TradingFrequency = InferOutput<typeof TradingFrequencySchema>;

const BollingerBandDataSchema = object({
  time: number(),
  middle: number(),
  upper: number(),
  lower: number(),
  volatility: optional(number()),
  phase: optional(union([literal(1), literal(2), literal(3), literal(4)])),
});

export type BollingerBandData = InferOutput<typeof BollingerBandDataSchema>;

const BBPhaseSchema = pick(BollingerBandDataSchema, ["phase", "time"]);
export type BBPhase = InferOutput<typeof BBPhaseSchema>;

const VolatilitySchema = pick(BollingerBandDataSchema, ["volatility", "time"]);
export type Volatility = InferOutput<typeof VolatilitySchema>;

const BBandsSchema = pick(BollingerBandDataSchema, ["middle", "upper", "lower", "time"]);
export type BBands = InferOutput<typeof BBandsSchema>;

const VolumeMASchema = object({
  time: number(),
  value: number(),
});

export type VolumeMA = InferOutput<typeof VolumeMASchema>;

const UnitOfTimeSchema = object({
  multiplier: number(),
  resolution: FetchResolutionSchema,
});

export type UnitOfTime = InferOutput<typeof UnitOfTimeSchema>;

const UnitOfTimeToTradeOnSchema = object({
  bias: UnitOfTimeSchema,
  strategy: UnitOfTimeSchema,
  trading: UnitOfTimeSchema,
  precision: UnitOfTimeSchema,
});

export type UnitOfTimeToTradeOn = InferOutput<typeof UnitOfTimeToTradeOnSchema>;

//
// Session
//

export type CrossHair = { sender: TimeFrame; time: number };

const TimeFrameSchema = custom<`${number}-${FetchResolution}`>((input) =>
  typeof input === "string" ? /^\d+-(m|H|D|W|M)$/.test(input) : false,
);

export type TimeFrame = InferOutput<typeof TimeFrameSchema>;

export const SessionSchema = object({
  id: string(),
  ticker: optional(ContractTickerSchema),
  frequency: optional(TradingFrequencySchema),
  selectedTime: optional(UTCTimestampSchema),
  layout: union([literal("grid"), literal("horizontal"), literal("vertical")]),
  draft: boolean(),
  backTest: optional(BackTestSchema),
  charts: record(TimeFrameSchema, ChartSchema),
  createdAt: UTCTimestampSchema,
  candles: record(
    CandlesIdSchema,
    object({
      currentCandle: optional(CandleSchema),
      entities: record(string(), CandleSchema),
      values: array(CandleSchema),
    }),
  ),
  indicators: record(
    TimeFrameSchema,
    object({
      volume: object({
        entities: record(string(), VolumeMASchema),
        values: array(VolumeMASchema),
      }),
      bollinger: object({
        entities: record(string(), BBandsSchema),
        values: array(BBandsSchema),
      }),
      volatility: object({
        entities: record(string(), VolatilitySchema),
        values: array(VolatilitySchema),
      }),
      phases: object({
        entities: record(string(), BBPhaseSchema),
        values: array(BBPhaseSchema),
      }),
    }),
  ),
});

export type Session = InferOutput<typeof SessionSchema> & {
  charts: Record<TimeFrame, Chart>;
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

type A = Session["charts"];

//
// Worker Events
//

export type CandleWorkerRequest =
  | { type: "initialize" }
  | {
      type: "fetch-candles";
      sender: string;
      data: StockPriceOption;
    };

export type CandleWorkerResponse =
  | { type: "initialized" }
  | {
      type: "candles-fetched";
      sender: string;
      data: Candle[];
    };

export type AnalyzerWorkerRequest = {
  type: "analyze";
  sender: string;
  kind: "start" | "update";
  data: {
    candles: Candle[];
    timeFrame: TimeFrame;
    frequency: TradingFrequency;
    previousAnalysis?: AnalyzerData;
  };
};

export type AnalyzerWorkerResponse = {
  type: "analyzed";
  sender: string;
  analysis: AnalyzerData;
  kind: "start" | "update";
  data: {
    volume: VolumeMA[];
    bollinger: BBands[];
    volatility: Volatility[];
    phases: BBPhase[];
  };
};

//
// State Saved
//

export const SaveStateSchema = object({
  sessions: object({
    ids: array(string()),
    current: string(),
    entities: record(string(), SessionSchema),
  }),
});

export type SaveState = {
  sessions: InferOutput<typeof SaveStateSchema>["sessions"] & { entities: Record<string, Session> };
};
