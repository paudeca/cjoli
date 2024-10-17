import { Button, Card, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import ConfirmationModal from "../../modals/ConfirmationModal";
import React from "react";
import * as settingService from "../../services/settingService";
import useUid from "../../hooks/useUid";
import { useCJoli } from "../../hooks/useCJoli";
import { useModal } from "../../hooks/useModal";
import AddPositionModal from "./AddPositionModal";
import PositionsAdmin from "./PositionsSetting";
import AddMatchModal from "./AddMatchModal";
import MatchesAdmin from "./MatchesSetting";
import { useSetting } from "../../hooks/useSetting";

interface SquadsSettingProps {
  indexPhase: number;
}

const SquadsSetting = ({ indexPhase }: SquadsSettingProps) => {
  const { tourney, register, saveTourney, squad, selectSquad } = useSetting();

  const phase = tourney.phases[indexPhase];
  const uid = useUid();
  const { loadTourney } = useCJoli();

  const { setShow: showConfirmDelete } = useModal("confirmDeleteSquad");
  const { setShow: showAddPosition } = useModal(`addPosition-${phase!.id}`);
  const { setShow: showAddMatch } = useModal(`addMatch-${squad?.id}`);

  const removeSquad = React.useCallback(async () => {
    if (!squad) {
      return false;
    }
    const tourney = await settingService.removeSquad(uid, phase.id, squad.id);
    loadTourney(tourney);
    return true;
  }, [uid, phase, squad, loadTourney]);

  return (
    <Row className="p-3">
      <Card>
        <Card.Body>
          <Tab.Container
            defaultActiveKey={phase.squads[0].id}
            onSelect={(k) =>
              selectSquad(phase.squads.find((s) => s.id.toString() == k)!)
            }
          >
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
                  {phase!.squads.map((squad, i) => (
                    <Tab.Pane key={squad.id} eventKey={squad.id}>
                      <Form.Group
                        as={Row}
                        controlId={`squad.name.${squad.id}`}
                        className="p-3"
                      >
                        <Form.Label column lg={1}>
                          Name
                        </Form.Label>
                        <Col lg={5}>
                          <Form.Control
                            {...register(
                              `phases.${indexPhase}.squads.${i}.name`
                            )}
                          />
                        </Col>
                        <Col lg={6}>
                          <Button
                            className="mx-3"
                            onClick={() => showAddPosition(true)}
                          >
                            Add Position
                          </Button>
                          <Button
                            className="mx-3"
                            onClick={() => showAddMatch(true)}
                          >
                            Add Match
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => showConfirmDelete(true)}
                          >
                            <Trash3 />
                          </Button>
                        </Col>
                      </Form.Group>

                      <PositionsAdmin
                        squad={squad}
                        indexPhase={indexPhase}
                        indexSquad={i}
                      />

                      <MatchesAdmin
                        squad={squad}
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

      <ConfirmationModal
        id="confirmDeleteSquad"
        title="Remove Squad"
        onConfirm={removeSquad}
      >
        Are you sure you want to remove this squad '{squad?.name}'?
      </ConfirmationModal>

      <AddPositionModal
        phase={phase!}
        onAddPosition={async (position) => {
          if (!squad) {
            return false;
          }
          const newSquad = {
            ...squad,
            positions: [...squad.positions, position],
          };
          const squads = phase!.squads.map((s) =>
            s.id != squad.id ? s : newSquad
          );
          const newPhase = { ...phase!, squads };
          const phases = tourney.phases.map((p) =>
            p.id != phase!.id ? p : newPhase
          );
          saveTourney({ ...tourney, phases });
          return true;
        }}
      />

      <AddMatchModal
        squad={squad!}
        onAddMatch={async (match) => {
          if (!squad) {
            return false;
          }
          const newSquad = {
            ...squad,
            matches: [...squad.matches, match],
          };
          const squads = phase!.squads.map((s) =>
            s.id != squad.id ? s : newSquad
          );
          const newPhase = { ...phase!, squads };
          const phases = tourney.phases.map((p) =>
            p.id != phase!.id ? p : newPhase
          );
          saveTourney({ ...tourney, phases });
          return true;
        }}
      />
    </Row>
  );
};

export default SquadsSetting;
