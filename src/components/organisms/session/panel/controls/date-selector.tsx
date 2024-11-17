import { Button } from "@/components/atoms/button";
import { DatePicker } from "@/components/atoms/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { FaIcon } from "@/components/icons/fa-icon";
import { clearSessionTime, updateSessionTime } from "@/libs/store/events";
import { getSessionTicker } from "@/libs/store/selectors";
import type { ContractTicker } from "@/libs/types";
import { cn, useStore } from "@/libs/utils";
import { UTCDate } from "@date-fns/utc";
import { createMediaQuery } from "@solid-primitives/media";
import { t } from "i18next";
import { type ComponentProps, createSignal } from "solid-js";

export const DateSelector = (props: ComponentProps<"button"> & { sessionId: string }) => {
  const [open, setOpen] = createSignal(false);
  const { state, dispatch } = useStore();
  const isSmall = createMediaQuery("(max-width: 768px)");

  const contract = () =>
    state.contracts.entities[getSessionTicker(state, props.sessionId) as ContractTicker];

  return (
    <div class={cn(props.class)}>
      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger as={Button} class="rounded-none" variant={"ghost"} size={"icon"}>
          <FaIcon name="calendar-days" />
        </PopoverTrigger>
        <PopoverContent class="p-0 w-auto border-none">
          <DatePicker
            minDate={new UTCDate(contract().onboardDate)}
            onSelect={(date) => {
              dispatch(
                updateSessionTime({
                  id: props.sessionId,
                  time: date.getTime(),
                }),
              );
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <Tooltip placement={isSmall() ? "left" : "bottom"}>
        <TooltipTrigger
          as={Button}
          class="rounded-none"
          variant={"ghost"}
          size={"icon"}
          onClick={() => dispatch(clearSessionTime(props.sessionId))}
        >
          <FaIcon name="forward-fast" />
        </TooltipTrigger>
        <TooltipContent>{t("go_to_now", { ns: "app" })}</TooltipContent>
      </Tooltip>
    </div>
  );
};
