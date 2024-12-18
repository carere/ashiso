import { updateMarketMetadata } from "@/libs/store/events";
import type { Exchange } from "@/libs/types";
import { createEntityAdapter, createSlice } from "@carere/solux";
import { Dict } from "@swan-io/boxed";

export const exchangeAdapter = createEntityAdapter<Exchange>({
  selectId: (e) => e.slug,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const exchangeSlice = createSlice({
  initialState: exchangeAdapter.getInitialState(),
  handlers: (builder) =>
    builder.addHandler(updateMarketMetadata, (state, event) => {
      exchangeAdapter.setAll(state, Dict.values(event.payload.exchanges));
    }),
});
