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
import React from "react";
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

interface TeamStackProps {
  teamId?: number;
  modeCast?: boolean;
}

const TeamStack = ({ teamId, modeCast }: TeamStackProps) => {
  const { teams, getTeam, getTeamRank, tourney } = useCJoli();
  const { teamId: teamIdParam } = useParams();
  const { isMobile } = useScreenSize();
  const [teamB, setTeamB] = React.useState<Team | undefined>(undefined);
  const { setShow: showTeam } = useModal("team");
  const { isRootAdmin } = useUser();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = React.useState("general");

  const team = getTeam(teamId ?? parseInt(teamIdParam!));
  if (!team) {
    return <>No team found</>;
  }
  const rank = getTeamRank(team);

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5" data-testid="team">
      <div className="p-2">
        <CJoliCard>
          <Card.Header>
            <Stack direction="horizontal" gap={5}>
              <Card.Img variant="top" src={team.logo} style={{ width: 100 }} />
              <Stack>
                <Card.Title className="ms-auto">{team?.name}</Card.Title>
                <Card.Subtitle className="ms-auto mb-2 text-muted">
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
              <Card className="p-2">
                <Stack className="py-3">
                  <Form className="mx-auto">
                    <Row
                      className={`align-items-center ${!isMobile ? "flex-nowrap" : ""}`}
                    >
                      <Col xs="auto">
                        <Form.Label as="h4">{team?.name}</Form.Label>
                      </Col>
                      {!modeCast && (
                        <>
                          <Col xs="auto">
                            <Badge bg="secondary">VS</Badge>
                          </Col>
                          <Col xs={12}>
                            <TeamSelect
                              teams={
                                teams?.filter((t) => t.id != team?.id) ?? []
                              }
                              onChangeTeam={(team) => setTeamB(team)}
                            />
                          </Col>
                        </>
                      )}
                    </Row>
                  </Form>
                </Stack>
                <Stack direction={isMobile ? "vertical" : "horizontal"}>
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
