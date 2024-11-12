import { cn } from "@/libs/cn";
import { mergeProps } from "solid-js";
import { match } from "ts-pattern";

type FaRotate = "90" | "180" | "270" | "HFlip" | "VFlip";
type FaStyle = "Solid" | "Regular" | "Light" | "Thin" | "DuoTone";
type FaFamily = "Classic" | "Sharp" | "Brands";
type FaSize = "2xs" | "xs" | "sm" | "Parent" | "lg" | "xl" | "2xl";
type FaAnimate = "Beat" | "Fade" | "Beat-Fade" | "Bounce" | "Flip" | "Shake" | "Spin";

export type FaIconProps = {
  style?: FaStyle;
  family?: FaFamily;
  rotate?: FaRotate;
  size?: FaSize;
  animation?: FaAnimate;
  name: string;
  class?: string;
  classList?: Record<string, boolean>;
  onClick?: () => void;
};

export const FaIcon = (props: FaIconProps) => {
  const defaults = mergeProps(
    {
      style: "Solid" as FaStyle,
      family: "Classic" as FaFamily,
      size: "Parent" as FaSize,
      class: "",
      classList: {},
    },
    props,
  );

  const rotate = () =>
    match(defaults.rotate)
      .with("90", () => "fa-rotate-90")
      .with("180", () => "fa-rotate-180")
      .with("270", () => "fa-rotate-270")
      .with("HFlip", () => "fa-flip-horizontal")
      .with("VFlip", () => "fa-flip-vertical")
      .with(undefined, () => "")
      .exhaustive();

  const size = () =>
    match(defaults.size)
      .with("2xs", () => "fa-2xs")
      .with("xs", () => "fa-xs")
      .with("sm", () => "fa-sm")
      .with("Parent", () => "")
      .with("lg", () => "fa-lg")
      .with("xl", () => "fa-xl")
      .with("2xl", () => "fa-2xl")
      .exhaustive();

  const style = () =>
    match(defaults.style)
      .with("Solid", () => "fa-solid")
      .with("Regular", () => "fa-regular")
      .with("Light", () => "fa-light")
      .with("Thin", () => "fa-thin")
      .with("DuoTone", () => "fa-duotone")
      .exhaustive();

  const family = () =>
    match(defaults.family)
      .with("Classic", () => "fa-classic")
      .with("Brands", () => "fa-brands")
      .with("Sharp", () => "fa-sharp")
      .exhaustive();

  const animation = () =>
    match(defaults.animation)
      .with("Beat", () => "fa-beat")
      .with("Fade", () => "fa-fade")
      .with("Beat-Fade", () => "fa-beat-fade")
      .with("Bounce", () => "fa-bounce")
      .with("Flip", () => "fa-flip")
      .with("Shake", () => "fa-shake")
      .with("Spin", () => "fa-spin")
      .with(undefined, () => "")
      .exhaustive();

  return (
    <i
      onPointerDown={() => defaults.onClick?.()}
      class={cn(
        `${family()} ${style()} ${size()} ${rotate()} fa-${defaults.name} ${animation()}`,
        defaults.class,
      )}
      classList={defaults.classList}
    />
  );
};
