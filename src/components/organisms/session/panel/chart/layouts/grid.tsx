import type { GraphLayoutProps } from "@/libs/types";
import { makePersisted } from "@solid-primitives/storage";
import Resizable from "corvu/resizable";
import { Match, Switch, createSignal } from "solid-js";
import { Chart } from "../";
import FlexLayout from "./flex";

export default function GridLayout(props: GraphLayoutProps) {
  const [sizes, setSizes] = makePersisted(createSignal<number[]>([]), {
    name: "resizable-sizes",
  });

  return (
    <Switch
      fallback={
        <Chart
          timeFrame={props.timeFrames[0]}
          sessionId={props.sessionId}
          crossHair={props.crossHair}
          updateCrossHair={props.updateCrossHair}
        />
      }
    >
      <Match when={props.timeFrames.length === 2}>
        <FlexLayout
          orientation="horizontal"
          timeFrames={props.timeFrames}
          sessionId={props.sessionId}
          crossHair={props.crossHair}
          updateCrossHair={props.updateCrossHair}
        />
      </Match>
      <Match when={props.timeFrames.length === 3}>
        <Resizable
          orientation="vertical"
          class="size-full"
          sizes={sizes()}
          onSizesChange={setSizes}
        >
          <Resizable.Panel initialSize={0.5} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[0]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle aria-label="Resize Handle" class="py-1" />
          <Resizable.Panel initialSize={0.5} minSize={0.1}>
            <FlexLayout
              orientation="horizontal"
              timeFrames={[props.timeFrames[1], props.timeFrames[2]]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
        </Resizable>
      </Match>
      <Match when={props.timeFrames.length === 4}>
        <Resizable
          orientation="vertical"
          class="size-full"
          sizes={sizes()}
          onSizesChange={setSizes}
        >
          <Resizable.Panel initialSize={0.5} minSize={0.1}>
            <FlexLayout
              orientation="horizontal"
              timeFrames={[props.timeFrames[0], props.timeFrames[1]]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle aria-label="Resize Handle" class="py-1" />
          <Resizable.Panel initialSize={0.5} minSize={0.1}>
            <FlexLayout
              orientation="horizontal"
              timeFrames={[props.timeFrames[2], props.timeFrames[3]]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
        </Resizable>
      </Match>
    </Switch>
  );
}
