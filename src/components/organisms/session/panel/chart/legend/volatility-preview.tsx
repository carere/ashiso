import { FaIcon } from "@/components/icons/fa-icon";
import type { TimeFrame, UTCTimestamp } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { Show } from "solid-js";

export const VolatilityPreview = (props: {
  sessionId: string;
  timeFrame: TimeFrame;
  time: number;
}) => {
  const { state } = useStore();

  const volatility = () =>
    state.sessions.entities[props.sessionId].indicators?.[props.timeFrame].volatility.entities[
      props.time as UTCTimestamp
    ]?.volatility;

  return (
    <Show
      when={volatility() !== undefined}
      fallback={<FaIcon size="xs" style="Regular" name="circle-question" />}
    >
      <span class="text-xs text-[#787B86]">{volatility()?.toFixed(2)}</span>
    </Show>
  );
};
