import { updateMarketMetadata } from "@/libs/store/events";
import type { CryptoCurrency } from "@/libs/types";
import { createEntityAdapter, createSlice } from "@carere/solux";
import { Dict } from "@swan-io/boxed";

export const cryptoAdapter = createEntityAdapter<CryptoCurrency>({
  selectId: (c) => c.ticker,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const cryptoSlice = createSlice({
  initialState: cryptoAdapter.getInitialState(),
  handlers: (builder) =>
    builder.addHandler(updateMarketMetadata, (state, event) => {
      cryptoAdapter.setAll(state, Dict.values(event.payload.cryptos));
    }),
});
