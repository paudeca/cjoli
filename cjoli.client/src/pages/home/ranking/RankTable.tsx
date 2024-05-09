import styled from "@emotion/styled";
import { Card, Table } from "react-bootstrap";
import { Phase, Squad } from "../../../models";
import TeamName from "../../../components/TeamName";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import {
  ArrowLeftSquareFill,
  ArrowRightSquareFill,
  CaretRight,
} from "react-bootstrap-icons";
import React from "react";
import { useCJoli } from "../../../hooks/useCJoli";
import useScreenSize from "../../../hooks/useScreenSize";
import SimulationIcon from "../../../components/SimulationIcon";
import * as cjoliService from "../../../services/cjoliService";
import useUid from "../../../hooks/useUid";
import { useNavigate, useParams } from "react-router-dom";
import { zoomIcon, bgSecondary } from "../../../styles";
import CJoliTooltip from "../../../components/CJoliTooltip";
import PenaltyIcon from "../../../components/PenaltyIcon";

const MyTh = styled("th")`
  ${bgSecondary}
`;

const MyTd = MyTh.withComponent("td");

const MyCaretRight = styled(CaretRight)`
  ${zoomIcon}
`;

const MyArrowRightSquareFill = styled(ArrowRightSquareFill)`
  ${zoomIcon}
`;
const MyArrowLeftSquareFill =
  MyArrowRightSquareFill.withComponent(ArrowLeftSquareFill);

const RankTable = ({ phase }: { phase: Phase }) => {
  const {
    ranking,
    getPosition,
    getTeam,
    loadRanking,
    getTeamInfo,
    isTeamInSquad,
  } = useCJoli();
  const { isMobile } = useScreenSize();
  const uid = useUid();
  const navigate = useNavigate();
  const { squadId, teamId } = useParams();

  const handleRemove = (ids: number[]) => async () => {
    const ranking = await cjoliService.clearSimulations(uid, ids);
    loadRanking(ranking);
  };

  const filter = teamId
    ? (squad: Squad) => isTeamInSquad(parseInt(teamId), squad)
    : (squad: Squad) => !squadId || parseInt(squadId) == squad.id;
  const squads = phase.squads.filter(filter);

  return (
    <>
      {squads.map((squad) => {
        const scores = ranking?.scores.scoreSquads.find(
          (s) => s.squadId == squad.id
        );
        const datas = scores ? scores.scores : [];
        const userMatches = squad.matches
          .filter((m) => m.userMatch)
          .map((m) => m.userMatch!.id);
        const hasSimulation = userMatches.length > 0;
        return (
          <Card.Body key={squad.id}>
            <Card.Title>
              {squadId && (
                <MyArrowLeftSquareFill
                  role="button"
                  className="mx-2"
                  size={26}
                  onClick={() => navigate(`/${uid}/phase/${phase.id}`)}
                />
              )}
              {squad.name}
              <SimulationIcon
                show={hasSimulation}
                title={`Simulation - ${squad.name}`}
                onRemove={handleRemove(userMatches)}
              />
              {!squadId && squads.length > 1 && (
                <MyArrowRightSquareFill
                  role="button"
                  className="mx-2"
                  size={26}
                  onClick={() =>
                    navigate(`/${uid}/phase/${phase.id}/squad/${squad.id}`)
                  }
                />
              )}
            </Card.Title>
            <Table
              striped
              bordered
              hover
              size="sm"
              style={{ textAlign: "center" }}
            >
              <thead>
                <tr>
                  <th rowSpan={isMobile ? 2 : 1}>#</th>
                  <th colSpan={isMobile ? 8 : 1} className="w-50">
                    Team
                  </th>
                  <MyTh rowSpan={isMobile ? 2 : 1}>
                    <CJoliTooltip info="Points">PTS</CJoliTooltip>
                  </MyTh>
                  {!isMobile && (
                    <>
                      <th>
                        <CJoliTooltip info="Parties jouées">PJ</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Victoires">V</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Parties nulles">N</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Défaites">D</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Buts pour">BP</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Buts contre">BC</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Blanchissages">BL</CJoliTooltip>
                      </th>
                      <th>
                        <CJoliTooltip info="Goal average">+/-</CJoliTooltip>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {datas.map((score, index) => {
                  const team = getTeam(
                    getPosition(score.positionId)?.teamId || 0
                  );
                  const userMatches = squad.matches
                    .filter(
                      (m) =>
                        m.userMatch &&
                        (m.positionIdA == score.positionId ||
                          m.positionIdB == score.positionId)
                    )
                    .map((m) => m.userMatch!.id);
                  const hasSimulation = userMatches.length > 0;
                  const { name } = getTeamInfo(score.positionId);
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td rowSpan={isMobile ? 2 : 1}>{index + 1}</td>
                        <td colSpan={isMobile ? 8 : 1}>
                          <LeftCenterDiv>
                            <TeamName positionId={score.positionId} />
                            <SimulationIcon
                              show={hasSimulation}
                              title={`Simulation - ${name}`}
                              onRemove={handleRemove(userMatches)}
                            />
                            <PenaltyIcon positionId={score.positionId} />
                            {team && (
                              <MyCaretRight
                                role="button"
                                className="mx-2"
                                onClick={() =>
                                  navigate(`/${uid}/team/${team.id}`)
                                }
                              />
                            )}
                          </LeftCenterDiv>
                        </td>
                        <MyTd rowSpan={isMobile ? 2 : 1}>{score.total}</MyTd>
                        {!isMobile && (
                          <>
                            <td>{score.game}</td>
                            <td>{score.win}</td>
                            <td>{score.neutral}</td>
                            <td>{score.loss}</td>
                            <td>{score.goalFor}</td>
                            <td>{score.goalAgainst}</td>
                            <td>{score.shutOut}</td>
                            <td>{score.goalDiff}</td>
                          </>
                        )}
                      </tr>
                      {isMobile && (
                        <tr style={{ fontSize: "12px" }}>
                          <td className="w-25">
                            <CJoliTooltip info="Parties jouées">
                              PJ:{score.game}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Victoires">
                              V:{score.win}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Parties nulles">
                              N:{score.neutral}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Défaites">
                              D:{score.loss}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Buts pout">
                              BP:{score.goalFor}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Buts contre">
                              BC:{score.goalAgainst}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Blanchissage">
                              BL:{score.shutOut}
                            </CJoliTooltip>
                          </td>
                          <td className="w-25">
                            <CJoliTooltip info="Goal average">
                              GA:{score.goalDiff}
                            </CJoliTooltip>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        );
      })}
    </>
  );
};

export default RankTable;
