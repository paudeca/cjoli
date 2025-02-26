import { Phase, Score, Squad } from "@/lib/core";
import { Chip, getKeyValue, Tooltip } from "@heroui/react";
import { FC, Fragment, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSquadTableRanking } from "./button-squad-table-ranking";
import { SimultPopover } from "@/components/popovers/simul-popover";
import { CellTeamSquadTableRanking } from "./cell-team-squad-table-ranking";
import { useSquadTableRankingHomePage } from "@/hooks";
import {
  CJoliTable,
  CJoliTableBody,
  CJoliTableCell,
  CJoliTableColumn,
  CJoliTableHeader,
  CJoliTableRow,
} from "@/components";

interface Column {
  key: keyof Score;
  label: string;
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

  const renderCell = useCallback(
    (score: Score, columnKey: string | number) => {
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
    },
    [columns, squad]
  );

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
    return (
      <div className="py-4">
        {topContent}
        {hasSimulation && (
          <SimultPopover
            title={`${t("rank.simulation", "Simulation")} - ${squad.name}`}
            onRemove={handleRemove(userMatches)}
          />
        )}
      </div>
    );
  }, [
    phase,
    squad,
    squadId,
    squads,
    handleRemove,
    t,
    hasSimulation,
    userMatches,
  ]);

  const createTable = useCallback(
    (
      columns: Column[],
      classNames: {
        table: string;
        header: (column: Column) => string;
        cell: (column: Column) => string;
      }
    ) => (
      <CJoliTable className={classNames.table} topContent={topContent}>
        <CJoliTableHeader columns={columns}>
          {(column) => (
            <CJoliTableColumn
              key={column.key}
              className={classNames.header(column)}
            >
              {column.info ? (
                <Tooltip content={column.info} offset={12}>
                  {column.label}
                </Tooltip>
              ) : (
                column.label
              )}
            </CJoliTableColumn>
          )}
        </CJoliTableHeader>
        <CJoliTableBody items={datas}>
          {(item) => (
            <CJoliTableRow key={item.positionId} columns={columns}>
              {(column) => (
                <CJoliTableCell
                  key={column.key}
                  className={classNames.cell(column)}
                >
                  {renderCell(item, column.key)}
                </CJoliTableCell>
              )}
            </CJoliTableRow>
          )}
        </CJoliTableBody>
      </CJoliTable>
    ),
    [datas, renderCell, topContent]
  );

  if (!tourney) {
    return <Fragment />;
  }

  return (
    <>
      {createTable(columns, {
        table: "hidden md:table",
        header: (column) =>
          `text-center ${column.key == "teamId" ? "w-1/2" : "w-1/20"} ${column.key == "total" ? "bg-secondary text-background" : "text-bold"}`,
        cell: (column) =>
          `text-center px-1 ${
            column.key == "total"
              ? `bg-secondary text-background border-b-1`
              : ""
          }`,
      })}
      {createTable(
        columns.filter((c) => !c.mobile),
        {
          table: "sm:table md:hidden",
          header: (column) =>
            `text-center ${column.key == "teamId" ? "w-4/5" : "w-1/10"} ${column.key == "total" ? "bg-secondary text-background" : "text-bold"}`,
          cell: (column) =>
            `text-center px-1 ${
              column.key == "total"
                ? `bg-secondary text-background border-b-1`
                : ""
            }`,
        }
      )}
    </>
  );
};
