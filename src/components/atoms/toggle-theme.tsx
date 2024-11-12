import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { FaIcon } from "@/components/icons/fa-icon";
import { useColorMode } from "@kobalte/core";
import { t } from "i18next";
import { Show } from "solid-js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function ToggleTheme() {
  const { setColorMode, colorMode } = useColorMode();

  return (
    <DropdownMenu placement="right">
      <DropdownMenuTrigger>
        <Tooltip placement="right">
          <TooltipTrigger as={Button} variant="ghost" size="sm" class="w-9 px-0">
            <Show when={colorMode() === "light"} fallback={<FaIcon name="moon" />}>
              <FaIcon name="sun" />
            </Show>
            <span class="sr-only">Toggle theme</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("theme_change", { ns: "app" })}</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setColorMode("light")}>
          <FaIcon name="sun" class="mr-2 h-4 w-4" />
          <span>{t("light", { ns: "app" })}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("dark")}>
          <FaIcon name="moon" class="mr-2 h-4 w-4" />
          <span>{t("dark", { ns: "app" })}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("system")}>
          <FaIcon name="laptop" class="mr-2 h-4 w-4" />
          <span>{t("system", { ns: "app" })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
