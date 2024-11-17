import { pick } from "radash";
import { match } from "ts-pattern";
import type {
  AnalyzerWorkerRequest,
  AnalyzerWorkerResponse,
  BBPhase,
  BBands,
  Volatility,
  VolumeMA,
} from "../types";
import { Analyzer } from "../utils/analyzer";

addEventListener("message", (event) => {
  match<AnalyzerWorkerRequest>(event.data)
    .with({ type: "analyze" }, async ({ data, sender, kind }) => {
      console.log("[Indicator Worker] Get Analysis", sender);

      const analyzer = new Analyzer(18, data?.previousAnalysis);

      const volumes: VolumeMA[] = [];
      const bBands: BBands[] = [];
      const volatility: Volatility[] = [];
      const phases: BBPhase[] = [];

      for (const candle of data.candles) {
        const { vma, bbInfos } = analyzer.analyze(candle);
        if (vma) volumes.push(vma);
        if (bbInfos) {
          bBands.push(pick(bbInfos, ["lower", "middle", "upper", "time"]));
          if (bbInfos.phase) phases.push(pick(bbInfos, ["time", "phase"]));
          if (bbInfos.volatility !== undefined) {
            volatility.push(pick(bbInfos, ["time", "volatility"]));
          }
        }
      }

      postMessage({
        type: "analyzed",
        sender,
        kind,
        analysis: analyzer.export(),
        data: {
          volume: volumes,
          bollinger: bBands,
          volatility,
          phases,
        },
      } satisfies AnalyzerWorkerResponse);
    })
    .exhaustive();
});
