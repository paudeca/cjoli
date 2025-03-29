import { CJoliTable, CJoliTableBody } from "@/components";
import { Match } from "@cjoli/core";
import { FC } from "react";
import { RowMatch } from "./row-match";

interface TableMatchProps {
  datas: Record<string, Match[]>;
}
export const TableMatch: FC<TableMatchProps> = ({ datas }) => {
  const columns = [
    { key: "time" },
    { key: "squad" },
    { key: "location" },
    { key: "teamA" },
    { key: "score" },
    { key: "teamB" },
  ];
  return (
    <CJoliTable>
      <CJoliTableBody items={Object.keys(datas)}>
        {(item) =>
          datas[item].map((match, i) => (
            <RowMatch
              key={i}
              index={i}
              columns={columns}
              match={match}
              size={datas[item].length}
            />
          ))
        }
      </CJoliTableBody>
    </CJoliTable>
  );
};
