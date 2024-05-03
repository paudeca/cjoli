import styled from "@emotion/styled";
import { Card, Table } from "react-bootstrap";
import { Phase, Team } from "../../../models";
import TeamName from "../../../components/TeamName";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import { PencilSquare } from "react-bootstrap-icons";
import TeamModal from "../../../modals/TeamModal";
import { useModal } from "../../../contexts/ModalContext";
import React from "react";
import { useCJoli } from "../../../hooks/useCJoli";
import { useUser } from "../../../hooks/useUser";
import useScreenSize from "../../../hooks/useScreenSize";

const MyTh = styled("th")`
  background-color: ${(props) => props.theme.colors.secondary} !important;
  color: white !important;
  text-align: center;
`;

const MyTd = styled("td")`
  background-color: ${(props) => props.theme.colors.secondary} !important;
  color: white !important;
  text-align: center;
`;

const RankTable = ({ phase }: { phase: Phase }) => {
  const { ranking, getPosition, getTeam } = useCJoli();
  const { setShow: showTeam } = useModal("team");
  const { isAdmin } = useUser();
  const [team, setTeam] = React.useState<Team | undefined>(undefined);
  const { isMobile } = useScreenSize();
  return (
    <>
      {phase.squads.map((squad) => {
        const scores = ranking?.scores.find((s) => s.squadId == squad.id);
        const datas = scores ? scores.scores : [];
        return (
          <Card.Body key={squad.id}>
            <Card.Title>{squad.name}</Card.Title>
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
                  <th colSpan={isMobile ? 7 : 1} className="w-50">
                    Team
                  </th>
                  <MyTh rowSpan={isMobile ? 2 : 1}>PTS</MyTh>
                  {!isMobile && (
                    <>
                      <th>J</th>
                      <th>G</th>
                      <th>N</th>
                      <th>P</th>
                      <th>BP</th>
                      <th>BC</th>
                      <th>+/-</th>
                    </>
                  )}
                </tr>
                {isMobile && false && (
                  <tr>
                    <td>J</td>
                    <td>G</td>
                    <td>N</td>
                    <td>P</td>
                    <td>BP</td>
                    <td>BC</td>
                    <td>+/-</td>
                  </tr>
                )}
              </thead>
              <tbody>
                {datas.map((score, index) => {
                  const team = getTeam(
                    getPosition(score.positionId)?.teamId || 0
                  );
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td rowSpan={isMobile ? 2 : 1}>{index + 1}</td>
                        <td colSpan={isMobile ? 7 : 1}>
                          <LeftCenterDiv isMobile={false}>
                            <TeamName positionId={score.positionId} />
                            {team && isAdmin && (
                              <PencilSquare
                                role="button"
                                className="mx-2"
                                onClick={() => {
                                  setTeam(team);
                                  showTeam(true);
                                }}
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
                            <td>{score.goalDiff}</td>
                          </>
                        )}
                      </tr>
                      {isMobile && (
                        <tr style={{ fontSize: "12px" }}>
                          <td className="w-25">J:{score.game}</td>
                          <td className="w-25">G:{score.win}</td>
                          <td className="w-25">N:{score.neutral}</td>
                          <td className="w-25">P:{score.loss}</td>
                          <td className="w-25">BP:{score.goalFor}</td>
                          <td className="w-25">BC:{score.goalAgainst}</td>
                          <td className="w-25">GA:{score.goalDiff}</td>
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
      <TeamModal team={team} />
    </>
  );
};

export default RankTable;
