import styled from "@emotion/styled";
import { Card, Table } from "react-bootstrap";
import { Phase } from "../../../models/Phase";
import { useCJoli } from "../../../contexts/CJoliContext";
import TeamName from "../../../components/TeamName";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import { PencilSquare } from "react-bootstrap-icons";
import TeamModal from "../../../modals/TeamModal";
import { useModal } from "../../../contexts/ModalContext";
import React from "react";
import { Team } from "../../../models/Team";

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
  const {
    state: { ranking },
    getPosition,
    getTeam,
  } = useCJoli();
  const { setShow: showTeam } = useModal("team");
  const [team, setTeam] = React.useState<Team | undefined>(undefined);
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
                  <th>#</th>
                  <th className="w-50">Team</th>
                  <MyTh>PTS</MyTh>
                  <th>J</th>
                  <th>G</th>
                  <th>N</th>
                  <th>P</th>
                  <th>BP</th>
                  <th>BC</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                {datas.map((score, index) => {
                  const team = getTeam(
                    getPosition(score.positionId)?.teamId || 0
                  );
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <LeftCenterDiv>
                          <TeamName positionId={score.positionId} />
                          {team && (
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
                      <MyTd>{score.total}</MyTd>
                      <td>{score.game}</td>
                      <td>{score.win}</td>
                      <td>{score.neutral}</td>
                      <td>{score.loss}</td>
                      <td>{score.goalFor}</td>
                      <td>{score.goalAgainst}</td>
                      <td>{score.goalDiff}</td>
                    </tr>
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
