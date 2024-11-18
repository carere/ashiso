import { Button } from "@/components/atoms/button";
import { ToggleLang } from "@/components/atoms/toggle-lang";
import { ToggleTheme } from "@/components/atoms/toggle-theme";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { AshisoLogo } from "@/components/icons/ashiso-logo";
import { FaIcon } from "@/components/icons/fa-icon";
import { cn } from "@/libs/utils";
import { useLocation, useNavigate } from "@solidjs/router";
import { t } from "i18next";
import type { ComponentProps } from "solid-js";

const Link = (p: { to: string; text: string; icon: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Tooltip placement="right">
      <TooltipTrigger
        as={Button}
        onClick={() => navigate(p.to)}
        data-selected={location.pathname === p.to}
        class={cn({
          "text-brand": location.pathname === p.to,
        })}
        size="icon"
        variant="ghost"
      >
        <FaIcon name={p.icon} size="lg" style="Regular" />
      </TooltipTrigger>
      <TooltipContent>{p.text}</TooltipContent>
    </Tooltip>
  );
};

export const DesktopMenu = (props: ComponentProps<"div">) => {
  return (
    <aside
      class={cn("flex overflow-hidden flex-col items-start px-2 pb-2 bg-background", props.class)}
    >
      <AshisoLogo class="w-10 h-10" />
      <nav class="flex flex-col gap-2 items-stretch mt-8">
        <Link to="/" text={t("home", { ns: "app" })} icon="home" />
        <Link to="/graph" text={t("session", { ns: "app" })} icon="chart-line" />
        <Link to="/settings" text={t("settings", { ns: "app" })} icon="gear" />
      </nav>
      <div class="flex flex-col gap-2 items-center mt-auto">
        <ToggleLang />
        <ToggleTheme />
        <div class="flex size-9 border border-border justify-center items-center rounded-full">
          <FaIcon name="right-to-bracket" size="sm" style="DuoTone" />
        </div>
      </div>
    </aside>
  );
};
