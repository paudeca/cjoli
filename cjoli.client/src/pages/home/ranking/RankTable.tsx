import styled from "@emotion/styled";
import React from "react";
import { Card, Table, Button, Offcanvas, Toast, ToastContainer } from "react-bootstrap";
import { Phase } from "../../../models/Phase";
import { useCJoli } from "../../../contexts/CJoliContext";

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
  const [show, setShow] = React.useState(false);
  const {
    getTeam,
    getPosition,
    state: { ranking },
  } = useCJoli();
  return (
    <>
      {phase?.squads.map((squad) => {
        const scores = ranking?.scores.find((s) => s.squadId == squad.id);
        const datas = scores ? scores.scores : [];
        datas.sort((a, b) => (a.total > b.total ? -1 : 1));
        return (
          <Card.Body key={squad.id}>
            <Card.Title>{squad.name}</Card.Title>
            <Table striped bordered hover size='sm' style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th className='w-50'>Team</th>
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
                {datas.map((score, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{getTeam(getPosition(score.positionId)!.teamId)!.name}</td>
                    <MyTd>{score.total}</MyTd>
                    <td>{score.game}</td>
                    <td>{score.win}</td>
                    <td>{score.neutral}</td>
                    <td>{score.loss}</td>
                    <td>{score.goalFor}</td>
                    <td>{score.goalAgainst}</td>
                    <td>{score.goalDiff}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        );
      })}
      <Button onClick={() => setShow(true)}>Create</Button>

      <Offcanvas show={false && show} onHide={() => setShow(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Create Team</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.</Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position='top-end'>
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
          <Toast.Header>
            <strong className='me-auto'>Bootstrap</strong>
            <small>11 mins ago</small>
          </Toast.Header>
          <Toast.Body>Woohoo, you're reading this text in a Toast!</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default RankTable;
