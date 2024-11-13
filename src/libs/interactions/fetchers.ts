import type { MarketMetadata } from "@/libs/types";
import { query } from "@solidjs/router";

export const getMarketMetadata = query(async (): Promise<MarketMetadata> => {
  //TODO: Implement me
  throw new Error("Not Implemented");
}, "market-metadata");
