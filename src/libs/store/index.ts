import type { Container } from "@/libs/types";
import { configureStore } from "@carere/solux";
import { rootSlice } from "./slices";

export const createStore = (container: Container) =>
  configureStore({
    rootSlice,
    container,
    devtools: { options: { name: "Ashiso" } },
  });
