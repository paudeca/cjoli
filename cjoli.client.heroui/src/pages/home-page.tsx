//import { RankingkHome } from "./home/ranking-home";
import { Alert, Card, CardBody } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { CJoliLoading } from "@/components/cjoli-loading";
import { MatchHome } from "./home/match-home";
import { useHomePage } from "@/hooks";
import { memo } from "react";

export const HomePage = memo(() => {
  const map = {
    final: <div>Final</div>,
    //ranking: <RankingkHome />,
    match: <MatchHome />,
  };
  const { isConfigured, isLoading, items } = useHomePage(map);
  const { t } = useTranslation();

  return (
    <CJoliLoading loading={isLoading}>
      {items
        .filter((item) => !item.hide)
        .map((item) => (
          <Card key={item.key} className="mb-4">
            <CardBody>{item.content}</CardBody>
          </Card>
        ))}
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
  );
});
