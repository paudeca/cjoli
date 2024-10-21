import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { ParentPosition, Position, Squad } from "../../models";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";
import { Trash3 } from "react-bootstrap-icons";
import Select from "react-select";
import ConfirmationModal from "../../modals/ConfirmationModal";
import * as settingService from "../../services/settingService";
import useUid from "../../hooks/useUid";
import { useModal } from "../../hooks/useModal";
import { useSetting } from "../../hooks/useSetting";

interface PositionsSettingProps {
  squad: Squad;
  indexPhase: number;
  indexSquad: number;
}
const PositionsSetting = ({
  squad,
  indexPhase,
  indexSquad,
}: PositionsSettingProps) => {
  const uid = useUid();
  const { tourney, register, setValue, position, selectPosition } =
    useSetting();
  const phase = tourney.phases[indexPhase];
  const { loadTourney } = useCJoli();

  const [parents, setParents] = React.useState(
    squad.positions.map((p) => p.parentPosition)
  );
  const { setShow: showConfirmDelete } = useModal(
    `confirmDeletePosition-${squad.id}`
  );

  const getLabel = React.useCallback(
    (position?: Position) => {
      if (position && position.teamId > 0) {
        return tourney.teams.find((t) => t.id == position.teamId)?.name;
      } else {
        return position?.name;
      }
    },
    [tourney?.teams]
  );

  const removePosition = React.useCallback(async () => {
    if (!position) {
      return false;
    }
    const tourney = await settingService.removePosition(
      uid,
      phase.id,
      squad.id,
      position.id
    );
    loadTourney(tourney);
    return true;
  }, [uid, phase, squad, position, loadTourney]);

  return (
    <Accordion
      className="p-3"
      onSelect={(e) => {
        const position = squad.positions.find((p) => p.id.toString() == e);
        selectPosition(position!);
      }}
    >
      {squad.positions.map((position, i) => {
        const team = tourney.teams.find((t) => t.id == position.teamId);
        const optionsTeam = tourney?.teams.map((t) => ({
          label: t.name,
          value: t.id,
        }));
        const optionsPhase = tourney.phases.map((p) => ({
          label: p.name,
          value: p.id,
        }));
        const parent = parents[i];
        const parentPhase = tourney.phases.find((p) => p.id == parent?.phaseId);
        const optionsSquad = parentPhase?.squads.map((s) => ({
          label: s.name,
          value: s.id,
        }));
        const parentSquad = parentPhase?.squads.find(
          (s) => s.id == parent?.squadId
        );
        const optionsValue = parentSquad?.positions.map((p) => ({
          label: p.value.toString(),
          value: p.value,
        }));
        return (
          <Accordion.Item key={position.id} eventKey={position.id.toString()}>
            <Accordion.Header>
              {position.value} - {getLabel(position)}
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group
                as={Row}
                controlId={`position.team.${position.id}`}
                className="px-3 py-1"
              >
                <Form.Label column lg={1}>
                  Team
                </Form.Label>
                <Col lg={5}>
                  <Select
                    options={optionsTeam}
                    defaultValue={optionsTeam?.find((o) => o.value == team?.id)}
                    onChange={(val) =>
                      setValue(
                        `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.teamId`,
                        val?.value || 0
                      )
                    }
                    isClearable
                  />
                </Col>
              </Form.Group>

              <Row className="px-3 py-3">
                <Col xs={4}>
                  <Select
                    options={optionsPhase}
                    defaultValue={optionsPhase?.find(
                      (o) => o.value == parent?.phaseId
                    )}
                    onChange={(val) => {
                      setParents(
                        parents.map((p, j) =>
                          i == j
                            ? ({
                                phaseId: val?.value,
                                squadId: 0,
                                value: 0,
                              } as ParentPosition)
                            : p
                        )
                      );
                      setValue(
                        `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.parentPosition.phaseId`,
                        val?.value || 0
                      );
                    }}
                    isClearable
                    placeholder="Select Phase"
                  />
                </Col>
                <Col xs={4}>
                  <Select
                    options={optionsSquad}
                    defaultValue={optionsSquad?.find(
                      (o) => o.value == parent?.squadId
                    )}
                    onChange={(val) => {
                      setParents(
                        parents.map((p, j) =>
                          i == j
                            ? ({
                                ...p,
                                squadId: val?.value,
                                value: 0,
                              } as ParentPosition)
                            : p
                        )
                      );
                      setValue(
                        `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.parentPosition.squadId`,
                        val?.value || 0
                      );
                    }}
                    isClearable
                    placeholder="Select Squad"
                  />
                </Col>
                <Col xs={4}>
                  <Select
                    options={optionsValue}
                    defaultValue={optionsValue?.find(
                      (o) => o.value == parent?.value
                    )}
                    onChange={(val) => {
                      setValue(
                        `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.parentPosition.value`,
                        val?.value || 0
                      );
                    }}
                    isClearable
                    placeholder="Select Position"
                  />
                </Col>
              </Row>

              <Row>
                <Form.Label column lg={2}>
                  Name
                </Form.Label>
                <Col lg={5}>
                  <Form.Control
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.name`
                    )}
                  />
                </Col>
                <Form.Label column lg={1}>
                  Short
                </Form.Label>
                <Col lg={4}>
                  <Form.Control
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.short`
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
        id={`confirmDeletePosition-${squad.id}`}
        title="Remove Position"
        onConfirm={removePosition}
      >
        Are you sure you want to remove this position '{getLabel(position)}'?
      </ConfirmationModal>
    </Accordion>
  );
};

export default PositionsSetting;
