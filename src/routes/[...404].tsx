import { AshisoLogo } from "@/components/icons/ashiso-logo";
import { Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { t } from "i18next";

export default function NotFound() {
  const location = useLocation();

  return (
    <div class="flex flex-col size-full gap-4 items-center justify-center bg-background">
      <AshisoLogo width={"120px"} height={"120px"} />
      <Title>
        {location.pathname} - {t("not_found", { ns: "app" })}
      </Title>
      <span class="inline-flex flex-col items-center gap-2">
        <span class="text-4xl font-bold">{t("oops", { ns: "app" })}</span>
        <span class="text-xl text-muted-foreground">
          {t("not_exist", {
            ns: "app",
            page: location.pathname.replace("/", ""),
          })}
        </span>
      </span>
    </div>
  );
}
