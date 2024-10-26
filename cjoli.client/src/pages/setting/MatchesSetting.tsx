import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { Match, Phase, Squad } from "../../models";
import React from "react";
import { Trash3 } from "react-bootstrap-icons";
import { useModal } from "../../hooks/useModal";
import { useSetting } from "../../hooks/useSetting";

interface MatchesSettingProps {
  squad: Squad;
  phase: Phase;
  indexPhase: number;
  indexSquad: number;
}
const MatchesSetting = ({
  squad,
  phase,
  indexPhase,
  indexSquad,
}: MatchesSettingProps) => {
  const { tourney, register } = useSetting();

  const { setShowWithData: showConfirmDelete } = useModal<{
    match: Match;
    squad: Squad;
    phase: Phase;
  }>("confirmDeleteMatch");

  const getLabel = React.useCallback(
    (value?: number) => {
      const position = squad.positions.find((p) => p.value == value);
      return position && position.teamId! > 0
        ? tourney.teams.find((t) => t.id == position.teamId)?.name
        : position?.name ?? position?.value.toString();
    },
    [tourney, squad.positions]
  );

  return (
    <Accordion className="p-3">
      {squad.matches.map((match, i) => {
        return (
          <Accordion.Item key={match.id} eventKey={match.id.toString()}>
            <Accordion.Header>
              {match.time.toString()} - [{getLabel(match.positionA)} -{" "}
              {getLabel(match.positionB)}] - {match.location}
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Label column lg={2}>
                  Time
                </Form.Label>
                <Col lg={5}>
                  <Form.Control
                    type="datetime-local"
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.matches.${i}.time`
                    )}
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column lg={2}>
                  Location
                </Form.Label>
                <Col lg={5}>
                  <Form.Control
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.matches.${i}.location`
                    )}
                  />
                </Col>
                <Col lg={4}>
                  <Form.Check
                    type="switch"
                    label="Shot"
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.matches.${i}.shot`
                    )}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    variant="danger"
                    onClick={() =>
                      showConfirmDelete(true, { match, squad, phase })
                    }
                  >
                    <Trash3 />
                  </Button>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
};

export default MatchesSetting;
