import type { CrossHair, TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { Show, createMemo, createSignal } from "solid-js";
import FlexLayout from "./flex";
import GridLayout from "./grid";

export const GraphLayout = (props: { sessionId: string }) => {
  const { state } = useStore();
  const [crossHair, updateCrossHair] = createSignal<CrossHair>();
  const layout = () => state.sessions.entities[props.sessionId].layout;

  const timeFrames = createMemo(() =>
    Object.entries(state.sessions.entities[props.sessionId].charts)
      .filter(([_, chart]) => chart.visible)
      .map(([tf]) => tf as TimeFrame),
  );

  return (
    <Show
      when={layout() === "grid"}
      fallback={
        <FlexLayout
          orientation={layout()}
          timeFrames={timeFrames()}
          sessionId={props.sessionId}
          crossHair={crossHair}
          updateCrossHair={updateCrossHair}
        />
      }
    >
      <GridLayout
        timeFrames={timeFrames()}
        sessionId={props.sessionId}
        crossHair={crossHair}
        updateCrossHair={updateCrossHair}
      />
    </Show>
  );
};
