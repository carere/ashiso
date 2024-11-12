import { Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { t } from "i18next";

export default function NotFound() {
  const location = useLocation();

  return (
    <>
      <Title>
        {location.pathname} - {t("not_found", { ns: "app" })}
      </Title>
      <h1>{t("oops", { ns: "app" })}</h1>
      <p>
        {t("not_exist", {
          ns: "app",
          page: location.pathname.replace("/", ""),
        })}
      </p>
    </>
  );
}
