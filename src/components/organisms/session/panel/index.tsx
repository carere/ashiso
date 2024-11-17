import { createElementSize } from "@solid-primitives/resize-observer";
import {
  DragDropProvider,
  DragDropSensors,
  type Transformer,
  useDragDropContext,
} from "@thisbeyond/solid-dnd";
import { type Accessor, type ComponentProps, createEffect, createSignal } from "solid-js";
import { Controls } from "./controls";

const ConstrainDragAxis = (props: {
  draggable: Accessor<HTMLDivElement | undefined>;
  droppable: Accessor<HTMLDivElement | undefined>;
}) => {
  const transform = { x: 0, y: 0 };
  const droppableSize = createElementSize(props.droppable);
  const draggableSize = createElementSize(props.draggable);
  const [state, { onDragStart, onDragEnd, addTransformer, removeTransformer }] =
    useDragDropContext() as NonNullable<ReturnType<typeof useDragDropContext>>;

  createEffect(() => {
    const dragNode = props.draggable();

    if (droppableSize.width === null || draggableSize.width === null) return;

    if (dragNode && dragNode.offsetLeft + draggableSize.width > droppableSize.width) {
      dragNode.style.setProperty("left", `${droppableSize.width - draggableSize.width}px`);
    }

    if (dragNode && dragNode.offsetLeft < 0) {
      dragNode.style.setProperty("left", "0px");
    }
  });

  createEffect(() => {
    const dragNode = props.draggable();

    if (droppableSize.height === null || draggableSize.height === null) return;

    if (dragNode && dragNode.offsetTop < 0) {
      dragNode.style.setProperty("top", "0px");
    }
  });

  const transformer: Transformer = {
    id: "constrain-axis",
    order: 1,
    callback: (t) => {
      const dragNode = props.draggable();

      const cannotMoveFurtherRight =
        droppableSize.width !== null &&
        dragNode &&
        dragNode.offsetLeft + dragNode.offsetWidth + t.x > droppableSize.width;

      const cannotMoveFurtherLeft = dragNode && dragNode.offsetLeft + t.x < 0;

      const normalizedX = cannotMoveFurtherLeft
        ? -dragNode.offsetLeft
        : cannotMoveFurtherRight
          ? droppableSize.width - dragNode.offsetWidth - dragNode.offsetLeft
          : t.x;

      if (state.active.draggable) transform.x = normalizedX;

      return { x: normalizedX, y: 0 };
    },
  };

  onDragStart(({ draggable }) => {
    addTransformer("draggables", draggable.id, transformer);
  });

  onDragEnd(({ draggable }) => {
    const node = draggable.node;
    node.style.setProperty("top", `${node.offsetTop + transform.y}px`);
    node.style.setProperty("left", `${node.offsetLeft + transform.x}px`);
    removeTransformer("draggables", draggable.id, transformer.id);
  });

  return <></>;
};

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
