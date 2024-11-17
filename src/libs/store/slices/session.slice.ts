import type {
  BackTest,
  Chart,
  ContractTicker,
  FetchResolution,
  Session,
  TradingFrequency,
  UTCTimestamp,
} from "@/libs/types";
import { getTinyUnitOfTimeToTradeOn, getUnitOfTimeForTrading } from "@/libs/utils";
import { createEntityAdapter, createSlice, nanoid } from "@carere/solux";
import { UTCDate } from "@date-fns/utc";
import { Dict } from "@swan-io/boxed";
import {
  addNewCandle,
  clearChartTime,
  clearSessionTime,
  deleteSession,
  draftSession,
  fetching,
  initBackTest,
  launchSession,
  selectChartTime,
  setBackTestSpeed,
  setCandles,
  setLayout,
  stopBackTest,
  switchSession,
  toggleBackTest,
  toggleBackTestRun,
  toggleBackTestSelection,
  toggleChart,
  toggleIndicator,
  updateBackTestCurrentTime,
  updateCurrentCandle,
  updateIndicators,
  updateSessionTicker,
  updateSessionTime,
  updateSessionTimeFrame,
} from "../events";

const generateInitialState = () => {
  const firstSessionId = nanoid();
  const initialState = sessionAdapter.getInitialState({
    current: firstSessionId,
  });
  sessionAdapter.addOne(initialState, {
    id: firstSessionId,
    draft: true,
    layout: "grid",
    charts: {},
    createdAt: new UTCDate().getTime() as UTCTimestamp,
    candles: {},
    indicators: {},
  });
  return initialState;
};

