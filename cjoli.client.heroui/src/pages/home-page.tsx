import { CjoliAccordion } from "@/components";
import DefaultLayout from "@/layouts/default";
import { RankingkHome } from "./home/ranking-home";
import { useHomePage } from "@cjoli/core";
import { useMemo } from "react";
import { Alert } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { CJoliLoading } from "@/components/cjoli-loading";
import { MatchHome } from "./home/match-home";

export const HomePage = () => {
  const { phase, isLoading, allMatchesDone } = useHomePage();
  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        key: "final",
        content: <div>Final</div>,
        title: t("home.finalRanking", "Final Ranking"),
        hide: !allMatchesDone,
      },
      {
        key: "ranking",
        content: <RankingkHome />,
        title: t("home.ranking", "Ranking"),
        hide: !phase,
      },
      {
        key: "match",
        content: <MatchHome />,
        title: t("home.matches", "Matches"),
        hide: !phase,
      },
    ],
    [allMatchesDone]
  );
  return (
    <DefaultLayout page="home">
      <CJoliLoading loading={isLoading}>
        <CjoliAccordion items={items}>{(item) => item.content}</CjoliAccordion>
        {!phase && (
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
};
