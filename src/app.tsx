import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { TransProvider } from "@mbarzda/solid-i18next";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

const storageManager = cookieStorageManagerSSR(document.cookie);

export default function App() {
  return (
    <TransProvider>
      <MetaProvider>
        <ColorModeScript storageType={storageManager.type} />
        <ColorModeProvider storageManager={storageManager}>
          <Router root={(props) => <Suspense>{props.children}</Suspense>}>
            <FileRoutes />
          </Router>
        </ColorModeProvider>
      </MetaProvider>
    </TransProvider>
  );
}
