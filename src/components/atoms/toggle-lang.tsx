import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { EngFlag } from "@/components/icons/eng-flag";
import { FrenchFlag } from "@/components/icons/french-flag";
import i18next from "i18next";
import { Show, createSignal, onMount } from "solid-js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function ToggleLang() {
  const [lang, setLang] = createSignal(i18next.language);

  onMount(() => i18next.on("languageChanged", setLang));

  return (
    <DropdownMenu placement="right">
      <DropdownMenuTrigger>
        <Tooltip placement="right">
          <TooltipTrigger as={Button} variant="ghost" size="sm" class="w-9 px-0">
            <Show when={lang().includes("en")} fallback={<FrenchFlag class="h-4 w-4" />}>
              <EngFlag class="h-4 w-4" />
            </Show>
          </TooltipTrigger>
          <TooltipContent>
            <p>{i18next.t("lng_change", { ns: "app" })}</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => i18next.changeLanguage("en")}>
          <EngFlag class="mr-2 h-4 w-4" />
          <span>{i18next.t("english_label", { ns: "app" })}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => i18next.changeLanguage("fr")}>
          <FrenchFlag class="mr-2 h-4 w-4" />
          <span>{i18next.t("french_label", { ns: "app" })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
