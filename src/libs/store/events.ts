import { createEvent } from "@carere/solux";
import type { MarketMetadata } from "../types";

export const updateMarketMetadata = createEvent<MarketMetadata>("updateMarketMetadata");
export const loading = createEvent<string>("loading");
