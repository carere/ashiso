import { UTCDate } from "@date-fns/utc";
import AirDatepicker from "air-datepicker";
import localeEn from "air-datepicker/locale/en";
import { createEffect, onCleanup, onMount } from "solid-js";
import "@/date-picker.css";

export const DatePicker = (props: {
  onSelect: (date: UTCDate) => void;
  minDate: UTCDate;
}) => {
  let datePickerContainer: HTMLDivElement | undefined;
  let datePicker: AirDatepicker<HTMLElement> | undefined;

  onMount(() => {
    if (datePickerContainer) {
      datePicker = new AirDatepicker(datePickerContainer, {
        locale: localeEn,
        disableNavWhenOutOfRange: true,
        maxDate: new UTCDate(),
        onSelect: ({ date }) => {
          const localDate = date as Date;
          props.onSelect(
            new UTCDate(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()),
          );
        },
      });
    }

    onCleanup(() => {
      datePicker?.destroy();
    });
  });

  createEffect(() => {
    datePicker?.update({ minDate: props.minDate });
  });

  return <div ref={datePickerContainer} />;
};
