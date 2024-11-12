import { useTransContext } from "@mbarzda/solid-i18next";
import { Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";

export default function NotFound() {
  const location = useLocation();
  const [t] = useTransContext();

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
