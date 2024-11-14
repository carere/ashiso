import { createSlice } from "@carere/solux";
import { loading } from "../events";

export const appSlice = createSlice({
  initialState: {
    loading: "initializing app",
  },
  handlers: (builder) =>
    builder.addHandler(loading, (state, event) => {
      state.loading = event.payload;
    }),
});
