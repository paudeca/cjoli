import {
  Accordion,
  Button,
  Card,
  Col,
  Form,
  Row,
  Stack,
} from "react-bootstrap";
import { useSetting } from "../../hooks/useSetting";
import { useModal } from "../../hooks/useModal";
import { EventPhase, Phase, Position } from "../../models";
import dayjs from "dayjs";
import { Trash3 } from "react-bootstrap-icons";
import Select, { MultiValue } from "react-select";
import { useCallback } from "react";

interface EventsSettingProps {
  indexPhase: number;
}
const EventsSetting = ({ indexPhase }: EventsSettingProps) => {
  const { tourney, register, setValue } = useSetting();

  const phase = tourney.phases[indexPhase];
  const { setShowWithData: showAddEvent } = useModal<Phase>("addEvent");
  const { setShowWithData: showConfirmDelete } = useModal<{
    event: EventPhase;
    phase: Phase;
  }>("confirmDeleteEvent");

  const getLabel = useCallback(
    (position: Position) => {
      return position && position.teamId! > 0
        ? tourney.teams.find((t) => t.id == position.teamId)?.name
        : (position?.name ?? position?.value.toString());
    },
    [tourney]
  );

  const positions = phase.squads
    .reduce<Position[]>((acc, s) => [...acc, ...s.positions], [])
    .map((p) => ({ label: getLabel(p) ?? p.id.toString(), value: p.id }));

  const onChange =
    (index: number) => (val: MultiValue<{ label: string; value: number }>) => {
      const values = val.map((v) => v.value);
      setValue(
        `phases.${indexPhase}.events.${index}.positionIds`,
        values.map((v) => v)
      );
    };

  return (
    <Card className="my-3">
      <Card.Body>
        <Card.Title className="mb-3">
          <Stack direction="horizontal" gap={3}>
            <Button onClick={() => showAddEvent(true, phase)}>Add Event</Button>
            Event
          </Stack>
        </Card.Title>
        <Accordion className="p-3">
          {phase.events.map((e, i) => (
            <Accordion.Item key={e.id} eventKey={e.id.toString()}>
              <Accordion.Header>
                {e.name} - {dayjs(e.time).format()}
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Form.Group as={Col} lg={6} xs={12} controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      {...register(`phases.${indexPhase}.events.${i}.name`)}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} lg={3} xs={12} controlId="time">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      {...register(`phases.${indexPhase}.events.${i}.time`)}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3" as={Col}>
                    <Form.Label>Positions</Form.Label>
                    <Select
                      isMulti
                      options={positions}
                      defaultValue={positions.filter((p) =>
                        e.positionIds.includes(p.value)
                      )}
                      onChange={onChange(i)}
                    />
                  </Form.Group>
                </Row>

                <Row className="mt-3">
                  <Col>
                    <Button
                      variant="danger"
                      onClick={() =>
                        showConfirmDelete(true, { event: e, phase })
                      }
                      data-testid="deleteEvent"
                    >
                      <Trash3 />
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default EventsSetting;
