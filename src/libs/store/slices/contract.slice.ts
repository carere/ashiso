import { updateMarketMetadata } from "@/libs/store/events";
import type { Contract } from "@/libs/types";
import { createEntityAdapter, createSlice } from "@carere/solux";

export const contractAdapter = createEntityAdapter<Contract>({
  selectId: (c) => c.ticker,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const contractSlice = createSlice({
  initialState: contractAdapter.getInitialState(),
  handlers: (builder) =>
    builder.addHandler(updateMarketMetadata, (state, event) => {
      contractAdapter.setAll(state, Object.values(event.payload.contracts));
    }),
});
