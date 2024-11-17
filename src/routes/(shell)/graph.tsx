import { Button } from "@/components/atoms/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { FaIcon } from "@/components/icons/fa-icon";
import { SessionCreator } from "@/components/organisms/session/creator";
import { SessionPanel } from "@/components/organisms/session/panel";
import { SessionTab } from "@/components/organisms/session/session-tab";
import { draftSession, switchSession } from "@/libs/store/events";
import { isDraftSession } from "@/libs/store/selectors";
import { useStore } from "@/libs/utils";
import { Title } from "@solidjs/meta";
import { t } from "i18next";
import { For, Show } from "solid-js";

//PERF: Keep alive session tabs (a la chrome)

export default function Chart() {
  const { state, dispatch } = useStore();
  const sessionIds = () => state.sessions.ids;
  const currentSession = () => state.sessions.current;

  return (
    <main class="size-full">
      <Title>Trading Sessions</Title>
      <Tabs
        value={currentSession()}
        class="h-full flex gap-4 md:gap-0 flex-col-reverse md:flex-col p-4 md:p-0"
      >
        <div class="flex flex-row items-center gap-4">
          <TabsList class="tab-list gap-1 overflow-x-scroll overflow-y-hidden justify-start">
            <For each={sessionIds()}>
              {(id) => (
                <TabsTrigger
                  class="shrink-0 bg-background/40"
                  onClick={() => dispatch(switchSession(id))}
                  value={id}
                >
                  <SessionTab id={id} />
                </TabsTrigger>
              )}
            </For>
          </TabsList>
          <Tooltip placement="right">
            <TooltipTrigger
              as={Button}
              size={"icon"}
              onClick={() => dispatch(draftSession())}
              class="h-6 w-6 shrink-0"
              variant={"secondary"}
            >
              <FaIcon name="plus" size="sm" />
            </TooltipTrigger>
            <TooltipContent>{t("add_session", { ns: "app" })}</TooltipContent>
          </Tooltip>
        </div>
        <For each={sessionIds()}>
          {(id) => (
            <TabsContent class="h-full" value={id}>
              <Show when={isDraftSession(state, id)} fallback={<SessionPanel id={id} />}>
                <SessionCreator id={id} />
              </Show>
            </TabsContent>
          )}
        </For>
      </Tabs>
    </main>
  );
}
