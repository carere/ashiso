import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/atoms/dialog";
import { updateSessionTimeFrame } from "@/libs/store/events";
import type { TradingFrequency } from "@/libs/types";
import { useStore } from "@/libs/utils";
import Fuse from "fuse.js";
import { t } from "i18next";
import { debounce } from "radash";
import { For, createEffect, createSignal } from "solid-js";

type TimeFrameSummary = { type: TradingFrequency; description: string };

export const TimeFrameSelector = (props: { sessionId: string }) => {
  const { dispatch } = useStore();

  const timeFrames: TimeFrameSummary[] = [
    { type: "scalping", description: t("scalping_trading", { ns: "graph" }) },
    { type: "intra-day", description: t("intra_day_trading", { ns: "graph" }) },
    { type: "swing", description: t("swing_trading", { ns: "graph" }) },
  ];

  const [items, setItems] = createSignal(timeFrames);
  const [open, setOpen] = createSignal(false);
  const [input, setInput] = createSignal("");

  const fuse = new Fuse(timeFrames, {
    includeScore: false,
    minMatchCharLength: 2,
    threshold: 0.2,
    keys: ["type", "description"],
  });

  createEffect(() => {
    setItems(input() === "" ? timeFrames : fuse.search(input()).map(({ item }) => item));
  });

  const triggerSearch = debounce({ delay: 150 }, (timeFrame: TradingFrequency) =>
    setInput(timeFrame),
  );

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger as={Button} variant={"outline"} size={"lg"}>
        Select a Trading Time Frame
      </DialogTrigger>
      <DialogContent class="p-0 overflow-clip">
        <Command
          shouldFilter={false}
          class="[&_[cmdk-heading]]:px-2 [&_[cmdk-heading]]:font-medium [&_[cmdk-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5 [&_[cmdk-list]:not([hidden])_~[cmdk-list]]:pt-0 [&_[cmdk-list]]:p-2"
        >
          <CommandInput
            placeholder="Search for exchanges, cryptos, pairs..."
            value={input()}
            onValueChange={(tf) => triggerSearch(tf as TradingFrequency)}
          />
          <CommandList>
            <CommandEmpty>No time frames found</CommandEmpty>
            <For each={items()}>
              {(timeFrame) => (
                <CommandItem
                  value={timeFrame.type}
                  class="flex flex-col items-start gap-1"
                  onSelect={(timeFrame) => {
                    dispatch(
                      updateSessionTimeFrame({
                        tf: timeFrame as TradingFrequency,
                        id: props.sessionId,
                      }),
                    );
                    setOpen(false);
                  }}
                >
                  <span class="text-base">{timeFrame.type}</span>
                  <span class="text-foreground/60">{timeFrame.description}</span>
                </CommandItem>
              )}
            </For>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
