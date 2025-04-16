import { CJoliTable, CJoliTableBody } from "@/components";
import { Match } from "@cjoli/core";
import { FC, useContext } from "react";
import { RowMatch } from "./row-match";
import { MatchContext } from "./match-context";

interface TableMatchProps {
  matches: Record<string, Match[]>;
}
export const TableMatch: FC<TableMatchProps> = ({ matches }) => {
  const { hasLocation } = useContext(MatchContext)!;
  let columns = [
    { key: "time" },
    { key: "squad" },
    { key: "location" },
    { key: "teamA" },
    { key: "score" },
    { key: "teamB" },
  ];
  if (!hasLocation) {
    columns = columns.filter((c) => c.key != "location");
  }
  return (
    <CJoliTable>
      <CJoliTableBody items={Object.keys(matches)}>
        {(item) =>
          matches[item].map((match, i) => (
            <RowMatch
              key={i}
              index={i}
              columns={columns}
              match={match}
              size={matches[item].length}
            />
          ))
        }
      </CJoliTableBody>
    </CJoliTable>
  );
};
