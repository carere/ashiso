/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly VITE_BINANCE_REST_API_URL: string;
  readonly VITE_BINANCE_API_URL: string;
  readonly VITE_CRYPTO_FONTS_CRYPTOS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
