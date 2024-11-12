import type { User } from "@ashiso/core";
import { useAction, useLocation, useNavigate } from "@solidjs/router";
import { t } from "i18next";
import { createSignal } from "solid-js";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { FaIcon } from "~/components/ui/fa-icon";
import { ModeToggle } from "~/components/ui/toggle-theme";
import { logout } from "~/lib/interactions/actions";
import { cn } from "~/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { LangToggle } from "../ui/toggle-lang";
import { UserCard } from "./user-card";

const TabLink = (p: { to: string; text: string; icon: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate(p.to)}
      aria-selected={location.pathname === p.to ? true : undefined}
      class="flex-col gap-4 items-center hover:bg-transparent"
      variant={"ghost"}
    >
      <FaIcon name={p.icon} size="lg" />
      <span>{p.text}</span>
    </Button>
  );
};

const FullMenuLink = (p: { to: string; text: string; icon: string; onClick: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        navigate(p.to);
        p.onClick();
      }}
      aria-selected={location.pathname === p.to ? true : undefined}
      variant={"ghost"}
      class="justify-start gap-4"
    >
      <FaIcon name={p.icon} size="lg" />
      <span>{p.text}</span>
    </Button>
  );
};

export const MenuDrawer = (props: { user: User }) => {
  const [open, setOpen] = createSignal(false);
  const logoutAction = useAction(logout);

  return (
    <Sheet open={open()} onOpenChange={setOpen}>
      <SheetTrigger as={Button} size={"icon"} class="shrink-0 md:hidden" variant={"outline"}>
        <FaIcon name="bars" />
      </SheetTrigger>
      <SheetContent position={"bottom"} class="flex gap-0 flex-col p-0 bg-background md:hidden">
        <div class="flex gap-2 items-center p-4">
          <LangToggle />
          <ModeToggle />
        </div>
        <div class="flex flex-row justify-between items-center p-6 border-t border-border">
          <div class="flex flex-row gap-2 items-center">
            <Avatar>
              <AvatarImage src={props.user.avatar as string | undefined} />
              <AvatarFallback>{props.user.name?.[0] ?? "N/A"}</AvatarFallback>
            </Avatar>
            <UserCard mail={props.user.email} name={props.user.name} />
          </div>
          <Button class="gap-2" variant={"ghost"} onClick={logoutAction}>
            <span>{t("logout", { ns: "app" })}</span>
            <FaIcon name="arrow-right-from-bracket" class="rotate-180" />
          </Button>
        </div>
        <div class="flex flex-col gap-2 p-4 border-t border-border">
          <FullMenuLink
            onClick={() => setOpen(false)}
            to="/"
            text={t("home", { ns: "app" })}
            icon="table-columns"
          />
          <FullMenuLink
            onClick={() => setOpen(false)}
            to="/graph"
            text={t("session", { ns: "app" })}
            icon="chart-line"
          />
          <FullMenuLink
            onClick={() => setOpen(false)}
            to="/settings"
            text={t("settings", { ns: "app" })}
            icon="gear"
          />
          <FullMenuLink onClick={() => setOpen(false)} to="/profile" text="Profile" icon="user" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default function MobileMenu(props: { class?: string; user: User }) {
  return (
    <nav class={cn("flex h-24 items-center justify-evenly border-t border-border", props.class)}>
      <TabLink to="/" text={t("home", { ns: "app" })} icon="table-columns" />
      <TabLink to="/graph" text={t("session", { ns: "app" })} icon="chart-line" />
      <TabLink to="/settings" text={t("settings", { ns: "app" })} icon="gear" />
      <MenuDrawer user={props.user} />
    </nav>
  );
}
