import type { ComponentProps } from "solid-js";

export const EngFlag = (props: ComponentProps<"svg">) => (
  <svg class={props.class} viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>English Flag</title>
    <g id="flag">
      <g id="contents">
        <path
          id="background"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 0V18H24V0H0Z"
          fill="#2E42A5"
        />
        <mask
          id="mask0_4022_77191"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="18"
        >
          <path
            id="background_2"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 0V18H24V0H0Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_4022_77191)">
          <g id="mark 1">
            <g id="contents_2">
              <g id="stripe">
                <path
                  id="white"
                  d="M-2.67236 16.7141L2.6089 18.9476L24.1198 2.42839L26.9056 -0.890726L21.258 -1.63724L12.4842 5.48136L5.42223 10.2776L-2.67236 16.7141Z"
                  fill="white"
                />
                <path
                  id="red"
                  d="M-1.94946 18.2789L0.741099 19.5751L25.9051 -1.1991H22.1273L-1.94946 18.2789Z"
                  fill="#F50100"
                />
              </g>
              <g id="stripe_2">
                <path
                  id="white_2"
                  d="M26.6724 16.7141L21.3911 18.9476L-0.119831 2.42839L-2.90558 -0.890726L2.74198 -1.63724L11.5158 5.48136L18.5778 10.2776L26.6724 16.7141Z"
                  fill="white"
                />
                <path
                  id="red_2"
                  d="M26.4922 17.8372L23.8016 19.1333L13.0865 10.2388L9.90973 9.24505L-3.1736 -0.879345H0.604261L13.6802 9.00474L17.1535 10.1964L26.4922 17.8372Z"
                  fill="#F50100"
                />
              </g>
              <g id="cross">
                <g id="red_3">
                  <mask id="path-7-inside-1_4022_77191" fill="white">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M14.8334 -1.5H9.16677V6H-1.47925V12H9.16677V19.5H14.8334V12H25.5208V6H14.8334V-1.5Z"
                    />
                  </mask>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.8334 -1.5H9.16677V6H-1.47925V12H9.16677V19.5H14.8334V12H25.5208V6H14.8334V-1.5Z"
                    fill="#F50100"
                  />
                  <path
                    d="M9.16677 -1.5V-2.75H7.91677V-1.5H9.16677ZM14.8334 -1.5H16.0834V-2.75H14.8334V-1.5ZM9.16677 6V7.25H10.4168V6H9.16677ZM-1.47925 6V4.75H-2.72925V6H-1.47925ZM-1.47925 12H-2.72925V13.25H-1.47925V12ZM9.16677 12H10.4168V10.75H9.16677V12ZM9.16677 19.5H7.91677V20.75H9.16677V19.5ZM14.8334 19.5V20.75H16.0834V19.5H14.8334ZM14.8334 12V10.75H13.5834V12H14.8334ZM25.5208 12V13.25H26.7708V12H25.5208ZM25.5208 6H26.7708V4.75H25.5208V6ZM14.8334 6H13.5834V7.25H14.8334V6ZM9.16677 -0.25H14.8334V-2.75H9.16677V-0.25ZM10.4168 6V-1.5H7.91677V6H10.4168ZM-1.47925 7.25H9.16677V4.75H-1.47925V7.25ZM-0.229248 12V6H-2.72925V12H-0.229248ZM9.16677 10.75H-1.47925V13.25H9.16677V10.75ZM10.4168 19.5V12H7.91677V19.5H10.4168ZM14.8334 18.25H9.16677V20.75H14.8334V18.25ZM13.5834 12V19.5H16.0834V12H13.5834ZM25.5208 10.75H14.8334V13.25H25.5208V10.75ZM24.2708 6V12H26.7708V6H24.2708ZM14.8334 7.25H25.5208V4.75H14.8334V7.25ZM13.5834 -1.5V6H16.0834V-1.5H13.5834Z"
                    fill="white"
                    mask="url(#path-7-inside-1_4022_77191)"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);
