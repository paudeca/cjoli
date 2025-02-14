import { Phase } from "@cjoli/core";
import { FC } from "react";
import { SquadTableRanking } from "./squad-table-ranking";
import { useTableRankingHomePage } from "@/hooks";

interface TableRankingProps {
  phase: Phase;
}

export const TableRanking: FC<TableRankingProps> = ({ phase }) => {
  const { squads } = useTableRankingHomePage(phase);
  console.log("TableRanking", phase.name);
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
