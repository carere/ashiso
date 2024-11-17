import { FaIcon } from "@/components/icons/fa-icon";
import type { CandlesId, TimeFrame, UTCTimestamp } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";

export const PairPreview = (props: {
  sessionId: string;
  timeFrame: TimeFrame;
  time: number;
}) => {
  const { state } = useStore();

  const candlesId = `${
    state.sessions.entities[props.sessionId].ticker
  }-${props.timeFrame}` as CandlesId;

  const candle = () =>
    state.sessions.entities[props.sessionId].candles[candlesId]?.entities[
      props.time as UTCTimestamp
    ];

  const open = () => candle()?.open ?? <FaIcon size="xs" style="Regular" name="circle-question" />;
  const high = () => candle()?.high ?? <FaIcon size="xs" style="Regular" name="circle-question" />;
  const low = () => candle()?.low ?? <FaIcon size="xs" style="Regular" name="circle-question" />;
  const close = () =>
    candle()?.close ?? <FaIcon size="xs" style="Regular" name="circle-question" />;
  const direction = () => {
    const c = candle();
    return !c ? "none" : c.open >= c.close ? "down" : "up";
  };

  return (
    <div class="flex flex-col gap-1">
      <div class="flex gap-1 items-center text-xs">
        <span>{props.timeFrame.replace("-", " ")}</span>
        <FaIcon class="mx-2" name="circle-dot" size="xs" style="Light" />O
        <span
          class={cn("text-gray-500", {
            "text-red-600": direction() === "down",
            "text-green-600": direction() === "up",
          })}
        >
          {open()}
        </span>
        H
        <span
          class={cn("text-gray-500", {
            "text-red-600": direction() === "down",
            "text-green-600": direction() === "up",
          })}
        >
          {high()}
        </span>
        L
        <span
          class={cn("text-gray-500", {
            "text-red-600": direction() === "down",
            "text-green-600": direction() === "up",
          })}
        >
          {low()}
        </span>
        C
        <span
          class={cn("text-gray-500", {
            "text-red-600": direction() === "down",
            "text-green-600": direction() === "up",
          })}
        >
          {close()}
        </span>
      </div>
    </div>
  );
};
