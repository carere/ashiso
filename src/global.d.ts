/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly VITE_BINANCE_REST_API_URL: string;
  readonly VITE_BINANCE_WS_API_URL: string;
  readonly VITE_BINANCE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
