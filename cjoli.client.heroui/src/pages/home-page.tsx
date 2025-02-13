import { CjoliAccordion } from "@/components";
import { DefaultLayout } from "@/layouts/default-layout";
import { RankingkHome } from "./home/ranking-home";
import { Alert } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { CJoliLoading } from "@/components/cjoli-loading";
import { MatchHome } from "./home/match-home";
import { useHomePage } from "@/hooks";
import { memo } from "react";

export const HomePage = memo(() => {
  const map = {
    final: <div>Final</div>,
    ranking: <div>RankingkHome </div>,
    match: <MatchHome />,
  };
  const { isConfigured, isLoading, items } = useHomePage(map);
  const { t } = useTranslation();
  console.log("HomePage");

  return (
    <DefaultLayout page="home">
      <CJoliLoading loading={isLoading}>
        <CjoliAccordion items={items}>{(item) => item.content}</CjoliAccordion>
        {!isConfigured && (
          <div className="flex items-center justify-center w-full">
            <Alert
              title={t("home.tourneyNotConfigured", "Tourney not configured")}
              color="danger"
              variant="faded"
            />
          </div>
        )}
      </CJoliLoading>
    </DefaultLayout>
  );
});
