/* eslint-disable max-lines-per-function */
import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import { ParentPosition, Phase, Position, Squad } from "../../models";
import React from "react";
import { Trash3 } from "react-bootstrap-icons";
import Select from "react-select";
import { useModal } from "../../hooks/useModal";
import { useSetting } from "../../hooks/useSetting";
import useScreenSize from "../../hooks/useScreenSize";
import { MATCH_TYPES, MatchType } from "../../models/Match";

interface PositionsSettingProps {
  squad: Squad;
  phase: Phase;
  indexPhase: number;
  indexSquad: number;
}
// eslint-disable-next-line max-lines-per-function
const PositionsSetting = ({
  squad,
  phase,
  indexPhase,
  indexSquad,
}: PositionsSettingProps) => {
  const { tourney, register, setValue } = useSetting();
  const { isMobile } = useScreenSize();

  const [parents, setParents] = React.useState(
    squad.positions.map((p) => p.parentPosition)
  );
  const { setShowWithData: showConfirmDelete } = useModal<{
    position: Position;
    squad: Squad;
    phase: Phase;
  }>("confirmDeletePosition");

  const getType = React.useCallback((position: Position) => {
    switch (position.matchType) {
      case "Normal": {
        return "";
      }
      case "Final": {
        return `(F${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Semi": {
        return `(S${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Quarter": {
        return `(Q${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match8": {
        return `(M8-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match16": {
        return `(M16-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match32": {
        return `(M32-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
    }
    return "";
  }, []);

  const getLabel = React.useCallback(
    (position?: Position) => {
      if (position && position.teamId > 0) {
        return `${position?.name || ""} ${getType(position)} [ ${
          tourney.teams.find((t) => t.id == position.teamId)?.name
        } ]`;
      } else {
        return `${position?.name} ${getType(position!)}`;
      }
    },
    [tourney?.teams, getType]
  );

  const options = MATCH_TYPES.map((v) => ({ label: v, value: v }));

  return (
    <Accordion className={isMobile ? "py-3" : "p-3"}>
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
        const optionsValue = parentSquad
          ? parentSquad.positions.map((p) => ({
              label: p.value.toString(),
              value: p.value,
            }))
          : (parentPhase?.squads ?? [])
              .reduce<Position[]>((acc, s) => [...acc, ...s.positions], [])
              .map((_p, i) => ({ label: (i + 1).toString(), value: i + 1 }));

        return (
          <Accordion.Item key={position.id} eventKey={position.id.toString()}>
            <Accordion.Header>
              <span style={{ color: "#aaaaaa", paddingRight: 5, fontSize: 14 }}>
                (id:{position.id})
              </span>
              {position.value} - {getLabel(position)}
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group
                as={Row}
                controlId={`position.team.${position.id}`}
                className={isMobile ? "p-1" : "px-3 py-1"}
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

              <Row className={isMobile ? "px-1 py-3" : "p-3"}>
                <Col lg={4} className="mb-3">
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
                <Col lg={4} className="mb-3">
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
                <Col lg={4} className="mb-3">
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
                  Match
                </Form.Label>
                <Col lg={4} className="mb-3">
                  <Select
                    options={options}
                    defaultValue={options?.find(
                      (o) => o.value == position?.matchType
                    )}
                    onChange={(val) => {
                      setValue(
                        `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.matchType`,
                        val?.value as MatchType
                      );
                    }}
                    isClearable
                    placeholder="Select MatchType"
                  />
                </Col>
                <Col lg={2} className="mb-3">
                  <Form.Control
                    type="number"
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.matchOrder`
                    )}
                  />
                </Col>
                <Col lg={2} className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Winner"
                    {...register(
                      `phases.${indexPhase}.squads.${indexSquad}.positions.${i}.winner`
                    )}
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
                <Col lg={4} className="mb-3">
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
                    onClick={() =>
                      showConfirmDelete(true, { position, squad, phase })
                    }
                    data-testid="deletePosition"
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

export default PositionsSetting;
