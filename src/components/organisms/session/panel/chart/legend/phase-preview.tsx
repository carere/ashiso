import { FaIcon } from "@/components/icons/fa-icon";
import type { TimeFrame, UTCTimestamp } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { Show } from "solid-js";

export const PhasePreview = (props: { sessionId: string; timeFrame: TimeFrame; time: number }) => {
  const { state } = useStore();

  const phase = () =>
    state.sessions.entities[props.sessionId].indicators?.[props.timeFrame].phases.entities[
      props.time as UTCTimestamp
    ]?.phase;

  return (
    <Show when={phase()} fallback={<FaIcon size="xs" style="Regular" name="circle-question" />}>
      <span class="text-xs">{phase()}</span>
    </Show>
  );
};
