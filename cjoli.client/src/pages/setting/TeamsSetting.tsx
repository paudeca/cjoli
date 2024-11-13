import { Button, Card, ListGroup, Stack, Col, Row } from "react-bootstrap";
import { Team } from "../../models";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Trash3 } from "react-bootstrap-icons";
import ConfirmationModal from "../../modals/ConfirmationModal";
import useUid from "../../hooks/useUid";
import TeamModal from "../../modals/TeamModal";
import { useSetting } from "../../hooks/useSetting";
import { useApi } from "../../hooks/useApi";
import { useMutation } from "@tanstack/react-query";

const TeamsSetting = () => {
  const { tourney } = useSetting();
  const { setShow: showTeam } = useModal("team");
  const { setShowWithData: showConfirmDeleteTeam } =
    useModal<Team>("confirmDeleteTeam");
  const uid = useUid();
  const { removeTeam } = useApi();

  const { setShow: showAddTeam } = useModal("addTeam");

  const [team, setTeam] = React.useState<Team>();
  const editTeam = React.useCallback(
    (team: Team) => {
      setTeam(team);
      showTeam(true);
    },
    [setTeam, showTeam]
  );

  const { mutateAsync: doRemoveTeam } = useMutation(removeTeam(uid));

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">
          <Stack direction="horizontal" gap={3}>
            <Button onClick={() => showAddTeam(true)}>Add Team</Button>Teams
          </Stack>
        </Card.Title>
        <Col lg={8} xs={12} className="mx-auto py-2">
          <ListGroup>
            {tourney.teams.map((team) => (
              <ListGroup.Item
                key={team.id}
                style={{ cursor: "pointer" }}
                onClick={() => editTeam(team)}
              >
                <Stack direction="horizontal" gap={3}>
                  <div>
                    <img
                      src={team.logo}
                      style={{ width: 30 }}
                      className="mx-2"
                    />
                    {team.name}
                  </div>
                  <div className="ms-auto">
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeam(team);
                        showConfirmDeleteTeam(true, team);
                      }}
                    >
                      <Trash3 />
                    </Button>
                  </div>
                </Stack>
              </ListGroup.Item>
            ))}

            <TeamModal team={team} />
            <ConfirmationModal
              id="confirmDeleteTeam"
              title="Remove Team"
              onConfirm={async () => !!(await doRemoveTeam(team!))}
            >
              Are you sure you want to remove this team '{team?.name}'?
            </ConfirmationModal>
          </ListGroup>
        </Col>
        <Row>
          <Col>
            <Button onClick={() => showAddTeam(true)}>Add Team</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TeamsSetting;
