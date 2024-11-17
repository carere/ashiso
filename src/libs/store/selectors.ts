import { sessionAdapter } from "@/libs/store/slices/session.slice";
import type { RootState, TimeFrame, TradingFrequency } from "@/libs/types";
import { Dict } from "@swan-io/boxed";
import { getTinyUnitOfTimeToTradeOn } from "../utils";

export const { selectById: selectSessionById } = sessionAdapter.getSelectors();
export const isDraftSession = (state: RootState, id: string) => state.sessions.entities[id].draft;
export const getSessionChartByTf = (state: RootState, id: string, tf: TimeFrame) =>
  state.sessions.entities[id].charts[tf];

export const getSessionTicker = (state: RootState, id: string) =>
  state.sessions.entities[id].ticker;

export const getSessionActiveTimeFrame = (state: RootState, id: string): TimeFrame[] =>
  Dict.values(state.sessions.entities[id].charts)
    .filter((c) => c.visible)
    .map((c) => `${c.multiplier}-${c.resolution}` satisfies TimeFrame);

export const getLowestTimeFrame = (state: RootState, sessionId: string) => {
  const activeTimeFrames = getSessionActiveTimeFrame(state, sessionId);
  const frequency = state.sessions.entities[sessionId].frequency as TradingFrequency;
  const unitOfTimes = getTinyUnitOfTimeToTradeOn(frequency);
  let result: TimeFrame = "1-m";

  for (const uOt of unitOfTimes) {
    if (activeTimeFrames.includes(uOt)) {
      result = uOt;
      break;
    }
  }

  return result;
};

//
// BackTest
//

export const isBackTestRunning = (state: RootState, id: string) =>
  Boolean(state.sessions.entities[id].backTest?.running);

export const isBackTestSession = (state: RootState, id: string) =>
  state.sessions.entities[id].backTest;

export const isBackTestStartSelected = (state: RootState, id: string) =>
  Boolean(state.sessions.entities[id].selectedTime) ||
  Boolean(state.sessions.entities[id].backTest?.currentTime);
