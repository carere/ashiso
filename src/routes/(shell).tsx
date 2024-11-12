import type { RouteSectionProps } from "@solidjs/router";

export default function Shell(props: RouteSectionProps) {
  return (
    <div class="flex flex-col items-center justify-center size-full">
      Shell Page
      <div class="w-40 h-40 bg-gray-800">{props.children}</div>
    </div>
  );
}
