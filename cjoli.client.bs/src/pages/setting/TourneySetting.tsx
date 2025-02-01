import { Card, Col, Form, Row } from "react-bootstrap";
import { useSetting } from "../../hooks/useSetting";

const TourneySetting = () => {
  const { register } = useSetting();
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Tourney</Card.Title>
        <Row className="mb-3">
          <Form.Group as={Col} lg={6} xs={12} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control {...register("name")} autoFocus />
          </Form.Group>

          <Form.Group as={Col} lg={3} xs={12} controlId="season">
            <Form.Label>Season</Form.Label>
            <Form.Control {...register("season")} />
          </Form.Group>

          <Form.Group as={Col} lg={3} xs={12} controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control {...register("category")} />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} lg={3} xs={12} controlId="startTime">
            <Form.Label>Start Time</Form.Label>
            <Form.Control type="datetime-local" {...register("startTime")} />
          </Form.Group>
          <Form.Group as={Col} lg={3} xs={12} controlId="endTime">
            <Form.Label>End Time</Form.Label>
            <Form.Control type="datetime-local" {...register("endTime")} />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} lg={3} xs={12} controlId="rule">
            <Form.Label>Rule</Form.Label>
            <Form.Control {...register("rule")} />
          </Form.Group>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TourneySetting;
