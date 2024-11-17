import { Button } from "@/components/atoms/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";
import { ToggleLang } from "@/components/atoms/toggle-lang";
import { ToggleTheme } from "@/components/atoms/toggle-theme";
import { FaIcon } from "@/components/icons/fa-icon";
import { cn } from "@/libs/utils";
import { useLocation, useNavigate } from "@solidjs/router";
import { t } from "i18next";
import { type ComponentProps, createSignal } from "solid-js";

const Link = (p: { to: string; text: string; icon: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate(p.to)}
      class="flex-col gap-4 items-center hover:bg-transparent"
      variant={"ghost"}
    >
      <FaIcon name={p.icon} class={cn({ "text-brand": location.pathname === p.to })} size="lg" />
      <span class={cn({ "text-brand": location.pathname === p.to })}>{p.text}</span>
    </Button>
  );
};

export const MenuDrawer = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <Sheet open={open()} onOpenChange={setOpen}>
      <SheetTrigger as={Button} size={"icon"} class="shrink-0 md:hidden" variant={"outline"}>
        <FaIcon name="bars" />
      </SheetTrigger>
      <SheetContent side="bottom" class="flex gap-0 flex-col p-0 bg-background md:hidden">
        <div class="flex gap-2 items-center p-4">
          <ToggleLang />
          <ToggleTheme />
        </div>
        {/* <div class="flex flex-row justify-between items-center p-6 border-t border-border">
          <div class="flex flex-row gap-2 items-center">
            <Skeleton class="size-9 rounded-full" />
            <UserCard mail={props.user.email} name={props.user.name} />
          </div>
          <Button class="gap-2" variant={"ghost"} onClick={logoutAction}>
            <span>{t("logout", { ns: "app" })}</span>
            <FaIcon name="arrow-right-from-bracket" class="rotate-180" />
          </Button>
        </div> */}
      </SheetContent>
    </Sheet>
  );
};

export function MobileMenu(props: ComponentProps<"nav">) {
  return (
    <nav class={cn("flex h-24 items-center justify-evenly border-t border-border", props.class)}>
      <Link to="/" text={t("home", { ns: "app" })} icon="table-columns" />
      <Link to="/graph" text={t("session", { ns: "app" })} icon="chart-line" />
      <Link to="/settings" text={t("settings", { ns: "app" })} icon="gear" />
      <MenuDrawer />
    </nav>
  );
}
