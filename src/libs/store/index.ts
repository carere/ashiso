import type { Container } from "@/libs/types";
import { configureStore } from "@carere/solux";
import { updateBackTestCurrentTime, updateCurrentCandle } from "./events";
import { rootSlice } from "./slices";

export const createStore = (container: Container) =>
  configureStore({
    rootSlice,
    container,
    devtools: {
      options: { name: "Ashiso" },
      filterEvent: (event) =>
        event.type !== updateCurrentCandle.type && event.type !== updateBackTestCurrentTime.type,
    },
  });
