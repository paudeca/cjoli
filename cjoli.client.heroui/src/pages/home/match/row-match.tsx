import { CJoliTableCell, CJoliTableRow, ComparePopover } from "@/components";
import { IMatch, Match } from "@/lib/models";
import dayjs from "dayjs";
import { FC, useCallback, useContext } from "react";
import { ScoreInputCellMatch } from "./score-input-cell-match";
import { useCJoli, useUser } from "@/lib/hooks";
import { Button } from "@heroui/react";
import { CancelIcon, CheckIcon, StarsIcon } from "@/components/icons";
import { MatchContext } from "./match-context";
import { TeamCellMatch } from "./team-cell-match";
import { ScoreViewCellMatch } from "./score-view-cell-match";

interface RowMatchProps {
  index: number;
  columns: { key: string }[];
  match: Match;
  size: number;
}
export const RowMatch: FC<RowMatchProps> = ({
  index,
  columns,
  match,
  size,
}) => {
  const { getSquad, findTeam } = useCJoli();
  const { saveMatch, clearMatch } = useContext(MatchContext)!;
  const {
    isConnected,
    isAdmin,
    userConfig: { useCustomEstimate },
  } = useUser();

  const hasUserMatch =
    match.userMatch && (!isAdmin || (isAdmin && useCustomEstimate));
  const imatch: IMatch = match.done
    ? match
    : match.userMatch && hasUserMatch
      ? match.userMatch
      : match;
  const done = hasUserMatch || match.done;
  const isSimulation = !!hasUserMatch;
  const teamA = findTeam({ positionId: match.positionIdA });
  const teamB = findTeam({ positionId: match.positionIdB });
  const squad = getSquad(match.squadId);

  const renderCell = useCallback(
    (column: string) => {
      switch (column) {
        case "time": {
          return dayjs(match.time).format("LT");
        }
        case "squad": {
          return (
            <div className="flex">
              {squad?.name}
              {isSimulation && (
                <StarsIcon size={16} className="[&>path]:stroke-[1.5]" />
              )}
            </div>
          );
        }
        case "location": {
          return match.location;
        }
        case "teamA": {
          return (
            <div className="text-left items-center inline-flex min-w-[70%]">
              <TeamCellMatch
                positionId={match.positionIdA}
                forfeit={match.forfeitA}
                penalty={match.penaltyA}
              />
            </div>
          );
        }
        case "teamB": {
          return (
            <div className="text-left items-center inline-flex min-w-[70%]">
              <TeamCellMatch
                positionId={match.positionIdB}
                forfeit={match.forfeitB}
                penalty={match.penaltyB}
              />
            </div>
          );
        }
        case "score": {
          return (
            <>
              {match.done && (
                <div className="flex items-center justify-center">
                  {teamA && teamB && (
                    <ComparePopover team={teamA} teamB={teamB} squad={squad} />
                  )}
                  <ScoreViewCellMatch match={match} mode="A" />
                  <span className="px-1 text-2xl">-</span>
                  <ScoreViewCellMatch match={match} mode="B" />
                  {isConnected && (
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      radius="full"
                      onPress={() => clearMatch(match)}
                      tabIndex={-1}
                    >
                      <CancelIcon />
                    </Button>
                  )}
                </div>
              )}
              {!match.done && (
                <div className="flex items-center justify-center">
                  {teamA && teamB && (
                    <ComparePopover team={teamA} teamB={teamB} squad={squad} />
                  )}
                  <ScoreInputCellMatch
                    id={`m${match.id}.scoreA`}
                    match={match}
                    teamA
                  />
                  <span className="px-1 text-2xl">-</span>
                  <ScoreInputCellMatch
                    id={`m${match.id}.scoreB`}
                    match={match}
                    teamB
                  />
                  {isConnected && (
                    <Button
                      isIconOnly
                      variant="light"
                      color="success"
                      radius="full"
                      onPress={() => saveMatch(match)}
                      tabIndex={-1}
                    >
                      <CheckIcon />
                    </Button>
                  )}
                </div>
              )}
            </>
          );
        }
        default:
          return "not implemented";
      }
    },
    [
      clearMatch,
      saveMatch,
      isConnected,
      match,
      teamA,
      teamB,
      squad,
      isSimulation,
    ]
  );

  return (
    <CJoliTableRow columns={columns}>
      {(column) =>
        (index == 0 || column.key != "time") && (
          <CJoliTableCell
            key={column.key}
            rowSpan={column.key == "time" ? size : 1}
            className="border"
          >
            {renderCell(column.key)}
          </CJoliTableCell>
        )
      }
    </CJoliTableRow>
  );
};
