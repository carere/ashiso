import type { ComponentProps } from "solid-js";

export const FrenchFlag = (props: ComponentProps<"svg">) => (
  <svg class={props.class} viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>French Flag</title>
    <g id="flag">
      <g id="contents">
        <path
          id="bottom"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M16.8 0H24V18H16.8V0Z"
          fill="#F50100"
        />
        <path
          id="left"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 0H8.4V18H0V0Z"
          fill="#2E42A5"
        />
        <path
          id="middle"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.19995 0H16.8V18H7.19995V0Z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
