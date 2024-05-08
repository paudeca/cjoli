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
import { Team } from "../../models";
import { ArrowDownCircleFill, ArrowUpCircleFill } from "react-bootstrap-icons";

type CellIconProps<T> = {
  value: T;
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
  const val = call(value);
  const valB = valueB && call(valueB);
  const result = !val || !valueB || valB == undefined ? 0 : calcul(val, valB);
  return (
    <td style={{ paddingRight: !active || result == 0 ? 25 : 0 }}>
      {val === undefined ? "-" : val}
      {active && result == 1 && (
        <ArrowUpCircleFill color="rgb(25, 135, 84)" className="mx-1" />
      )}
      {active && result == -1 && (
        <ArrowDownCircleFill color="rgb(220, 53, 69)" className="mx-1" />
      )}
    </td>
  );
};

const TeamStack = () => {
  const { teams, getTeam, getTeamRank, getAllScoreForTeam } = useCJoli();
  const { teamId } = useParams();
  const { register } = useForm();
  const [teamB, setTeamB] = React.useState<Team | undefined>(undefined);

  const team = getTeam(parseInt(teamId!));
  if (!team) {
    return <>No tema found</>;
  }
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);
  const score = getAllScoreForTeam(team);
  const scoreB = teamB && getAllScoreForTeam(teamB);
  let datas = [{ team, rank, score }];
  if (teamB && rankB && scoreB) {
    datas = [...datas, { team: teamB, rank: rankB, score: scoreB }];
  }
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
                <Table
                  striped
                  bordered
                  size="sm"
                  style={{ textAlign: "center" }}
                >
                  <thead>
                    <tr>
                      <th />
                      <th>Rang</th>
                      <th>PTS</th>
                      <th>PJ</th>
                      <th>V</th>
                      <th>N</th>
                      <th>D</th>
                      <th>BP</th>
                      <th>BC</th>
                      <th>BL</th>
                      <th>GA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datas.map(({ team, rank, score }, i) => (
                      <tr key={team.id}>
                        <td>
                          {team?.logo ? (
                            <img src={team?.logo} width={24} />
                          ) : (
                            team.shortName
                          )}
                        </td>
                        <CellIcon
                          value={rank}
                          valueB={rankB}
                          call={(r) => r?.order}
                          key="order"
                          active={i == 0}
                        />
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.total}
                          up
                          active={i == 0}
                        />
                        <td>{score.game}</td>
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.win}
                          up
                          active={i == 0}
                        />
                        <td>{score.neutral}</td>
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.loss}
                          active={i == 0}
                        />
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.goalFor}
                          up
                          active={i == 0}
                        />
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.goalAgainst}
                          active={i == 0}
                        />
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.shutOut}
                          up
                          active={i == 0}
                        />
                        <CellIcon
                          value={score}
                          valueB={scoreB}
                          call={(s) => s.goalDiff}
                          up
                          active={i == 0}
                        />
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
