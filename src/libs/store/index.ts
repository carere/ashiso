import type { Container, SaveState } from "@/libs/types";
import { configureStore } from "@carere/solux";
import { saveStateEpic } from "./epics";
import { updateBackTestCurrentTime, updateCurrentCandle } from "./events";
import { rootSlice } from "./slices";

export const createStore = (container: Container, preloadedState?: SaveState) =>
  configureStore({
    preloadedState: { ...rootSlice.getInitialState(), ...(preloadedState ?? {}) },
    rootSlice,
    rootEpic: saveStateEpic,
    container,
    devtools: {
      options: { name: "Ashiso" },
      filterEvent: (event) =>
        event.type !== updateCurrentCandle.type && event.type !== updateBackTestCurrentTime.type,
    },
  });
