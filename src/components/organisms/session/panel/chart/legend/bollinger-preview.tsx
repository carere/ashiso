import { FaIcon } from "@/components/icons/fa-icon";
import type { TimeFrame, UTCTimestamp } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { subResolution } from "@/libs/utils";
import { UTCDate } from "@date-fns/utc";
import { Show } from "solid-js";

export const BollingerPreview = (props: {
  sessionId: string;
  timeFrame: TimeFrame;
  time: number;
}) => {
  const { state } = useStore();

  const resolution = state.sessions.entities[props.sessionId].charts[props.timeFrame].resolution;
  const multiplier = state.sessions.entities[props.sessionId].charts[props.timeFrame].multiplier;

  const sub = subResolution(resolution);

  const bol = () =>
    state.sessions.entities[props.sessionId].indicators?.[props.timeFrame].bollinger.entities[
      props.time as UTCTimestamp
    ];

  const prevBol = () =>
    state.sessions.entities[props.sessionId].indicators?.[props.timeFrame].bollinger.entities[
      sub(new UTCDate(props.time), multiplier).getTime() as UTCTimestamp
    ];

  return (
    <Show
      when={bol() && prevBol()}
      fallback={<FaIcon size="xs" style="Regular" name="circle-question" />}
    >
      <span class="text-xs">
        <span
          classList={{
            "text-[#2196F3]": bol().lower >= prevBol().lower,
            "text-[#F55253]": bol().lower <= prevBol().lower,
          }}
        >
          {bol().lower.toFixed(2)}
        </span>
        {" - "}
        <span class="text-[#4CAF50]">{bol().middle.toFixed(2)}</span>
        {" - "}
        <span
          classList={{
            "text-[#2196F3]": bol().upper >= prevBol().upper,
            "text-[#F55253]": bol().upper <= prevBol().upper,
          }}
        >
          {bol().upper.toFixed(2)}
        </span>
      </span>
    </Show>
  );
};
