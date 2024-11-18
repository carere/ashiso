import { Button } from "@/components/atoms/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { FaIcon } from "@/components/icons/fa-icon";
import { deleteSession } from "@/libs/store/events";
import { selectSessionById } from "@/libs/store/selectors";
import type { Session, TradingFrequency } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import i18next from "i18next";
import { type ComponentProps, Show } from "solid-js";
import { match } from "ts-pattern";

//TODO: Disable deprecated contracts

const NoContract = (props: { timeFrame?: TradingFrequency }) => (
  <span class="inline-flex items-center gap-2">
    <FaIcon name="arrow-right-arrow-left" />
    <span>/</span>
    <FaIcon name="coins" />
    <span>/</span>
    <Show when={props.timeFrame} fallback={<FaIcon name="clock" />}>
      {props.timeFrame}
    </Show>
  </span>
);

const SessionTabPreview = (props: { session: Session }) => {
  const { state } = useStore();
  const contract = () => props.session.ticker && state.contracts.entities[props.session.ticker];

  const cryptoLogo = () => {
    const c = contract();
    return c && state.cryptos.entities[c.base].logo;
  };

  return (
    <div class="flex items-center gap-4">
      <Show when={contract()} fallback={<NoContract />}>
        {(c) => (
          <span class="inline-flex items-center gap-2">
            <img
              class="w-3 h-3"
              src={`/exchange-logos/${c().exchange.toLowerCase()}.svg`}
              alt={c().exchange.toLowerCase()}
            />
            <span>/</span>
            <img
              class="w-3 h-3"
              src={cryptoLogo()}
              crossOrigin="anonymous"
              alt={c().base.toLowerCase()}
              onError={(event) => {
                event.currentTarget.src = "/default-crypto-logo.svg";
                event.currentTarget.onerror = null;
              }}
            />
            <span class="text-sm">{props.session.ticker?.split(":")[1]}</span>
            <span>/</span>
            <Show when={props.session.frequency} fallback={<FaIcon name="clock" />}>
              {(freq) =>
                match(freq())
                  .with("scalping", () => <FaIcon name="gauge-min" />)
                  .with("intra-day", () => <FaIcon name="gauge" />)
                  .with("swing", () => <FaIcon name="gauge-max" />)
                  .exhaustive()
              }
            </Show>
          </span>
        )}
      </Show>
      <Show when={props.session.draft}>
        -
        <span class="inline-flex items-center gap-2">
          <FaIcon name="edit" />
          Draft
        </span>
      </Show>
    </div>
  );
};

export const SessionTab = (props: ComponentProps<"div"> & { id: string }) => {
  const { state, dispatch } = useStore();
  const isLastSession = () => state.sessions.ids.length === 1;

  return (
    <Show when={selectSessionById(state.sessions, props.id)}>
      {(session) => (
        <div class={cn("flex flex-row gap-2", props.class)}>
          <SessionTabPreview session={session()} />
          <Tooltip placement="bottom">
            <TooltipTrigger
              as={Button}
              size={"icon"}
              class="h-6 w-6"
              variant={"ghost"}
              disabled={isLastSession()}
              onClick={(e: MouseEvent) => {
                dispatch(deleteSession(props.id));
                e.stopPropagation();
              }}
            >
              <FaIcon name="square-xmark" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18next.t("close_session", { ns: "app" })}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </Show>
  );
};
