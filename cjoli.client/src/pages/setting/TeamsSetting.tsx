import { Button, Card, ListGroup, Stack, Col, Row } from "react-bootstrap";
import { Team } from "../../models";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Trash3 } from "react-bootstrap-icons";
import ConfirmationModal from "../../modals/ConfirmationModal";
import * as settingService from "../../services/settingService";
import useUid from "../../hooks/useUid";
import TeamModal from "../../modals/TeamModal";
import { useCJoli } from "../../hooks/useCJoli";
import { useSetting } from "../../hooks/useSetting";
import AddTeamModal from "./AddTeamModal";

const TeamsSetting = () => {
  const { tourney, saveTourney } = useSetting();
  const { setShow: showTeam } = useModal("team");
  const { setShow: showConfirmDelete } = useModal("confirmDelete");
  const uid = useUid();
  const { loadTourney } = useCJoli();

  const { setShow: showAddTeam } = useModal("addTeam");

  const [team, setTeam] = React.useState<Team>();
  const editTeam = React.useCallback(
    (team: Team) => {
      setTeam(team);
      showTeam(true);
    },
    [setTeam, showTeam]
  );
  const removeTeam = React.useCallback(async () => {
    const tourney = await settingService.removeTeam(uid, team!.id);
    loadTourney(tourney);
    return true;
  }, [uid, team, loadTourney]);

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Teams</Card.Title>
        <Col lg={8} xs={12} className="mx-auto py-2">
          <ListGroup>
            {tourney?.teams.map((team) => (
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
                        showConfirmDelete(true);
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
              id="confirmDelete"
              title="Remove Team"
              onConfirm={removeTeam}
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

      <AddTeamModal
        onAddTeam={(team: Partial<Team>) =>
          saveTourney({
            ...tourney,
            teams: [...tourney.teams, team as Team],
          })
        }
      />
    </Card>
  );
};

export default TeamsSetting;
