import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";
import { type ComponentProps, createSignal } from "solid-js";
import Controls from "./controls";
import { ConstrainDragAxis } from "./controls/constrain-drag-axis";

export const SessionPanel = (props: ComponentProps<"div"> & { id: string }) => {
  const [droppable, setDroppable] = createSignal<HTMLDivElement>();
  const [draggable, setDraggable] = createSignal<HTMLDivElement>();

  return (
    <DragDropProvider>
      <DragDropSensors />
      <ConstrainDragAxis draggable={draggable} droppable={droppable} />
      <div ref={setDroppable} class="relative flex items-end md:items-start gap-2 h-full w-full">
        {/* <GraphLayout sessionId={props.id} /> */}
        <Controls ref={setDraggable} sessionId={props.id} />
      </div>
    </DragDropProvider>
  );
};
