import { FaIcon } from "@/components/icons/fa-icon";
import type { CandlesId, TimeFrame, UTCTimestamp } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import { Show } from "solid-js";

export const VolumePreview = (props: { sessionId: string; timeFrame: TimeFrame; time: number }) => {
  const { state } = useStore();

  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
  });

  const candlesId = `${
    state.sessions.entities[props.sessionId].ticker
  }-${props.timeFrame}` as CandlesId;

  const candle = () =>
    state.sessions.entities[props.sessionId].candles[candlesId].entities[
      props.time as UTCTimestamp
    ];

  const vma = () =>
    state.sessions.entities[props.sessionId].indicators?.[props.timeFrame].volume.entities[
      props.time as UTCTimestamp
    ];

  const fallback = <FaIcon size="xs" style="Regular" name="circle-question" />;

  return (
    <>
      <Show when={vma()} fallback={fallback}>
        {(v) => <span class="text-xs text-[#f97316]">{formatter.format(v().value)}</span>}
      </Show>
      <Show when={candle()} fallback={fallback}>
        {(c) => (
          <span
            class={cn("text-xs", {
              "text-red-600": c().open >= c().close,
              "text-green-600": c().open <= c().close,
            })}
          >
            {formatter.format(c().volume)}
          </span>
        )}
      </Show>
    </>
  );
};
