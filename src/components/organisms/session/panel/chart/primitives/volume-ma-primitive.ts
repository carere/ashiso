import { getVmaData } from "@/libs/store/selectors";
import type { TimeFrame } from "@/libs/types";
import { useStore } from "@/libs/utils";
import type { ISeriesApi } from "lightweight-charts";
import { createEffect, onCleanup, onMount } from "solid-js";
import { VolumeMAIndicator } from "../indicators/volume-moving-average";

export const VolumeMAPrimitive = (
  series: ISeriesApi<"Histogram">,
  sessionId: string,
  timeFrame: TimeFrame,
) => {
  const { state } = useStore();

  const vma = getVmaData(state, sessionId, timeFrame);

  let vmaIndicator: VolumeMAIndicator | undefined;

  onMount(() => {
    vmaIndicator = new VolumeMAIndicator();
    vmaIndicator.setData(vma());
    series.attachPrimitive(vmaIndicator);

    onCleanup(() => {
      if (vmaIndicator) series.detachPrimitive(vmaIndicator);
    });
  });

  createEffect(() => {
    if (vmaIndicator) vmaIndicator.setData(vma());
  });
};
