import { AshisoLogo } from "@/components/icons/ashiso-logo";
import { Title } from "@solidjs/meta";

export default function Loading() {
  return (
    <div class="flex flex-col justify-center items-center size-full">
      <AshisoLogo animate width={"100px"} height={"100px"} />
      <Title>Loading...</Title>
    </div>
  );
}
