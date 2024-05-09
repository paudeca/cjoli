import {
  Badge,
  Card,
  Stack,
  Form,
  Col,
  Button,
  Row,
  Table,
} from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useParams } from "react-router-dom";
import { useCJoli } from "../../hooks/useCJoli";
import moment from "moment";
import { useForm } from "react-hook-form";
import React from "react";
import { Rank, Score, Team } from "../../models";
import { CaretDownFill, CaretUpFill, PauseFill } from "react-bootstrap-icons";
import useScreenSize from "../../hooks/useScreenSize";
import TeamName from "../../components/TeamName";
import LeftCenterDiv from "../../components/LeftCenterDiv";

type CellIconProps<T> = {
  value?: T;
  valueB?: T;
  call: (a: T) => number | undefined;
  up?: boolean;
  active: boolean;
};

const CellIcon = <T,>({
  value,
  valueB,
  call,
  up,
  active,
}: CellIconProps<T>) => {
  const calcul = up
    ? (a: number, b: number) => (a > b ? 1 : a == b ? 0 : -1)
    : (a: number, b: number) => (a < b ? 1 : a == b ? 0 : -1);
  const val = value && call(value);
  const valB = valueB && call(valueB);
  const result = !val || !valueB || valB == undefined ? 0 : calcul(val, valB);
  return (
    <td>
      <LeftCenterDiv width={40}>
        {val === undefined ? "-" : val}
        {active && result == 1 && (
          <CaretUpFill color="rgb(25, 135, 84)" className="mx-1" />
        )}
        {active && result == -1 && (
          <CaretDownFill color="rgb(220, 53, 69)" className="mx-1" />
        )}
        {active && valB && result == 0 && (
          <PauseFill style={{ transform: "rotate(90deg)" }} color="#ffc107" />
        )}
      </LeftCenterDiv>
    </td>
  );
};

const TeamStack = () => {
  const { teams, getTeam, getTeamRank, getScoreForTeam } = useCJoli();
  const { teamId } = useParams();
  const { register } = useForm();
  const { isMobile } = useScreenSize();
  const [teamB, setTeamB] = React.useState<Team | undefined>(undefined);

  const team = getTeam(parseInt(teamId!));
  if (!team) {
    return <>No tema found</>;
  }
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);
  const score = getScoreForTeam(team);
  const scoreB = teamB && getScoreForTeam(teamB);
  let datas = [{ team, rank, score }];
  if (teamB && rankB && scoreB) {
    datas = [...datas, { team: teamB, rank: rankB, score: scoreB }];
  }

  const columns = [
    {
      label: "Rang",
      callRank: (r: Rank) => r.order || 0,
      up: false,
      active: true,
    },
    { label: "PTS", callScore: (s: Score) => s.total, up: true, active: true },
    { label: "PJ", callScore: (s: Score) => s.game, up: true, active: false },
    { label: "V", callScore: (s: Score) => s.win, up: true, active: true },
    { label: "N", callScore: (s: Score) => s.neutral, up: true, active: false },
    { label: "D", callScore: (s: Score) => s.loss, up: false, active: true },
    { label: "BP", callScore: (s: Score) => s.goalFor, up: true, active: true },
    {
      label: "BC",
      callScore: (s: Score) => s.goalAgainst,
      up: false,
      active: true,
    },
    { label: "BL", callScore: (s: Score) => s.shutOut, up: true, active: true },
    {
      label: "GA",
      callScore: (s: Score) => s.goalDiff,
      up: true,
      active: true,
    },
  ];
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Header>
            <Stack direction="horizontal" gap={5}>
              <Card.Img variant="top" src={team.logo} style={{ width: 100 }} />
              <Stack>
                <Card.Title className="ms-auto">{team?.name}</Card.Title>
                <Card.Subtitle className="ms-auto mb-2 text-muted">
                  <Stack>Position : {rank?.order}</Stack>
                  <Stack>
                    Youngest:{" "}
                    {team.youngest ? moment(team.youngest).format("L") : "-"}
                  </Stack>
                  <Stack>
                    Penality: {team.datas ? team.datas.penalty : "-"}
                  </Stack>
                </Card.Subtitle>
              </Stack>
            </Stack>
          </Card.Header>
          <Card.Body>
            <Card className="p-2">
              <Stack className="py-3">
                <Form className="mx-auto">
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <Form.Label as="h4">{team?.name}</Form.Label>
                    </Col>
                    <Col xs="auto">
                      <Badge bg="secondary">VS</Badge>
                    </Col>
                    <Col xs="auto">
                      <Form.Select
                        {...register("teamVS", {
                          onChange: (e: React.FormEvent<HTMLInputElement>) => {
                            setTeamB(getTeam(parseInt(e.currentTarget.value)));
                          },
                        })}
                      >
                        <option>Select Team</option>
                        {teams
                          ?.filter((t) => t.id != team.id)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                      </Form.Select>
                    </Col>
                    {/*<Col xs="auto">
                      <Stack
                        direction="horizontal"
                        className="align-items-center"
                      >
                        <Form.Select aria-label="Default select example">
                          <option value="1">Scooby 2024</option>
                          <option value="2">Saison 2023/2024</option>
                          <option value="3">Tous les tournois</option>
                        </Form.Select>
                      </Stack>
                        </Col>*/}
                  </Row>
                </Form>
              </Stack>
              <Stack>
                {!isMobile && (
                  <Table
                    striped
                    bordered
                    size="sm"
                    style={{ textAlign: "center" }}
                  >
                    <thead>
                      <tr>
                        <th />
                        {columns.map((c, i) => (
                          <th key={i}>
                            <LeftCenterDiv width={40}>{c.label}</LeftCenterDiv>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datas.map(({ team, rank, score }, i) => (
                        <tr key={team.id}>
                          <td>
                            <LeftCenterDiv>
                              <TeamName teamId={team.id} />
                            </LeftCenterDiv>
                          </td>
                          {columns.map((c, j) =>
                            c.callRank ? (
                              <CellIcon
                                key={j}
                                value={rank}
                                valueB={rankB}
                                call={c.callRank}
                                active={c.active && i == 0}
                                up={c.up}
                              />
                            ) : (
                              <CellIcon
                                key={j}
                                value={score}
                                valueB={scoreB}
                                call={c.callScore!}
                                active={c.active && i == 0}
                                up={c.up}
                              />
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                {isMobile && (
                  <Table
                    striped
                    bordered
                    size="sm"
                    style={{ textAlign: "center" }}
                  >
                    <thead>
                      <tr>
                        <th />
                        {datas.map(({ team }) => (
                          <th key={team.id}>
                            <TeamName teamId={team.id} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {columns.map((c, i) => (
                        <tr key={i}>
                          <td>{c.label}</td>
                          {datas.map(({ rank, score }, j) => (
                            <React.Fragment key={j}>
                              {c.callRank ? (
                                <CellIcon
                                  value={rank}
                                  valueB={rankB}
                                  call={c.callRank}
                                  active={c.active && j == 0}
                                  up={c.up}
                                />
                              ) : (
                                <CellIcon
                                  value={score}
                                  valueB={scoreB}
                                  call={c.callScore!}
                                  active={c.active && j == 0}
                                  up={c.up}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Stack>
            </Card>
            <div className="d-grid gap-3 w-25 ms-auto pt-2">
              <Button variant="primary">Edit</Button>
            </div>
          </Card.Body>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default TeamStack;
