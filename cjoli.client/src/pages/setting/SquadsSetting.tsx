import { Button, Card, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import { useModal } from "../../hooks/useModal";
import PositionsSetting from "./PositionsSetting";
import MatchesSetting from "./MatchesSetting";
import { useSetting } from "../../hooks/useSetting";
import useScreenSize from "../../hooks/useScreenSize";
import { Phase, Squad } from "../../models";

interface SquadsSettingProps {
  indexPhase: number;
}

const SquadsSetting = ({ indexPhase }: SquadsSettingProps) => {
  const { tourney, register } = useSetting();
  const { isMobile } = useScreenSize();

  const phase = tourney.phases[indexPhase];

  const { setShowWithData: showConfirmDelete } = useModal<{
    phase: Phase;
    squad: Squad;
  }>("confirmDeleteSquad");
  const { setShowWithData: showAddPosition } = useModal<{
    phase: Phase;
    squad: Squad;
  }>("addPosition");
  const { setShowWithData: showAddMatch } = useModal<{
    phase: Phase;
    squad: Squad;
  }>("addMatch");

  return (
    <Row className={isMobile ? "py-3" : "p-3"}>
      <Card>
        <Card.Body className={isMobile ? "px-0" : "px-3"}>
          <Tab.Container defaultActiveKey={phase.squads[0]?.id}>
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  {phase.squads.map((squad) => (
                    <Nav.Item key={squad.id}>
                      <Nav.Link eventKey={squad.id}>{squad.name}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  {phase.squads.map((squad, i) => (
                    <Tab.Pane key={squad.id} eventKey={squad.id}>
                      <Form.Group
                        as={Row}
                        controlId={`squad.name.${squad.id}`}
                        className="p-3"
                      >
                        <Form.Label column lg={1}>
                          Name
                        </Form.Label>
                        <Col lg={5} className="mb-3">
                          <Form.Control
                            {...register(
                              `phases.${indexPhase}.squads.${i}.name`
                            )}
                          />
                        </Col>
                        <Col lg={6}>
                          <Button
                            className="mx-3 mb-3"
                            onClick={() =>
                              showAddPosition(true, { phase, squad })
                            }
                          >
                            Add Position
                          </Button>
                          <Button
                            className="mx-3 mb-3"
                            onClick={() => showAddMatch(true, { phase, squad })}
                          >
                            Add Match
                          </Button>
                          <Button
                            variant="danger"
                            className="mb-3"
                            onClick={() =>
                              showConfirmDelete(true, { squad, phase })
                            }
                          >
                            <Trash3 />
                          </Button>
                        </Col>
                      </Form.Group>

                      <PositionsSetting
                        squad={squad}
                        phase={phase}
                        indexPhase={indexPhase}
                        indexSquad={i}
                      />

                      <MatchesSetting
                        squad={squad}
                        phase={phase}
                        indexPhase={indexPhase}
                        indexSquad={i}
                      />
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Row>
  );
};

export default SquadsSetting;
