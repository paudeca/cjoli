import { Phase, useTableRankingHomePage } from "@cjoli/core";
import { FC } from "react";
import { SquadTableRanking } from "./squad-table-ranking";

interface TableRankingProps {
  phase: Phase;
}

export const TableRanking: FC<TableRankingProps> = ({ phase }) => {
  const { squads } = useTableRankingHomePage(phase);
  return (
    <>
      {squads.map((squad) => (
        <SquadTableRanking
          key={squad.id}
          phase={phase}
          squad={squad}
          squads={squads}
        />
      ))}
    </>
  );
};
