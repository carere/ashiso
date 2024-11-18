import type {
  BBPhase,
  BBands,
  BackTestSpeed,
  Candle,
  CandlesId,
  ContractTicker,
  IndicatorType,
  MarketMetadata,
  Session,
  TimeFrame,
  TradingFrequency,
  UTCTimestamp,
  Volatility,
  VolumeMA,
} from "@/libs/types";
import { createEvent } from "@carere/solux";

export const stateSaved = createEvent("stateSaved");
export const updateMarketMetadata = createEvent<MarketMetadata>("updateMarketMetadata");
export const loading = createEvent<string>("loading");

//
// Candles events
//

export const setCandles = createEvent<{
  sessionId: string;
  candlesId: CandlesId;
  candles: Candle[];
}>("setCandles");

export const updateCurrentCandle = createEvent<{
  sessionId: string;
  candlesId: CandlesId;
  candle: Candle;
}>("updateCurrentCandle");

export const addNewCandle = createEvent<{
  sessionId: string;
  candlesId: CandlesId;
  candle: Candle;
}>("addNewCandle");

//
// Indicators events
//

export const updateIndicators = createEvent<{
  sessionId: string;
  timeFrame: TimeFrame;
  kind: "start" | "update";
  data: {
    volume: VolumeMA[];
    bollinger: BBands[];
    volatility: Volatility[];
    phases: BBPhase[];
  };
}>("updateIndicators");

//
// Session events
//

export const draftSession = createEvent("draftSession");
export const launchSession = createEvent<string>("launchSession");
export const deleteSession = createEvent<string>("deleteSession");
export const switchSession = createEvent<string>("switchSession");

export const updateSessionTicker = createEvent<{ ticker: ContractTicker; id: string }>(
  "updateSessionTicker",
);

export const updateSessionTimeFrame = createEvent<{ tf: TradingFrequency; id: string }>(
  "updateSessionTimeFrame",
);

export const updateSessionTime = createEvent<{
  time: number;
  id: string;
}>("updateSessionTime");

export const clearSessionTime = createEvent<string>("clearSessionTime");

export const setLayout = createEvent<{
  layout: Session["layout"];
  id: string;
}>("setLayout");

//
// Session Charts
//

export const toggleChart = createEvent<{
  timeFrame: TimeFrame;
  sessionId: string;
}>("toggleChart");

export const toggleIndicator = createEvent<{
  indicator: IndicatorType;
  timeFrame: TimeFrame;
  sessionId: string;
}>("toggleIndicator");

export const selectChartTime = createEvent<{
  timeFrame: TimeFrame;
  sessionId: string;
  time: number;
}>("selectChartTime");

export const clearChartTime = createEvent<{
  timeFrame: TimeFrame;
  sessionId: string;
}>("clearChartTime");

export const fetching = createEvent<{
  timeFrame: TimeFrame;
  sessionId: string;
  fetching: boolean;
}>("fetching");

//
// Session BackTest events
//

export const toggleBackTest = createEvent<string>("toggleBackTest");

export const stopBackTest = createEvent<string>("stopBackTest");

export const initBackTest = createEvent<{ sessionId: string; startTime: UTCTimestamp }>(
  "initBackTest",
);

export const toggleBackTestRun = createEvent<string>("toggleBackTestRun");

export const toggleBackTestSelection = createEvent<string>("toggleBackTestSelection");

export const setBackTestSpeed = createEvent<{
  id: string;
  speed: BackTestSpeed;
}>("setBackTestSpeed");

export const updateBackTestCurrentTime = createEvent<{
  id: string;
  time: number;
}>("updateBackTestCurrentTime");
