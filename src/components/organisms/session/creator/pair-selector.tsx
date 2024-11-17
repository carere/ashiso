import { Button } from "@/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/atoms/dialog";
import { updateSessionTicker } from "@/libs/store/events";
import type { Contract, ContractTicker } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { Dict } from "@swan-io/boxed";
import Fuse from "fuse.js";
import { debounce, omit, pick } from "radash";
import { For, createMemo, createSignal } from "solid-js";

const DesktopPairInfo = (props: Pick<Contract, "name" | "ticker" | "base"> & { logo?: string }) => (
  <div class="hidden flex-grow md:grid grid-cols-[1.3fr_1fr]">
    <div class="flex gap-2 items-center">
      <img
        class="w-5 h-5"
        src={props.logo}
        crossOrigin="anonymous"
        alt={props.base}
        onError={(event) => {
          event.currentTarget.src = "/default-crypto-logo.svg";
          event.currentTarget.onerror = null;
        }}
      />
      <span class="text-sm">{props.ticker.split(":")[1]}</span>
    </div>
    <span>{props.name}</span>
  </div>
);

const MobilePairInfo = (props: Pick<Contract, "name" | "ticker" | "base"> & { logo?: string }) => (
  <div class="flex flex-row flex-grow gap-3 items-center md:hidden">
    <img
      class="w-5 h-5"
      src={props.logo}
      crossOrigin="anonymous"
      alt={props.base}
      onError={(event) => {
        event.currentTarget.src = "/default-crypto-logo.svg";
        event.currentTarget.onerror = null;
      }}
    />
    <div class="flex flex-col">
      <span>{props.ticker}</span>
      <span class="text-sm text-neutral-500 dark:text-neutral-600">{props.name}</span>
    </div>
  </div>
);

const ContractPreview = (props: Pick<Contract, "ticker" | "base" | "name" | "exchange">) => {
  const { state } = useStore();
  const baseLogo = () => state.cryptos.entities[props.base].logo;

  return (
    <div class="flex w-full justify-between py-2 px-3 text-sm font-medium transition-colors text-text">
      <DesktopPairInfo {...pick(props, ["name", "ticker", "base"])} logo={baseLogo()} />
      <MobilePairInfo {...pick(props, ["name", "ticker", "base"])} logo={baseLogo()} />
      <div class="flex flex-row gap-2 justify-end items-center">
        <span class="text-xs">{props.exchange.toUpperCase()}</span>
        <img
          class="w-4 h-4"
          src={`/exchange-logos/${props.exchange.toLowerCase()}.svg`}
          alt={props.exchange}
        />
      </div>
    </div>
  );
};

export const PairSelector = (props: { sessionId: string }) => {
  const { dispatch, state } = useStore();
  const [open, setOpen] = createSignal(false);
  const [input, setInput] = createSignal("");

  const searchableContracts = createMemo(() => {
    const result = [] as Pick<Contract, "ticker" | "base" | "quote" | "name" | "exchange">[];
    const metadataContracts = Dict.values(state.contracts.entities);

    for (const contract of metadataContracts) {
      result.push(pick(contract, ["ticker", "base", "name", "quote", "exchange"]));
    }

    return result;
  });

  const contracts = createMemo(() => {
    const fuse = new Fuse(searchableContracts(), {
      keys: ["symbol", "base", "quote", "name", "exchange"],
      minMatchCharLength: 2,
      threshold: 0.2,
    });

    return input() === "" ? searchableContracts() : fuse.search(input()).map((i) => i.item);
  });

  const triggerSearch = debounce({ delay: 150 }, (ticker: ContractTicker) => setInput(ticker));

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger as={Button} variant={"outline"} size={"lg"}>
        Select a pair
      </DialogTrigger>
      <DialogContent class="p-0 overflow-clip">
        <Command
          shouldFilter={false}
          class="[&_[cmdk-heading]]:px-2 [&_[cmdk-heading]]:font-medium [&_[cmdk-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5 [&_[cmdk-list]:not([hidden])_~[cmdk-list]]:pt-0 [&_[cmdk-list]]:p-2"
        >
          <CommandInput
            placeholder="Search for exchanges, cryptos, pairs..."
            value={input()}
            onValueChange={(value) => triggerSearch(value as ContractTicker)}
          />
          <CommandList>
            <CommandEmpty>No tickers found</CommandEmpty>
            <For each={contracts()}>
              {(contract) => (
                <CommandItem
                  value={contract.ticker}
                  onSelect={(ticker) => {
                    dispatch(
                      updateSessionTicker({
                        ticker: ticker as ContractTicker,
                        id: props.sessionId,
                      }),
                    );
                    setOpen(false);
                  }}
                >
                  <ContractPreview {...omit(contract, ["quote"])} />
                </CommandItem>
              )}
            </For>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
