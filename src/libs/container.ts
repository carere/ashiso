import { binanceCryptoService } from "@/libs/adapters/crypto.service";
import { ashisoExchangeFacade } from "@/libs/adapters/exchange.facade";
import { binanceExchangeGateway } from "@/libs/adapters/exchanges/binance";
import type { Container, ExchangeSlug } from "@/libs/types";

export const container: Container = {
  cryptoService: binanceCryptoService(import.meta.env.VITE_BINANCE_API_URL),
  exchangeFacade: ashisoExchangeFacade({
    ["binance" as ExchangeSlug]: binanceExchangeGateway(import.meta.env.VITE_BINANCE_REST_API_URL),
  }),
};
