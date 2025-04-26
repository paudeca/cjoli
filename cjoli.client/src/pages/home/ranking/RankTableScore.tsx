import { useTranslation } from "react-i18next";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import SimulationIcon from "../../../components/SimulationIcon";
import TeamName from "../../../components/TeamName";
import { useCJoli } from "../../../hooks/useCJoli";
import useScreenSize from "../../../hooks/useScreenSize";
import { Match, Phase, Score, Squad, Tourney } from "../../../models";
//import PenaltyIcon from "../../../components/PenaltyIcon";
import useUid from "../../../hooks/useUid";
import CJoliTooltip from "../../../components/CJoliTooltip";
import styled from "@emotion/styled";
import { bgSecondary } from "../../../styles";
import { memo, useCallback } from "react";
import * as cjoliService from "../../../services/cjoliService";
import InfoButton from "./InfoButton";
import { Stack } from "react-bootstrap";
import ButtonTeam from "../../../components/ButtonTeam";
import { useUser } from "../../../hooks/useUser";

const MyTh = styled("th")`
  ${bgSecondary}
`;

const MyTd = MyTh.withComponent("td");

interface RankTableScoreProps {
  tourney: Tourney;
  score: Score;
  phase: Phase;
  squad?: Squad;
}
const RankTableScore = ({ score, phase, squad }: RankTableScoreProps) => {
  const {
    tourney,
    getTeam,
    getPosition,
    getTeamInfo,
    loadRanking,
    isCastPage,
    isXl,
    classNamesCast,
  } = useCJoli();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  const uid = useUid();
  const { userConfig } = useUser();

  const position = getPosition(score.positionId);
  const team = getTeam(position?.teamId || 0);
  const matches =
    squad?.matches ??
    phase.squads.reduce<Match[]>((acc, s) => [...acc, ...s.matches], []);
  const userMatches = matches
    .filter(
      (m) =>
        m.userMatch &&
        !m.done &&
        userConfig.useCustomEstimate &&
        (m.positionIdA == score.positionId || m.positionIdB == score.positionId)
    )
    .map((m) => m.userMatch!.id);
  const hasSimulation = userMatches.length > 0;
  const { name } = getTeamInfo(score.positionId);

  const handleRemove = useCallback(
    (ids: number[]) => async () => {
      const ranking = await cjoliService.clearSimulations(uid, ids);
      loadRanking(ranking);
    },
    [loadRanking, uid]
  );

  return (
    <>
      <tr>
        <td rowSpan={isMobile ? 2 : 1} className={classNamesCast.padding}>
          {score.rank}
        </td>
        <td colSpan={isMobile ? 8 : 1} className={classNamesCast.padding}>
          <Stack direction="horizontal">
            <LeftCenterDiv className="mx-auto">
              <TeamName
                positionId={score.positionId}
                hideFavorite={isCastPage}
              />
              <SimulationIcon
                show={hasSimulation}
                title={`${t("rank.simulation", "Simulation")} - ${name}`}
                onRemove={handleRemove(userMatches)}
              />
              {/*tourney.config?.hasPenalty && (
                <PenaltyIcon positionId={score.positionId} />
              )*/}
              {team && !isCastPage && <ButtonTeam team={team} />}
            </LeftCenterDiv>
            {position && !isCastPage && (
              <InfoButton score={score} phase={phase} squad={squad} />
            )}
          </Stack>
        </td>
        <MyTd rowSpan={isMobile ? 2 : 1} className={classNamesCast.padding}>
          {score.total}
        </MyTd>
        {!isMobile && (
          <>
            <td className={classNamesCast.padding}>{score.game}</td>
            <td className={classNamesCast.padding}>{score.win}</td>
            <td className={classNamesCast.padding}>{score.neutral}</td>
            <td className={classNamesCast.padding}>{score.loss}</td>
            <td className={classNamesCast.padding}>{score.goalFor}</td>
            <td className={classNamesCast.padding}>{score.goalAgainst}</td>
            {!isXl && (
              <>
                <td>{score.shutOut}</td>
                {tourney?.config?.hasPenalty && <td>{score.penalty}</td>}
                <td>{score.goalDiff}</td>
              </>
            )}
          </>
        )}
      </tr>
      {isMobile && (
        <tr style={{ fontSize: "12px" }}>
          <td className="w-25">
            <CJoliTooltip info={t("rank.game", "Games played")}>
              PJ:{score.game}
            </CJoliTooltip>
          </td>
          <td className="w-25">
            <CJoliTooltip info={t("rank.win", "Victories")}>
              V:{score.win}
            </CJoliTooltip>
          </td>
          <td className="w-25">
            <CJoliTooltip info={t("rank.neutral", "Drawn games")}>
              N:{score.neutral}
            </CJoliTooltip>
          </td>
          <td className="w-25">
            <CJoliTooltip info={t("rank.loss", "Defeats")}>
              D:{score.loss}
            </CJoliTooltip>
          </td>
          <td className="w-25">
            <CJoliTooltip info={t("rank.goalFor", "Goals for")}>
              BP:{score.goalFor}
            </CJoliTooltip>
          </td>
          <td className="w-25">
            <CJoliTooltip info={t("rank.goalAgainst", "Goals against")}>
              BC:{score.goalAgainst}
            </CJoliTooltip>
          </td>
          {tourney?.config?.hasPenalty && (
            <td className="w-25">
              <CJoliTooltip info={t("rank.penalty", "Penalties")}>
                P:{score.penalty}
              </CJoliTooltip>
            </td>
          )}
          <td className="w-25">
            <CJoliTooltip info={t("rank.goalDiff", "Goal average")}>
              GA:{score.goalDiff}
            </CJoliTooltip>
          </td>
        </tr>
      )}
    </>
  );
};

export const RankTableScoreMemo = memo(RankTableScore);
export default RankTableScoreMemo;
