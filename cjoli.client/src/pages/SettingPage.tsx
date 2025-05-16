/* eslint-disable max-lines-per-function */
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  EventPhase,
  Match,
  Phase,
  Position,
  Rank,
  Squad,
  Team,
  Tourney,
} from "../models";
import useUid from "../hooks/useUid";
import TourneySetting from "./setting/TourneySetting";
import TeamsSetting from "./setting/TeamsSetting";
import { useCJoli } from "../hooks/useCJoli";
import useScreenSize from "../hooks/useScreenSize";
import PhasesSetting from "./setting/PhasesSetting";
import Loading from "../components/Loading";
import { SettingProvider } from "../contexts/SettingContext";
import RanksSetting from "./setting/RanksSetting";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import AddRankModal from "./setting/AddRankModal";
import AddTeamModal from "./setting/AddTeamModal";
import AddPositionModal from "./setting/AddPositionModal";
import AddMatchModal from "./setting/AddMatchModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Trash3 } from "react-bootstrap-icons";
import { useModal } from "../hooks/useModal";
import AddPhaseModal from "./setting/AddPhaseModal";
import AddSquadModal from "./setting/AddSquadModal";
import CJoliStack from "../components/CJoliStack";
import { useAddSetting } from "./setting/useAddSetting";
import { useUser } from "../hooks/useUser";
import AddEventModal from "./setting/AddEventModal";
import { useToast } from "../hooks/useToast";

