import { AshisoLogo } from "@/components/icons/ashiso-logo";
import { useStore } from "@/libs/utils";
import { Title } from "@solidjs/meta";

export function Loading() {
  const { state } = useStore();

  return (
    <div class="flex flex-col justify-center items-center size-full">
      <Title>Loading...</Title>
      <AshisoLogo animate width={"100px"} height={"100px"} />
      <span class="text-muted-foreground text-sm">{state.app.loading}</span>
    </div>
  );
}
