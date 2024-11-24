import React from "react";
import { Accordion, Button, Card, Col, Row, Stack } from "react-bootstrap";
import { useSetting } from "../../hooks/useSetting";
import { Rank } from "../../models";
import { useModal } from "../../hooks/useModal";
import Select from "react-select";
import { Trash3 } from "react-bootstrap-icons";

const RanksSetting = () => {
  const { tourney, setValue } = useSetting();
  const { setShow: showAddRank } = useModal("addRank");
  const { setShowWithData: showConfirmDelete } =
    useModal<Rank>("confirmDeleteRank");

  const [ranks, setRanks] = React.useState<Rank[]>(tourney.ranks);

  const getLabel = React.useCallback(
    (rank: Rank) => {
      const phase = tourney.phases.find((p) => p.id == rank.phaseId);
      const squad = phase?.squads.find((s) => s.id == rank.squadId);
      return `${rank.order} - ${phase?.name} - ${squad?.name} - ${rank.value}`;
    },
    [tourney]
  );
  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">
          <Stack direction="horizontal" gap={3}>
            <Button onClick={() => showAddRank(true)}>Add Rank</Button>Rank
          </Stack>
        </Card.Title>

        <Accordion className="p-3">
          {tourney.ranks.map((rank, i) => {
            const optionsPhase = tourney.phases.map((p) => ({
              label: p.name,
              value: p.id,
            }));

            const r = ranks[i];
            const phase = tourney.phases.find((p) => p.id == r?.phaseId);
            const optionsSquad = phase?.squads.map((s) => ({
              label: s.name,
              value: s.id,
            }));
            const squad = phase?.squads.find((s) => s.id == r.squadId);

            const optionsValue = [...Array(squad?.positions.length).keys()].map(
              (i) => ({
                label: (i + 1).toString(),
                value: i + 1,
              })
            );

            return (
              <Accordion.Item key={rank.id} eventKey={rank.id.toString()}>
                <Accordion.Header>{getLabel(rank)}</Accordion.Header>
                <Accordion.Body>
                  <Row className="p-3">
                    <Col lg={4} className="mb-3">
                      <Select
                        options={optionsPhase}
                        defaultValue={optionsPhase?.find(
                          (o) => o.value == r?.phaseId
                        )}
                        onChange={(val) => {
                          setRanks(
                            ranks.map((r, j) =>
                              i == j
                                ? ({
                                    ...r,
                                    phaseId: val?.value,
                                    squadId: 0,
                                    value: 0,
                                  } as Rank)
                                : r
                            )
                          );
                          setValue(`ranks.${i}.phaseId`, val?.value || 0);
                        }}
                        isClearable
                        placeholder="Select Phase"
                      />
                    </Col>
                    <Col lg={4} className="mb-3">
                      <Select
                        options={optionsSquad}
                        defaultValue={optionsSquad?.find(
                          (o) => o.value == r.squadId
                        )}
                        onChange={(val) => {
                          setRanks(
                            ranks.map((r, j) =>
                              i == j
                                ? ({
                                    ...r,
                                    squadId: val?.value,
                                    value: 0,
                                  } as Rank)
                                : r
                            )
                          );
                          setValue(`ranks.${i}.squadId`, val?.value || 0);
                        }}
                        isClearable
                        placeholder="Select Squad"
                      />
                    </Col>
                    <Col lg={4} className="mb-3">
                      <Select
                        options={optionsValue}
                        defaultValue={optionsValue?.find(
                          (o) => o.value == r?.value
                        )}
                        onChange={(val) => {
                          setValue(`ranks.${i}.value`, val?.value || 0);
                        }}
                        isClearable
                        placeholder="Select Position"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button
                        variant="danger"
                        onClick={() => showConfirmDelete(true, rank)}
                        data-testid="deleteRank"
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
        <Row>
          <Col>
            <Button onClick={() => showAddRank(true)}>Add Rank</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RanksSetting;
