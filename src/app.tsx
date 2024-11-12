import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { Suspense } from "solid-js";
import "./app.css";

const storageManager = cookieStorageManagerSSR(document.cookie);

await i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    lng: "en",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: true,
    },
    fallbackLng: false,
    ns: ["app", "sign-in", "graph"],
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default function App() {
  return (
    <MetaProvider>
      <ColorModeScript storageType={storageManager.type} />
      <ColorModeProvider storageManager={storageManager}>
        <Router root={(props) => <Suspense>{props.children}</Suspense>}>
          <FileRoutes />
        </Router>
      </ColorModeProvider>
    </MetaProvider>
  );
}
