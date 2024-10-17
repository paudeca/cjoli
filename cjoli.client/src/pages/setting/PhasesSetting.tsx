import { Button, Card, Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import ConfirmationModal from "../../modals/ConfirmationModal";
import React from "react";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import * as settingService from "../../services/settingService";
import { useModal } from "../../hooks/useModal";
import AddItemModal from "./AddItemModal";
import SquadsAdmin from "./SquadsSetting";
import { useSetting } from "../../hooks/useSetting";

const PhasesSetting = () => {
  const { tourney, register, saveTourney, phase, selectPhase } = useSetting();
  const { loadTourney } = useCJoli();
  const uid = useUid();

  const { setShow: showAddPhase } = useModal("addPhase");
  const { setShow: showConfirmDelete } = useModal("confirmDeletePhase");
  const { setShow: showAddSquad } = useModal("addSquad");

  const removePhase = React.useCallback(async () => {
    if (!phase) {
      return false;
    }
    const tourney = await settingService.removePhase(uid, phase.id);
    loadTourney(tourney);
    return true;
  }, [uid, phase, loadTourney]);

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Phases</Card.Title>
        <Tabs
          className="mb-3"
          fill
          variant="underline"
          defaultActiveKey={0}
          onSelect={(k) => selectPhase(tourney.phases[parseInt(k ?? "0")])}
        >
          {tourney.phases.map((phase, i) => (
            <Tab key={phase.id} eventKey={i} title={phase.name}>
              <Form.Group as={Row} controlId={`phase.name.${phase.id}`}>
                <Form.Label column lg={1}>
                  Name
                </Form.Label>
                <Col lg={5}>
                  <Form.Control {...register(`phases.${i}.name`)} />
                </Col>
                <Col lg={6}>
                  <Button className="mx-3" onClick={() => showAddSquad(true)}>
                    Add Squad
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => showConfirmDelete(true)}
                  >
                    <Trash3 />
                  </Button>
                </Col>
              </Form.Group>

              <SquadsAdmin indexPhase={i} />
            </Tab>
          ))}
        </Tabs>
        <Row>
          <Col>
            <Button onClick={() => showAddPhase(true)}>Add Phase</Button>
          </Col>
        </Row>
      </Card.Body>
      <ConfirmationModal
        id="confirmDeletePhase"
        title="Remove Phase"
        onConfirm={removePhase}
      >
        Are you sure you want to remove this Phase '{phase?.name}'?
      </ConfirmationModal>

      <AddItemModal
        id="addPhase"
        title="Add Phase"
        onItemTeam={async (name: string) => {
          saveTourney({
            ...tourney,
            phases: [...tourney.phases, { id: 0, name, squads: [] }],
          });
          return true;
        }}
      />

      <AddItemModal
        id="addSquad"
        title="Add Squad"
        onItemTeam={async (name: string) => {
          if (!phase) {
            return false;
          }
          const newPhase = {
            ...phase,
            squads: [
              ...phase.squads,
              { id: 0, name, positions: [], matches: [] },
            ],
          };
          const phases = tourney.phases.map((p) =>
            p.id == phase!.id ? newPhase : p
          );
          saveTourney({
            ...tourney,
            phases,
          });
          return true;
        }}
      />
    </Card>
  );
};

export default PhasesSetting;
