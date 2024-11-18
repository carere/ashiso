import { Button } from "@/components/atoms/button";
import { FaIcon } from "@/components/icons/fa-icon";
import type { UserConfig } from "@/libs/types";
import { createForm } from "@modular-forms/solid";
import { Title } from "@solidjs/meta";
import { Match, Switch as SolidSwitch } from "solid-js";

// const PriceDiagramSettings = (props: {
//   value: PriceDiagramPreference;
//   onChange: (pref: PriceDiagramPreference) => void;
// }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle>Price Diagram Settings</CardTitle>
//       <CardDescription>
//         Manage the way the movement's price is calculated
//       </CardDescription>
//     </CardHeader>
//     <CardContent class="grid gap-6">
//       <div class="flex items-center justify-between space-x-2">
//         <Label for="high-low" class="flex flex-col gap-2 max-w-52">
//           <span>High & Low</span>
//           <span class="text-muted-foreground font-normal leading-snug">
//             The price diagram is calculated by identifying the places where a
//             reversal of the highest or lowest price is observed and vice versa.
//           </span>
//         </Label>
//         <Switch
//           id="high-low"
//           checked={props.value === "HighLow" ? true : false}
//           onChange={(isChecked) =>
//             props.onChange(isChecked ? "HighLow" : "RedGreen")}
//         />
//       </div>
//       <div class="flex items-center justify-between space-x-2">
//         <Label for="red-green" class="flex flex-col gap-2 max-w-52">
//           <span>Red & Green</span>
//           <span class="text-muted-foreground font-normal leading-snug">
//             The price diagram is calculated by identifying the places where we
//             go from a green candle to a red candle and vice versa.
//           </span>
//         </Label>
//         <Switch
//           id="red-green"
//           checked={props.value === "RedGreen" ? true : false}
//           onChange={(isChecked) =>
//             props.onChange(isChecked ? "RedGreen" : "HighLow")}
//         />
//       </div>
//     </CardContent>
//   </Card>
// );

export default function Settings() {
  const userConfig: UserConfig = { exchanges: "binance" };
  const save = (config: UserConfig) => console.log("Saving config", config);

  const [configForm, { Form, Field }] = createForm<UserConfig>({
    get initialValues() {
      return userConfig;
    },
  });

  return (
    <Form onSubmit={save} class="size-full flex flex-col items-center justify-center gap-8">
      <Title>Settings</Title>
      <FaIcon name="rocket" size="2xl" style="DuoTone" />
      <span>Settings Page under construction...</span>
      {/* <Field name="price_diagram">
        {(field) => (
          <PriceDiagramSettings
            value={field.value as PriceDiagramPreference}
            onChange={(pref) => setValue(configForm, "price_diagram", pref)}
          />
        )}
      </Field> */}
      <Button
        variant={"outline"}
        class="gap-4"
        type="submit"
        // disabled={configForm.submitting}
        disabled
      >
        <SolidSwitch>
          <Match when={configForm.submitting}>
            <FaIcon name="spinner" animation="Spin" />
          </Match>
        </SolidSwitch>
        <span>Save settings preferences</span>
      </Button>
    </Form>
  );
}
