import { Card, Table } from "react-bootstrap";
import { Match, Phase, Score, Squad } from "../../../models";
import SimulationIcon from "../../../components/SimulationIcon";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { Trans, useTranslation } from "react-i18next";
import { Fragment, useCallback } from "react";
import { useCJoli } from "../../../hooks/useCJoli";
import { useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import {
  ArrowLeftSquareFill,
  ArrowRightSquareFill,
} from "react-bootstrap-icons";
import { bgSecondary, zoomIcon } from "../../../styles";
import useUid from "../../../hooks/useUid";
import useScreenSize from "../../../hooks/useScreenSize";
import * as cjoliService from "../../../services/cjoliService";
import RankTableScore from "./RankTableScore";
import { useServer } from "../../../hooks/useServer";
import { useUser } from "../../../hooks/useUser";

const MyTh = styled("th")`
  ${bgSecondary}
`;

const MyArrowRightSquareFill = styled(ArrowRightSquareFill)`
  ${zoomIcon}
`;
const MyArrowLeftSquareFill =
  MyArrowRightSquareFill.withComponent(ArrowLeftSquareFill);

interface RankTableSquadProps {
  phase: Phase;
  squad?: Squad;
  squads: Squad[];
}

const RankTableSquad = ({ phase, squad, squads }: RankTableSquadProps) => {
  const { tourney, ranking, loadRanking } = useCJoli();
  const { squadId } = useParams();
  const navigate = useNavigate();
  const uid = useUid();
  const { path } = useServer();
  const { isMobile } = useScreenSize();
  const { t } = useTranslation();
  const { userConfig } = useUser();

  let datas: Score[];
  let matches: Match[];
  if (squad) {
    const scores = ranking?.scores.scoreSquads.find(
      (s) => s.squadId == squad.id
    );
    datas = scores ? scores.scores : [];
    matches = squad.matches;
  } else {
    datas = ranking?.scores.scorePhases[phase.id] ?? [];
    matches = phase.squads.reduce<Match[]>(
      (acc, s) => [...acc, ...s.matches],
      []
    );
  }
  const userMatches = matches
    .filter((m) => m.userMatch && !m.done && userConfig.useCustomEstimate)
    .map((m) => m.userMatch!.id);
  const hasSimulation = userMatches.length > 0;

  const handleRemove = useCallback(
    (ids: number[]) => async () => {
      const ranking = await cjoliService.clearSimulations(uid, ids);
      loadRanking(ranking);
    },
    [loadRanking, uid]
  );

  if (!tourney) {
    return <Fragment />;
  }

  return (
    <Card.Body>
      <Card.Title>
        {squadId && (
          <MyArrowLeftSquareFill
            role="button"
            className="mx-2"
            size={26}
            onClick={() => navigate(`${path}phase/${phase.id}`)}
          />
        )}
        {squad ? squad.name : phase.name}
        <SimulationIcon
          show={hasSimulation}
          title={`${t("rank.simulation", "Simulation")} - ${squad?.name ?? phase.name}`}
          onRemove={handleRemove(userMatches)}
        />
        {squad && !squadId && squads.length > 1 && (
          <MyArrowRightSquareFill
            role="button"
            className="mx-2"
            size={26}
            onClick={() =>
              navigate(`${path}phase/${phase.id}/squad/${squad.id}`)
            }
          />
        )}
      </Card.Title>
      <Table striped bordered hover size="sm" style={{ textAlign: "center" }}>
        <thead>
          <tr>
            <th rowSpan={isMobile ? 2 : 1}>#</th>
            <th colSpan={isMobile ? 8 : 1} className="w-50">
              <Trans i18nKey="rank.team">Team</Trans>
            </th>
            <MyTh rowSpan={isMobile ? 2 : 1}>
              <CJoliTooltip info={t("rank.total", "Points")}>PTS</CJoliTooltip>
            </MyTh>
            {!isMobile && (
              <>
                <th>
                  <CJoliTooltip info={t("rank.game", "Games played")}>
                    PJ
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.win", "Victories")}>
                    V
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.neutral", "Drawn games")}>
                    N
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.loss", "Defeats")}>
                    D
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.goalFor", "Goals for")}>
                    BP
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.goalAgainst", "Goals against")}>
                    BC
                  </CJoliTooltip>
                </th>
                <th>
                  <CJoliTooltip info={t("rank.shutOut", "ShutOut")}>
                    BL
                  </CJoliTooltip>
                </th>
                {tourney.config?.hasPenalty && (
                  <th>
                    <CJoliTooltip info={t("rank.penalty", "Penalty")}>
                      P
                    </CJoliTooltip>
                  </th>
                )}
                <th>
                  <CJoliTooltip info={t("rank.goalDiff", "Goal average")}>
                    +/-
                  </CJoliTooltip>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {datas.map((score, index) => (
            <RankTableScore
              key={index}
              score={score}
              tourney={tourney}
              phase={phase}
              squad={squad}
            />
          ))}
        </tbody>
      </Table>
    </Card.Body>
  );
};

export default RankTableSquad;
