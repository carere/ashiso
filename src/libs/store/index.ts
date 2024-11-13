import { configureStore } from "@carere/solux";
import { rootSlice } from "./slices";

export const createStore = () =>
  configureStore({
    rootSlice,
    devtools: { options: { name: "Ashiso" } },
  });
