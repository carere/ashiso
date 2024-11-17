import { combineSlices } from "@carere/solux";
import { appSlice } from "./app.slice";
import { contractSlice } from "./contract.slice";
import { cryptoSlice } from "./crypto.slice";
import { exchangeSlice } from "./exchange.slice";
import { sessionSlice } from "./session.slice";

export const rootSlice = combineSlices({
  app: appSlice,
  cryptos: cryptoSlice,
  exchanges: exchangeSlice,
  contracts: contractSlice,
  sessions: sessionSlice,
});
