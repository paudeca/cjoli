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
import moment from "moment";
import { useForm } from "react-hook-form";
import React from "react";
import { Team } from "../../models";
import { ArrowLeft } from "react-bootstrap-icons";
import useScreenSize from "../../hooks/useScreenSize";
import TeamModal from "../../modals/TeamModal";
import { useUser } from "../../hooks/useUser";
import useUid from "../../hooks/useUid";
import TeamRadar from "./team/TeamRadar";
import TeamTable from "./team/TeamTable";
import TeamTime from "./team/TeamTime";
import { useModal } from "../../hooks/useModal";

const TeamStack = () => {
  const { teams, getTeam, getTeamRank } = useCJoli();
  const { teamId } = useParams();
  const { register } = useForm();
  const { isMobile } = useScreenSize();
  const [teamB, setTeamB] = React.useState<Team | undefined>(undefined);
  const { setShow: showTeam } = useModal("team");
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const uid = useUid();
  const [activeKey, setActiveKey] = React.useState("general");

  const team = getTeam(parseInt(teamId!));
  if (!team) {
    return <>No team found</>;
  }
  const rank = getTeamRank(team);

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
            <Nav variant="underline" defaultActiveKey={activeKey}>
              <Nav.Item>
                <Nav.Link
                  eventKey="general"
                  onClick={() => setActiveKey("general")}
                >
                  General
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="timeline"
                  onClick={() => setActiveKey("timeline")}
                >
                  Timeline
                </Nav.Link>
              </Nav.Item>
            </Nav>
            {activeKey == "general" && (
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
                            onChange: (
                              e: React.FormEvent<HTMLInputElement>
                            ) => {
                              setTeamB(
                                getTeam(parseInt(e.currentTarget.value))
                              );
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
