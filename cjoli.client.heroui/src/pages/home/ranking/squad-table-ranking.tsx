import { Phase, Score, Squad, useSquadTableRankingHomePage } from "@/lib/core";
import {
  Chip,
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { FC, Fragment, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSquadTableRanking } from "./button-squad-table-ranking";
import { SimultPopover } from "@/components/popovers/simul-popover";
import { CellTeamSquadTableRanking } from "./cell-team-squad-table-ranking";

interface Column {
  key: keyof Score;
  label: string;
  color?: boolean;
  info?: string;
  mobile?: boolean;
}

interface SquadTableRankingProps {
  phase: Phase;
  squad: Squad;
  squads: Squad[];
}
export const SquadTableRanking: FC<SquadTableRankingProps> = ({
  phase,
  squad,
  squads,
}) => {
  const {
    datas,
    tourney,
    columns,
    squadId,
    hasSimulation,
    handleRemove,
    userMatches,
  } = useSquadTableRankingHomePage(squad);
  const { t } = useTranslation();

  if (!tourney) {
    return <Fragment />;
  }

  const renderCell = useCallback((score: Score, columnKey: string | number) => {
    switch (columnKey) {
      case "teamId":
        return (
          <div>
            <CellTeamSquadTableRanking score={score} squad={squad} />
            <div className="md:hidden flex justify-stretch">
              {columns
                .filter((c) => c.mobile)
                .map((c) => (
                  <div key={c.key} className="w-full border-1 text-xs">
                    {c.label}:{getKeyValue(score, c.key)}
                  </div>
                ))}
            </div>
          </div>
        );
      default:
        return getKeyValue(score, columnKey);
    }
  }, []);

  const topContent = useMemo(() => {
    let topContent;
    if (squadId) {
      topContent = <ButtonSquadTableRanking phase={phase} squad={squad} back />;
    } else if (squads.length > 1) {
      topContent = <ButtonSquadTableRanking phase={phase} squad={squad} />;
    } else {
      topContent = (
        <Chip
          className="h-10 w-[163px] border-1 border-default-100 px-[16px] py-[10px]"
          variant="bordered"
          color="secondary"
        >
          <span className="font-semibold">{squad.name}</span>
        </Chip>
      );
    }
    return topContent;
  }, []);

  const get = useCallback(
    (key: string | number) => columns.find((c) => c.key == key) ?? columns[0],
    []
  );

  const createTable = useCallback(
    (
      columns: Column[],
      classNames: { table: string; header: (column: Column) => string }
    ) => (
      <Table
        isStriped
        isCompact
        topContent={
          <div>
            {topContent}
            {hasSimulation && (
              <SimultPopover
                title={`${t("rank.simulation", "Simulation")} - ${squad.name}`}
                onRemove={handleRemove(userMatches)}
              />
            )}
          </div>
        }
        aria-label={`Table squad : ${squad.id}`}
        className={classNames.table}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn className={classNames.header(column)} key={column.key}>
              {column.info ? (
                <Tooltip content={column.info} offset={12}>
                  {column.label}
                </Tooltip>
              ) : (
                column.label
              )}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={datas}>
          {(item) => (
            <TableRow key={item.teamId}>
              {(columnKey) => (
                <TableCell
                  className={`text-center px-1 ${
                    get(columnKey).color
                      ? `bg-secondary text-background border-b-1`
                      : ""
                  }
          `}
                >
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    ),
    []
  );

  return (
    <>
      {createTable(columns, {
        table: "hidden md:table",
        header: (column) =>
          `text-center ${column.key == "teamId" ? "w-1/2" : "w-1/20"} ${column.color ? "bg-secondary text-background" : "text-bold"}`,
      })}
      {createTable(
        columns.filter((c) => !c.mobile),
        {
          table: "sm:table md:hidden",
          header: (column) =>
            `text-center ${column.key == "teamId" ? "w-4/5" : "w-1/10"} ${column.color ? "bg-secondary text-background" : "text-bold"}`,
        }
      )}
    </>
  );
};
