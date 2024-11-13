import type { AppError, CryptoCurrency, CryptoTicker } from "@/libs/types";
import { Future, type Result } from "@swan-io/boxed";
import xior from "xior";

export type CryptoService = {
  import(): Future<Result<CryptoCurrency[], AppError>>;
};

type BinanceCryptoServiceResponse = {
  data: {
    assetCode: string;
    assetName: string;
    logoUrl: string;
    fullLogoUrl: string;
  }[];
};

export const binanceCryptoService = (baseUrl: string): CryptoService => {
  const xiorInstance = xior.create({ baseURL: baseUrl });

  return {
    import: () =>
      Future.fromPromise(
        xiorInstance.get<BinanceCryptoServiceResponse>("/asset/asset/get-all-asset"),
      )
        .mapError(
          (error: unknown): AppError => ({
            kind: "CryptoServiceError",
            message: `CryptoService (import): ${(error as Error).message}`,
          }),
        )
        .mapOk(({ data: { data: assets } }) => {
          const cryptos: CryptoCurrency[] = [];
          for (const asset of assets) {
            cryptos.push({
              ticker: asset.assetCode as CryptoTicker,
              name: asset.assetName,
              logo: asset.logoUrl,
            });
          }
          return cryptos;
        }),
  };
};
