import { useRankingHomePage } from "@cjoli/core";
import { Tab, Tabs } from "@heroui/react";
import { TableRanking } from "./ranking/table-ranking";

export const RankingkHome = () => {
  const { phases, phaseId, handleClick } = useRankingHomePage();
  return (
    <Tabs
      items={phases}
      color="secondary"
      defaultSelectedKey={phaseId}
      onSelectionChange={handleClick}
    >
      {(phase) => (
        <Tab key={phase.id} title={phase.name}>
          <TableRanking phase={phase} />
        </Tab>
      )}
    </Tabs>
  );
};