const SettingPage = () => {
  const { tourney } = useCJoli("setting");
  const { isRootAdmin } = useUser();
  const { showToast } = useToast();
  const {
    getRanking,
    removeTourney,
    removeTeam,
    removePhase,
    removeSquad,
    removePosition,
    removeMatch,
    removeRank,
    removeEvent,
    synchroTourney,
  } = useApi();
  const uid = useUid();
  const { register, handleSubmit, setValue, control } = useForm<Tourney>({
    values: tourney,
  });

  const { isMobile } = useScreenSize();
  const { setShowWithData: showConfirmDeleteTourney } = useModal<Tourney>(
    "confirmDeleteTourney"
  );

  const { isLoading } = useQuery(getRanking(uid));

  const {
    doSaveTourney,
    addTeam,
    addPhase,
    addSquad,
    addPosition,
    addMatch,
    addRank,
    addEvent,
  } = useAddSetting();

  const { mutateAsync: doRemoveTourney } = useMutation(removeTourney(uid));
  const { mutateAsync: doRemoveTeam } = useMutation(removeTeam(uid));
  const { mutateAsync: doRemovePhase } = useMutation(removePhase(uid));
  const { mutateAsync: doRemoveSquad } = useMutation(removeSquad(uid));
  const { mutateAsync: doRemovePosition } = useMutation(removePosition(uid));
  const { mutateAsync: doRemoveMatch } = useMutation(removeMatch(uid));
  const { mutateAsync: doRemoveRank } = useMutation(removeRank(uid));
  const { mutateAsync: doRemoveEvent } = useMutation(removeEvent(uid));

  const { mutateAsync: doSynchro } = useMutation(synchroTourney(uid));

  const submit = async (tourney: Tourney) => {
    await doSaveTourney(tourney);
  };

  if (!tourney) {
    return <Loading ready={false}>wait</Loading>;
  }

  const buttons = (
    <CJoliStack direction={isMobile ? "vertical" : "horizontal"} gap={3}>
      <div className="p-2">
        <Button variant="primary" type="submit" style={{ width: 200 }}>
          Save
        </Button>
      </div>
      {tourney.tournify && (
        <div>
          <Button
            variant="primary"
            onClick={async () => {
              await doSynchro();
              showToast("success", "Synchro done");
            }}
          >
            Synchronize
          </Button>
        </div>
      )}

      {isRootAdmin && (
        <div className="p-2">
          <Button
            variant="danger"
            onClick={() => showConfirmDeleteTourney(true, tourney)}
            data-testid="deleteTourney"
          >
            <Trash3 />
          </Button>
        </div>
      )}
    </CJoliStack>
  );

  return (
    <Loading ready={!isLoading}>
      <SettingProvider
        tourney={tourney}
        register={register}
        setValue={setValue}
        control={control}
      >
        <Container>
          <Card>
            <Row>
              <Col xs={12} className={isMobile ? "p-3" : "p-5"}>
                <Form onSubmit={handleSubmit(submit)}>
                  {buttons}
                  <TourneySetting />
                  <TeamsSetting />
                  <PhasesSetting />
                  <RanksSetting />
                  {buttons}
                </Form>

                <AddTeamModal
                  onAddTeam={(team) => addTeam({ tourney, team })}
                />
                <AddPhaseModal
                  onAddPhase={(phase) => addPhase({ tourney, phase })}
                />
                <AddSquadModal
                  onAddSquad={(squad, phase) =>
                    addSquad({ tourney, phase, squad })
                  }
                />
                <AddPositionModal
                  onAddPosition={(position, { phase, squad }) =>
                    addPosition({ tourney, phase, squad, position })
                  }
                />
                <AddMatchModal
                  onAddMatch={(match, { phase, squad }) =>
                    addMatch({ tourney, phase, squad, match })
                  }
                />
                <AddRankModal
                  onAddRank={(rank) => addRank({ tourney, rank })}
                />
                <AddEventModal
                  onAddEvent={(event, phase) =>
                    addEvent({ tourney, phase, event })
                  }
                />

                <ConfirmationModal
                  id="confirmDeleteTourney"
                  title="Remove Tourney"
                  onConfirm={async () => {
                    doRemoveTourney();
                    return true;
                  }}
                >
                  Are you sure you want to remove this tourney &apos;
                  {tourney.name}&apos;?
                </ConfirmationModal>

                <ConfirmationModal<Team>
                  id="confirmDeleteTeam"
                  title="Remove Team"
                  onConfirm={doRemoveTeam}
                  message={(team) =>
                    `Are you sure you want to remove this team '${team.name}'?`
                  }
                />
                <ConfirmationModal<Phase>
                  id="confirmDeletePhase"
                  title="Remove Phase"
                  onConfirm={doRemovePhase}
                  message={(phase) =>
                    `Are you sure you want to remove this Phase '${phase.name}'?`
                  }
                />
                <ConfirmationModal<{ squad: Squad; phase: Phase }>
                  id="confirmDeleteSquad"
                  title="Remove Squad"
                  onConfirm={doRemoveSquad}
                  message={({ squad }) =>
                    `Are you sure you want to remove this squad '${squad.name}'?`
                  }
                />
                <ConfirmationModal<{
                  position: Position;
                  squad: Squad;
                  phase: Phase;
                }>
                  id="confirmDeletePosition"
                  title="Remove Position"
                  onConfirm={doRemovePosition}
                  message={({
                    position,
                  }) => `Are you sure you want to remove this position '
                  ${
                    position.name ??
                    tourney.teams.find((t) => t.id == position.teamId)?.name
                  }'?`}
                />
                <ConfirmationModal<{ match: Match; squad: Squad; phase: Phase }>
                  id="confirmDeleteMatch"
                  title="Remove Match"
                  onConfirm={doRemoveMatch}
                  message={({ match }) =>
                    `Are you sure you want to remove this match '${match.positionA} - ${match.positionB}'?`
                  }
                />
                <ConfirmationModal<Rank>
                  id="confirmDeleteRank"
                  title="Remove Rank"
                  onConfirm={doRemoveRank}
                  message={(rank) =>
                    `Are you sure you want to remove this rank '${rank.value}'?`
                  }
                />
                <ConfirmationModal<{ event: EventPhase; phase: Phase }>
                  id="confirmDeleteEvent"
                  title="Remove Event"
                  onConfirm={doRemoveEvent}
                  message={({ event }) =>
                    `Are you sure you want to remove this event '${event.name}'?`
                  }
                />
              </Col>
            </Row>
          </Card>
        </Container>
      </SettingProvider>
    </Loading>
  );
};

export default SettingPage;
