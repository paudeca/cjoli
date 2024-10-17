import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { Squad } from "../../models";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";
import { Trash3 } from "react-bootstrap-icons";
import ConfirmationModal from "../../modals/ConfirmationModal";
import * as settingService from "../../services/settingService";
import useUid from "../../hooks/useUid";
import { useModal } from "../../hooks/useModal";
import { useSetting } from "../../hooks/useSetting";

interface MatchesSettingProps {
  squad: Squad;
  indexPhase: number;
  indexSquad: number;
}
const MatchesSetting = ({
  squad,
  indexPhase,
  indexSquad,
}: MatchesSettingProps) => {
  const uid = useUid();
  const { tourney, register, match, selectMatch } = useSetting();
  const { loadTourney } = useCJoli();
  const phase = tourney.phases[indexPhase];

  const { setShow: showConfirmDelete } = useModal(
    `confirmDeleteMatch-${squad.id}`
  );

  const removeMatch = React.useCallback(async () => {
    if (!match) {
      return false;
    }
    const tourney = await settingService.removeMatch(
      uid,
      phase.id,
      squad.id,
      match.id
    );
    loadTourney(tourney);
    return true;
  }, [uid, phase, squad, match, loadTourney]);

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
    <Accordion
      className="p-3"
      onSelect={(e) => {
        selectMatch(squad.matches.find((m) => m.id.toString() == e)!);
      }}
    >
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
                    onClick={() => showConfirmDelete(true)}
                  >
                    <Trash3 />
                  </Button>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
      <ConfirmationModal
        id={`confirmDeleteMatch-${squad.id}`}
        title="Remove Match"
        onConfirm={removeMatch}
      >
        Are you sure you want to remove this match '{getLabel(match?.positionA)}{" "}
        - {getLabel(match?.positionB)}'?
      </ConfirmationModal>
    </Accordion>
  );
};

export default MatchesSetting;
