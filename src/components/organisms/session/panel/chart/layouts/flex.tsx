import type { GraphLayoutProps, Session } from "@/libs/types";
import { makePersisted } from "@solid-primitives/storage";
import Resizable, { type RootProps } from "corvu/resizable";
import { Match, Switch, createSignal } from "solid-js";
import { Chart } from "../";

export default function FlexLayout(
  props: GraphLayoutProps & { orientation: Omit<Session["layout"], "grid"> },
) {
  const size = () => +(1 / props.timeFrames.length);
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
        <Resizable
          sizes={sizes()}
          onSizesChange={setSizes}
          orientation={props.orientation as RootProps["orientation"]}
          class="size-full"
        >
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[0]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[1]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
        </Resizable>
      </Match>

      <Match when={props.timeFrames.length === 3}>
        <Resizable
          orientation={props.orientation as RootProps["orientation"]}
          class="size-full"
          sizes={sizes()}
          onSizesChange={setSizes}
        >
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[0]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[1]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[2]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
        </Resizable>
      </Match>

      <Match when={props.timeFrames.length === 4}>
        <Resizable
          orientation={props.orientation as RootProps["orientation"]}
          class="size-full"
          sizes={sizes()}
          onSizesChange={setSizes}
        >
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[0]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[1]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[2]}
              sessionId={props.sessionId}
              crossHair={props.crossHair}
              updateCrossHair={props.updateCrossHair}
            />
          </Resizable.Panel>
          <Resizable.Handle
            aria-label="Resize Handle"
            classList={{
              "px-1": props.orientation === "horizontal",
              "py-1": props.orientation === "vertical",
            }}
          />
          <Resizable.Panel initialSize={size()} minSize={0.1}>
            <Chart
              timeFrame={props.timeFrames[3]}
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
