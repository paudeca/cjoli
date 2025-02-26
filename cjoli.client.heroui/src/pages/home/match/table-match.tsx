import {
  CJoliTable,
  CJoliTableBody,
  CJoliTableCell,
  CJoliTableColumn,
  CJoliTableHeader,
  CJoliTableRow,
} from "@/components";
import { TeamName } from "@/components/team-name";
import { Match, useCJoli } from "@cjoli/core";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import dayjs from "dayjs";
import { FC, useCallback } from "react";

interface TableMatchProps {
  datas: Record<string, Match[]>;
}
export const TableMatch: FC<TableMatchProps> = ({ datas }) => {
  const { getSquad } = useCJoli();
  const columns = [
    { key: "time" },
    { key: "squad" },
    { key: "location" },
    { key: "teamA" },
    { key: "score" },
    { key: "teamB" },
  ];

  const renderCell = useCallback((match: Match, column: string) => {
    switch (column) {
      case "time": {
        return dayjs(match.time).format("LT");
      }
      case "squad": {
        const squad = getSquad(match.squadId);
        return squad?.name;
      }
      case "location": {
        return match.location;
      }
      case "teamA": {
        return (
          <div className="text-left items-center inline-flex min-w-[70%]">
            <TeamName positionId={match.positionIdA} />
          </div>
        );
      }
      case "teamB": {
        return (
          <div className="text-left items-center inline-flex min-w-[70%]">
            <TeamName positionId={match.positionIdB} />
          </div>
        );
      }
      default:
        return "default";
    }
  }, []);

  return (
    <CJoliTable>
      <CJoliTableBody items={Object.keys(datas)}>
        {(item) =>
          datas[item].map((match, i) => (
            <CJoliTableRow key={item} columns={columns}>
              {(column) =>
                (i == 0 || column.key != "time") && (
                  <CJoliTableCell
                    key={column.key}
                    rowSpan={column.key == "time" ? datas[item].length : 1}
                    className="border"
                  >
                    {renderCell(match, column.key)}
                  </CJoliTableCell>
                )
              }
            </CJoliTableRow>
          ))
        }
      </CJoliTableBody>
    </CJoliTable>
  );
};
