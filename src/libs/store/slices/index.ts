import { combineSlices } from "@carere/solux";
import { contractSlice } from "./contract.slice";
import { cryptoSlice } from "./crypto.slice";
import { exchangeSlice } from "./exchange.slice";

export const rootSlice = combineSlices({
  cryptos: cryptoSlice,
  exchanges: exchangeSlice,
  contracts: contractSlice,
});