export const sessionAdapter = createEntityAdapter<Session>({
  selectId: (session) => session.id,
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

export const sessionSlice = createSlice({
  initialState: generateInitialState(),
  handlers: (builder) =>
    builder
      //
      // Session Management
      //
      .addHandler(draftSession, (state) => {
        const id = nanoid();
        sessionAdapter.addOne(state, {
          id,
          draft: true,
          layout: "grid",
          charts: {},
          createdAt: new UTCDate().getTime() as UTCTimestamp,
          candles: {},
          indicators: {},
        });
        state.current = id;
      })
      .addHandler(switchSession, (state, { payload: id }) => {
        state.current = id;
      })
      .addHandler(deleteSession, (state, { payload: id }) => {
        sessionAdapter.removeOne(state, id);
        if (state.current === id) {
          state.current = state.ids[state.ids.length - 1];
        }
      })
      .addHandler(updateSessionTicker, (state, { payload }) => {
        if (state.entities[payload.id].draft) {
          state.entities[payload.id].ticker = payload.ticker;
        }
      })
      .addHandler(updateSessionTimeFrame, (state, { payload }) => {
        if (state.entities[payload.id].draft) {
          state.entities[payload.id].frequency = payload.tf;
        }
      })
      .addHandler(clearSessionTime, (state, { payload }) => {
        state.entities[payload].selectedTime = undefined;
      })
      .addHandler(updateSessionTime, (state, { payload }) => {
        state.entities[payload.id].selectedTime = payload.time as UTCTimestamp;
      })
      .addHandler(setLayout, (state, { payload }) => {
        state.entities[payload.id].layout = payload.layout;
      })
      .addHandler(launchSession, (state, { payload: id }) => {
        const timeFrames = getTinyUnitOfTimeToTradeOn(
          state.entities[id].frequency as TradingFrequency,
        );
        const tradingTimeFrame = getUnitOfTimeForTrading(
          state.entities[id].frequency as TradingFrequency,
        );

        state.entities[id].charts = timeFrames.reduce(
          (acc, curr) => {
            const [multiplier, resolution] = curr.split("-");

            acc[curr] = {
              visible: tradingTimeFrame === curr,
              ticker: state.entities[id].ticker as ContractTicker,
              multiplier: +multiplier,
              fetching: false,
              resolution: resolution as FetchResolution,
              indicators: {
                volume: false,
                bollinger: false,
                volatility: false,
                phases: false,
              },
            } satisfies Chart;

            return acc;
          },
          {} as Session["charts"],
        );

        state.entities[id].draft = false;
      })
      //
      // BackTest Management
      //
      .addHandler(toggleBackTest, (state, { payload: id }) => {
        if (!state.entities[id].backTest) {
          state.entities[id].backTest = {
            running: false,
            selecting: true,
            speed: "1",
          };
        } else {
          state.entities[id].backTest = undefined;
        }
      })
      .addHandler(stopBackTest, (state, { payload: id }) => {
        state.entities[id].backTest = undefined;
      })
      .addHandler(initBackTest, (state, { payload }) => {
        (state.entities[payload.sessionId].backTest as BackTest).selecting = false;
        (state.entities[payload.sessionId].backTest as BackTest).running = false;
        (state.entities[payload.sessionId].backTest as BackTest).currentTime = undefined;
        state.entities[payload.sessionId].selectedTime = payload.startTime as UTCTimestamp;
      })
      .addHandler(toggleBackTestRun, (state, { payload: id }) => {
        (state.entities[id].backTest as BackTest).running = !(
          state.entities[id].backTest as BackTest
        ).running;
      })
      .addHandler(toggleBackTestSelection, (state, { payload: id }) => {
        (state.entities[id].backTest as BackTest).selecting = !(
          state.entities[id].backTest as BackTest
        ).selecting;
      })
      .addHandler(setBackTestSpeed, (state, { payload }) => {
        (state.entities[payload.id].backTest as BackTest).speed = payload.speed;
      })
      .addHandler(updateBackTestCurrentTime, (state, { payload }) => {
        (state.entities[payload.id].backTest as BackTest).currentTime =
          payload.time as UTCTimestamp;
      })
      //
      // Chart Management
      //
      .addHandler(toggleChart, (state, { payload: { sessionId, timeFrame } }) => {
        state.entities[sessionId].charts[timeFrame].visible =
          !state.entities[sessionId].charts[timeFrame].visible;
      })
      .addHandler(toggleIndicator, (state, { payload: { sessionId, timeFrame, indicator } }) => {
        state.entities[sessionId].charts[timeFrame].indicators[indicator] =
          !state.entities[sessionId].charts[timeFrame].indicators[indicator];
      })
      .addHandler(selectChartTime, (state, { payload: { sessionId, time, timeFrame } }) => {
        state.entities[sessionId].charts[timeFrame].selectedTime = time as UTCTimestamp;
      })
      .addHandler(clearChartTime, (state, { payload: { sessionId, timeFrame } }) => {
        state.entities[sessionId].charts[timeFrame].selectedTime = undefined;
      })
      .addHandler(fetching, (state, { payload: { sessionId, timeFrame, fetching } }) => {
        state.entities[sessionId].charts[timeFrame].fetching = fetching;
      })
      //
      // Candles Management
      //
      .addHandler(setCandles, (state, { payload: { sessionId, candlesId, candles } }) => {
        if (!state.entities[sessionId].candles[candlesId]) {
          state.entities[sessionId].candles[candlesId] = {
            entities: Object.fromEntries(candles.map((c) => [c.time, c])),
            values: candles,
          };
        } else {
          state.entities[sessionId].candles[candlesId].values = candles;
          state.entities[sessionId].candles[candlesId].entities = Object.fromEntries(
            candles.map((c) => [c.time, c]),
          );
        }
      })
      .addHandler(updateCurrentCandle, (state, { payload: { sessionId, candlesId, candle } }) => {
        if (!state.entities[sessionId].candles[candlesId]) {
          state.entities[sessionId].candles[candlesId] = {
            values: [],
            entities: {},
            currentCandle: candle,
          };
        } else {
          state.entities[sessionId].candles[candlesId].currentCandle = candle;
        }
      })
      .addHandler(addNewCandle, (state, { payload: { sessionId, candlesId, candle } }) => {
        if (!state.entities[sessionId].candles[candlesId]) {
          state.entities[sessionId].candles[candlesId] = {
            values: [],
            entities: { [candle.time]: candle },
            currentCandle: candle,
          };
        } else {
          state.entities[sessionId].candles[candlesId].entities[candle.time] = candle;
        }
      })
      //
      // Indicators
      //
      .addHandler(updateIndicators, (state, { payload: { sessionId, timeFrame, data, kind } }) => {
        const volumes = Dict.fromEntries(data.volume.map((v) => [v.time, v]));
        const bands = Dict.fromEntries(data.bollinger.map((b) => [b.time, b]));
        const cycles = Dict.fromEntries(data.volatility.map((v) => [v.time, v]));
        const phases = Dict.fromEntries(data.phases.map((p) => [p.time, p]));

        const indicators: Session["indicators"][typeof timeFrame] = {
          volume: {
            values:
              kind === "start"
                ? data.volume
                : state.entities[sessionId].indicators[timeFrame].volume.values.concat(data.volume),
            entities:
              kind === "start"
                ? volumes
                : {
                    ...state.entities[sessionId].indicators[timeFrame].volume.entities,
                    ...volumes,
                  },
          },
          bollinger: {
            values:
              kind === "start"
                ? data.bollinger
                : state.entities[sessionId].indicators[timeFrame].bollinger.values.concat(
                    data.bollinger,
                  ),
            entities:
              kind === "start"
                ? bands
                : {
                    ...state.entities[sessionId].indicators[timeFrame].bollinger.entities,
                    ...bands,
                  },
          },
          volatility: {
            values:
              kind === "start"
                ? data.volatility
                : state.entities[sessionId].indicators[timeFrame].volatility.values.concat(
                    data.volatility,
                  ),
            entities:
              kind === "start"
                ? cycles
                : {
                    ...state.entities[sessionId].indicators[timeFrame].volatility.entities,
                    ...cycles,
                  },
          },
          phases: {
            values:
              kind === "start"
                ? data.phases
                : state.entities[sessionId].indicators[timeFrame].phases.values.concat(data.phases),
            entities:
              kind === "start"
                ? phases
                : {
                    ...state.entities[sessionId].indicators[timeFrame].phases.entities,
                    ...phases,
                  },
          },
        };

        if (!state.entities[sessionId].indicators) {
          state.entities[sessionId].indicators = { [timeFrame]: indicators };
        } else state.entities[sessionId].indicators[timeFrame] = indicators;
      }),
});
