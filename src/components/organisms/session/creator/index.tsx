import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { FaIcon } from "@/components/icons/fa-icon";
import { launchSession } from "@/libs/store/events";
import type { CryptoCurrency, Exchange, Session, TradingFrequency } from "@/libs/types";
import { useStore } from "@/libs/utils";
import { type ComponentProps, Show } from "solid-js";
import { match } from "ts-pattern";
import { PairSelector } from "./pair-selector";
import { TimeFrameSelector } from "./time-frame-selector";

const ExchangeSummary = (props: { exchange?: Exchange }) => (
  <Show when={props.exchange} fallback={<span>N/A</span>}>
    {(e) => (
      <div class="flex flex-row gap-2 items-center">
        <img class="w-4 h-4" src={`/exchange-logos/${e()?.slug}.svg`} alt={e()?.slug} />
        <span>{e()?.name}</span>
      </div>
    )}
  </Show>
);

const CryptoSummary = (props: { crypto?: CryptoCurrency }) => (
  <Show when={props.crypto} fallback={<span>N/A</span>}>
    {(c) => (
      <div class="flex flex-row gap-2 items-center">
        <img
          class="w-4 h-4"
          src={c().logo}
          crossOrigin="anonymous"
          alt={c().ticker}
          onError={(event) => {
            event.currentTarget.src = "/default-crypto-logo.svg";
            event.currentTarget.onerror = null;
          }}
        />
        <span>{c().name}</span>
      </div>
    )}
  </Show>
);

const TimeFrameSummary = (props: { timeFrame?: TradingFrequency }) => (
  <Show when={props.timeFrame} fallback={<span>N/A</span>}>
    {(tf) => (
      <div class="flex flex-row gap-2 items-center">
        {match(tf())
          .with("scalping", () => <FaIcon name="gauge-min" />)
          .with("intra-day", () => <FaIcon name="gauge" />)
          .with("swing", () => <FaIcon name="gauge-max" />)
          .exhaustive()}
        <span>{tf()}</span>
      </div>
    )}
  </Show>
);

const SessionSummary = (props: { session?: Session }) => {
  const { state } = useStore();

  const contract = () => {
    if (props.session?.ticker) {
      return state.contracts.entities[props.session.ticker];
    }
  };

  const baseAsset = () => {
    const c = contract();
    if (c) return state.cryptos.entities[c.base];
  };

  const quoteAsset = () => {
    const c = contract();
    if (c) return state.cryptos.entities[c.quote];
  };

  const exchange = () => {
    const c = contract();
    if (c) return state.exchanges.entities[c.exchange];
  };

  return (
    <div class="flex w-full flex-col gap-4">
      <div class="flex justify-between items-center">
        <Label class="flex gap-2">
          <FaIcon name="arrow-right-arrow-left" /> Platform :
        </Label>
        <ExchangeSummary exchange={exchange()} />
      </div>
      <div class="flex justify-between items-center">
        <Label class="flex gap-2">
          <FaIcon name="coins" /> Base Asset :
        </Label>
        <CryptoSummary crypto={baseAsset()} />
      </div>
      <div class="flex justify-between items-center">
        <Label class="flex gap-2">
          <FaIcon name="coins" /> Quote Asset :
        </Label>
        <CryptoSummary crypto={quoteAsset()} />
      </div>
      <div class="flex justify-between items-center">
        <Label class="flex gap-2">
          <FaIcon name="clock" /> Time Frame :
        </Label>
        <TimeFrameSummary timeFrame={props.session?.frequency} />
      </div>
    </div>
  );
};

export const SessionCreator = (props: ComponentProps<"div"> & { id: string }) => {
  const { state, dispatch } = useStore();
  const session = () => state.sessions.entities[props.id];
  const pair = () => state.sessions.entities[props.id].ticker;
  const timeFrame = () => state.sessions.entities[props.id].frequency;

  return (
    <div class="w-full h-full flex flex-col lg:flex-row-reverse items-center justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent class="flex w-[300px] flex-col gap-4">
          <SessionSummary session={session()} />
        </CardContent>
      </Card>
      <Button
        size={"lg"}
        variant={"default"}
        class="gap-4"
        disabled={!pair() || !timeFrame()}
        onClick={() => dispatch(launchSession(props.id))}
      >
        Launch Session
        <FaIcon name="rocket" />
      </Button>
      <Card class="p-4">
        <CardContent class="p-0 flex flex-col gap-4">
          <PairSelector sessionId={props.id} />
          <TimeFrameSelector sessionId={props.id} />
        </CardContent>
      </Card>
    </div>
  );
};
