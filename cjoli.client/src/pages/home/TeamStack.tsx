/* eslint-disable complexity */
import {
  Badge,
  Card,
  Stack,
  Form,
  Col,
  Button,
  Row,
  Nav,
} from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useNavigate, useParams } from "react-router-dom";
import { useCJoli } from "../../hooks/useCJoli";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Team } from "../../models";
import { ArrowLeft } from "react-bootstrap-icons";
import useScreenSize from "../../hooks/useScreenSize";
import TeamModal from "../../modals/TeamModal";
import { useUser } from "../../hooks/useUser";
import TeamRadar from "./team/TeamRadar";
import TeamTable from "./team/TeamTable";
import TeamTime from "./team/TeamTime";
import { useModal } from "../../hooks/useModal";
import { Trans } from "react-i18next";
import TeamSelect from "../../components/TeamSelect";

interface TeamStackProps extends JSX.IntrinsicAttributes {
  teamId?: number;
  teamIdB?: number;
  modeCast?: boolean;
}

const TeamStack = ({ teamId, teamIdB, modeCast }: TeamStackProps) => {
  const {
    teams,
    getTeam,
    getTeamRank,
    tourney,
    isCastPage,
    modeScore,
    selectModeScore,
    classNamesCast,
    isXl,
  } = useCJoli();
  const { teamId: teamIdParam } = useParams();
  const { isMobile } = useScreenSize();
  const [teamB, setTeamB] = React.useState<Team | undefined>(
    teamIdB ? getTeam(teamIdB) : undefined
  );
  const { setShow: showTeam } = useModal("team");
  const { isRootAdmin } = useUser();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = React.useState("general");

  useEffect(() => {
    if (teamIdB) {
      setTeamB(getTeam(teamIdB));
    }
  }, [teamIdB, setTeamB, getTeam]);

  const team = getTeam(teamId ?? parseInt(teamIdParam!));
  if (!team) {
    return <>No team found</>;
  }
  const rank = getTeamRank(team);

  return (
    <CJoliStack
      gap={0}
      className={`${isXl ? "col-md-12" : isCastPage ? "col-md-10" : "col-md-8"} mx-auto mt-5`}
      data-testid="team"
    >
      <div className="p-2">
        <CJoliCard>
          <Card.Header>
            <Stack direction="horizontal" gap={5}>
              <Card.Img variant="top" src={team.logo} style={{ width: 100 }} />
              <Stack>
                <Card.Title className={`ms-auto ${classNamesCast.table}`}>
                  {team?.name}
                </Card.Title>
                <Card.Subtitle
                  className={`ms-auto mb-2 text-muted ${classNamesCast.table}`}
                >
                  <Stack>
                    <Trans i18nKey="team.position">Position</Trans>:{" "}
                    {rank?.order}
                  </Stack>
                  {tourney?.config.hasYoungest && (
                    <Stack>
                      <Trans i18nKey="team.youngest">Youngest</Trans>:
                      {team.youngest ? dayjs(team.youngest).format("L") : "-"}
                    </Stack>
                  )}
                </Card.Subtitle>
              </Stack>
            </Stack>
          </Card.Header>
          <Card.Body>
            {!modeCast && (
              <Nav variant="underline" defaultActiveKey={activeKey}>
                <Nav.Item>
                  <Nav.Link
                    eventKey="general"
                    onClick={() => setActiveKey("general")}
                  >
                    <Trans i18nKey="team.chart.general">General</Trans>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="timeline"
                    onClick={() => setActiveKey("timeline")}
                  >
                    <Trans i18nKey="team.chart.timeline">Timeline</Trans>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            )}
            {activeKey == "general" && (
              <Card className={`p-2 ${classNamesCast.table}`}>
                {!modeCast && (
                  <Stack className="py-3">
                    <Form className="mx-auto">
                      <Row
                        className={`align-items-center ${!isMobile ? "flex-nowrap" : ""}`}
                      >
                        <Col xs="auto">
                          <Form.Label as={isXl ? "h1" : "h4"}>
                            {team?.name}
                          </Form.Label>
                        </Col>
                        <Col xs="auto">
                          <Badge bg="secondary">VS</Badge>
                        </Col>
                        {!modeCast && (
                          <>
                            <Col xs={isMobile ? 12 : 6}>
                              <TeamSelect
                                teams={
                                  teams?.filter((t) => t.id != team?.id) ?? []
                                }
                                onChangeTeam={(team) => setTeamB(team)}
                              />
                            </Col>
                            <Col xs="auto" className="py-3">
                              <Form.Select
                                defaultValue={modeScore}
                                onChange={(e) =>
                                  selectModeScore(
                                    e.target.value as
                                      | "tourney"
                                      | "season"
                                      | "allTime"
                                  )
                                }
                              >
                                <option value="tourney">{tourney?.name}</option>
                                <option value="season">
                                  <Trans i18nKey="team.currentSeason">
                                    Current season
                                  </Trans>
                                </option>
                                <option value="allTime">
                                  <Trans i18nKey="team.allSeasons">
                                    All seasons
                                  </Trans>
                                </option>
                              </Form.Select>
                            </Col>
                          </>
                        )}
                        {modeCast && (
                          <Col xs={12}>
                            <Form.Label as={isXl ? "h1" : "h4"}>
                              {teamB?.name}
                            </Form.Label>
                          </Col>
                        )}
                      </Row>
                    </Form>
                  </Stack>
                )}
                <Stack
                  direction={isMobile ? "vertical" : "horizontal"}
                  className="align-items-start"
                >
                  <TeamRadar team={team} teamB={teamB} />
                  <TeamTable team={team} teamB={teamB} />
                </Stack>
              </Card>
            )}
            {activeKey == "timeline" && (
              <Card className="p-2">
                <Stack className="py-3">
                  <TeamTime />
                </Stack>
              </Card>
            )}

            {!modeCast && (
              <Stack direction="horizontal" className="p-3">
                <Button variant="primary" onClick={() => navigate(-1)}>
                  <ArrowLeft /> <Trans i18nKey="button.back">Back</Trans>
                </Button>
                {isRootAdmin && (
                  <div className="ms-auto">
                    <Button variant="primary" onClick={() => showTeam(true)}>
                      <Trans i18nKey="button.edit">Edit</Trans>
                    </Button>
                  </div>
                )}
              </Stack>
            )}
          </Card.Body>
        </CJoliCard>
      </div>
      <TeamModal team={team} />
    </CJoliStack>
  );
};

export default TeamStack;
