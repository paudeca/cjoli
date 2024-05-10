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
import { useNavigate, useParams } from "react-router-dom";
import { useCJoli } from "../../hooks/useCJoli";
import moment from "moment";
import { useForm } from "react-hook-form";
import React from "react";
import { Rank, Score, Team } from "../../models";
import {
  ArrowLeft,
  CaretDownFill,
  CaretUpFill,
  PauseFill,
} from "react-bootstrap-icons";
import useScreenSize from "../../hooks/useScreenSize";
import TeamName from "../../components/TeamName";
import LeftCenterDiv from "../../components/LeftCenterDiv";
import TeamModal from "../../modals/TeamModal";
import { useModal } from "../../contexts/ModalContext";
import { useUser } from "../../hooks/useUser";
import CJoliTooltip from "../../components/CJoliTooltip";
import useUid from "../../hooks/useUid";
import TeamRadar from "./team/TeamRadar";

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
  const result =
    val == undefined || !valueB || valB == undefined ? 0 : calcul(val, valB);
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
        {active && !!valB && result == 0 && (
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
  const { setShow: showTeam } = useModal("team");
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const uid = useUid();

  const team = getTeam(parseInt(teamId!));
  if (!team) {
    return <>No tema found</>;
  }
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);
  const score = getScoreForTeam(team);
  const scoreB = teamB && getScoreForTeam(teamB);
  let datas = [{ team, rank, score }];
  if (teamB) {
    datas = [...datas, { team: teamB, rank: rankB, score: scoreB }];
  }

  const columns = [
    {
      label: "Rang",
      description: "Classement",
      callRank: (r: Rank) => r.order || 0,
      up: false,
      active: true,
    },
    {
      label: "PTS",
      description: "Points",
      callScore: (s: Score) => s.total,
      up: true,
      active: true,
    },
    {
      label: "PJ",
      description: "Parties jouées",
      callScore: (s: Score) => s.game,
      up: true,
      active: false,
    },
    {
      label: "V",
      description: "Victoires",
      callScore: (s: Score) => s.win,
      up: true,
      active: true,
    },
    {
      label: "N",
      description: "Parties nulles",
      callScore: (s: Score) => s.neutral,
      up: true,
      active: false,
    },
    {
      label: "D",
      description: "Défaites",
      callScore: (s: Score) => s.loss,
      up: false,
      active: true,
    },
    {
      label: "BP",
      description: "Buts pour",
      callScore: (s: Score) => s.goalFor,
      up: true,
      active: true,
    },
    {
      label: "BC",
      description: "Buts contre",
      callScore: (s: Score) => s.goalAgainst,
      up: false,
      active: true,
    },
    {
      label: "BL",
      description: "Blanchissages",
      callScore: (s: Score) => s.shutOut,
      up: true,
      active: true,
    },
    {
      label: "+/-",
      description: "Goal average",
      callScore: (s: Score) => s.goalDiff,
      up: true,
      active: true,
    },
    {
      label: "PEN",
      description: "Pénalités",
      callScore: (s: Score) => s.penalty,
      up: false,
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
                  <Stack>Position: {rank?.order}</Stack>
                  <Stack>
                    Youngest:
                    {team.youngest ? moment(team.youngest).format("L") : "-"}
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
              <Stack direction={isMobile ? "vertical" : "horizontal"}>
                <TeamRadar
                  teamA={{ team, rank: rank!, score: score! }}
                  teamB={{ team: teamB, rank: rankB, score: scoreB }}
                  direction={isMobile ? "vertical" : "horizontal"}
                />

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
                        <td>
                          <CJoliTooltip info={c.description}>
                            {c.label}
                          </CJoliTooltip>
                        </td>
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
              </Stack>
            </Card>
            <Stack direction="horizontal" className="p-3">
              <Button variant="primary" onClick={() => navigate(`/${uid}`)}>
                <ArrowLeft /> Back
              </Button>
              {isAdmin && (
                <div className="ms-auto">
                  <Button variant="primary" onClick={() => showTeam(true)}>
                    Edit
                  </Button>
                </div>
              )}
            </Stack>
          </Card.Body>
        </CJoliCard>
      </div>
      <TeamModal team={team} />
    </CJoliStack>
  );
};

export default TeamStack;
