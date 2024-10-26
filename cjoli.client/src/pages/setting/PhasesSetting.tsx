import { Button, Card, Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import { useModal } from "../../hooks/useModal";
import SquadsSetting from "./SquadsSetting";
import { useSetting } from "../../hooks/useSetting";
import { Phase } from "../../models";

const PhasesSetting = () => {
  const { tourney, register } = useSetting();

  const { setShow: showAddPhase } = useModal("addPhase");
  const { setShowWithData: showConfirmDelete } =
    useModal<Phase>("confirmDeletePhase");
  const { setShowWithData: showAddSquad } = useModal<Phase>("addSquad");

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Phases</Card.Title>
        <Tabs className="mb-3" fill variant="underline" defaultActiveKey={0}>
          {tourney.phases.map((phase, i) => (
            <Tab key={phase.id} eventKey={i} title={phase.name}>
              <Form.Group as={Row} controlId={`phase.name.${phase.id}`}>
                <Form.Label column lg={1}>
                  Name
                </Form.Label>
                <Col lg={5} className="mb-3">
                  <Form.Control {...register(`phases.${i}.name`)} />
                </Col>
                <Col lg={6}>
                  <Button
                    className="mx-3"
                    onClick={() => showAddSquad(true, phase)}
                  >
                    Add Squad
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => showConfirmDelete(true, phase)}
                  >
                    <Trash3 />
                  </Button>
                </Col>
              </Form.Group>

              <SquadsSetting indexPhase={i} />
            </Tab>
          ))}
        </Tabs>
        <Row>
          <Col>
            <Button onClick={() => showAddPhase(true)}>Add Phase</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PhasesSetting;
