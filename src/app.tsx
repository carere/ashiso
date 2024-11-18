import { createStore } from "@/libs/store";
import { SoluxProvider } from "@carere/solux";
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { Suspense } from "solid-js";
import "./app.css";
import { Loading } from "@/components/templates/loading";
import { Result } from "@swan-io/boxed";
import { parse } from "valibot";
import { binanceCryptoService } from "./libs/adapters/crypto.service";
import { ashisoExchangeFacade } from "./libs/adapters/exchange.facade";
import { binanceExchangeGateway } from "./libs/adapters/exchanges/binance/binance";
import { type Container, type ExchangeSlug, type SaveState, SaveStateSchema } from "./libs/types";

const storageManager = cookieStorageManagerSSR(document.cookie);

await i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: true,
    },
    fallbackLng: "en",
    ns: ["app", "sign-in", "graph"],
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default function App() {
  const container: Container = {
    cryptoService: binanceCryptoService(import.meta.env.VITE_BINANCE_API_URL),
    exchangeFacade: ashisoExchangeFacade({
      ["binance" as ExchangeSlug]: binanceExchangeGateway(
        import.meta.env.VITE_BINANCE_REST_API_URL,
        import.meta.env.VITE_BINANCE_WS_API_URL,
      ),
    }),
    candlesFetcher: new Worker(new URL("./libs/workers/candles.worker.ts", import.meta.url), {
      type: "module",
    }),
    analyzers: new Worker(new URL("./libs/workers/indicators.worker.ts", import.meta.url), {
      type: "module",
    }),
  };

  const preloadedState = Result.fromExecution(() =>
    parse(SaveStateSchema, JSON.parse(localStorage.getItem("ashiso-state") ?? "{}")),
  ).match({
    Error: () => undefined,
    Ok: (state) => state as SaveState,
  });

  return (
    <SoluxProvider store={createStore(container, preloadedState)}>
      <MetaProvider>
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider storageManager={storageManager}>
          <Router root={(props) => <Suspense fallback={<Loading />}>{props.children}</Suspense>}>
            <FileRoutes />
          </Router>
        </ColorModeProvider>
      </MetaProvider>
    </SoluxProvider>
  );
}
