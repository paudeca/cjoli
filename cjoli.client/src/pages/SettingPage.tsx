import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Match, Phase, Position, Rank, Squad, Team, Tourney } from "../models";
import useUid from "../hooks/useUid";
import TourneySetting from "./setting/TourneySetting";
import TeamsSetting from "./setting/TeamsSetting";
import { useCJoli } from "../hooks/useCJoli";
import useScreenSize from "../hooks/useScreenSize";
import { useToast } from "../hooks/useToast";
import PhasesSetting from "./setting/PhasesSetting";
import Loading from "../components/Loading";
import { SettingProvider } from "../contexts/SettingContext";
import RanksSetting from "./setting/RanksSetting";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import AddRankModal from "./setting/AddRankModal";
import { useCallback } from "react";
import AddTeamModal from "./setting/AddTeamModal";
import AddPositionModal from "./setting/AddPositionModal";
import AddMatchModal from "./setting/AddMatchModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Trash3 } from "react-bootstrap-icons";
import { useModal } from "../hooks/useModal";
import AddPhaseModal from "./setting/AddPhaseModal";
import AddSquadModal from "./setting/AddSquadModal";
import CJoliStack from "../components/CJoliStack";

const SettingPage = () => {
  const { tourney } = useCJoli("setting");
  const {
    getRanking,
    removeTourney,
    removeTeam,
    removePhase,
    removeSquad,
    removePosition,
    removeMatch,
    removeRank,
  } = useApi();
  const uid = useUid();
  const { register, handleSubmit, setValue, control } = useForm<Tourney>({
    values: tourney,
  });
  const { saveTourney } = useApi();

  const { isMobile } = useScreenSize();
  const { showToast } = useToast();
  const { setShowWithData: showConfirmDeleteTourney } = useModal<Tourney>(
    "confirmDeleteTourney"
  );

  const { isLoading } = useQuery(getRanking(uid));

  const { mutateAsync: doSaveTourney } = useMutation(
    saveTourney({
      onSuccess: () => {
        showToast("success", "Tourney updated");
      },
    })
  );

  const addTeam = useCallback(
    async (tourney: Tourney, team: Partial<Team>) => {
      await doSaveTourney({
        ...tourney,
        teams: [...tourney.teams, team as Team],
      });
      return true;
    },
    [doSaveTourney]
  );

  const addPhase = useCallback(
    async (tourney: Tourney, phase: Phase) => {
      doSaveTourney({
        ...tourney,
        phases: [...tourney.phases, phase],
      });
      return true;
    },
    [doSaveTourney]
  );

  const addSquad = useCallback(
    async (tourney: Tourney, phase: Phase, squad: Squad) => {
      const newPhase = {
        ...phase,
        squads: [...phase.squads, squad],
      };
      const phases = tourney.phases.map((p) =>
        p.id == phase.id ? newPhase : p
      );
      doSaveTourney({
        ...tourney,
        phases,
      });
      return true;
    },
    [doSaveTourney]
  );

  const addPosition = useCallback(
    async (
      tourney: Tourney,
      phase: Phase,
      squad: Squad,
      position: Position
    ) => {
      const newSquad = {
        ...squad,
        positions: [...squad.positions, position],
      };
      const squads = phase.squads.map((s) => (s.id != squad.id ? s : newSquad));
      const newPhase = { ...phase, squads };
      const phases = tourney.phases.map((p) =>
        p.id != phase!.id ? p : newPhase
      );
      doSaveTourney({ ...tourney, phases });
      return true;
    },
    [doSaveTourney]
  );

  const addMatch = useCallback(
    async (tourney: Tourney, phase: Phase, squad: Squad, match: Match) => {
      const newSquad = {
        ...squad,
        matches: [...squad.matches, match],
      };
      const squads = phase.squads.map((s) => (s.id != squad.id ? s : newSquad));
      const newPhase = { ...phase, squads };
      const phases = tourney.phases.map((p) =>
        p.id != phase!.id ? p : newPhase
      );
      doSaveTourney({ ...tourney, phases });
      return true;
    },
    [doSaveTourney]
  );

  const addRank = useCallback(
    async (tourney: Tourney, rank: Rank) => {
      rank.order = tourney.ranks.length + 1;
      await doSaveTourney({
        ...tourney,
        ranks: [...tourney.ranks, rank],
      });
      return true;
    },
    [doSaveTourney]
  );

  const { mutateAsync: doRemoveTourney } = useMutation(removeTourney(uid));
  const { mutateAsync: doRemoveTeam } = useMutation(removeTeam(uid));
  const { mutateAsync: doRemovePhase } = useMutation(removePhase(uid));
  const { mutateAsync: doRemoveSquad } = useMutation(removeSquad(uid));
  const { mutateAsync: doRemovePosition } = useMutation(removePosition(uid));
  const { mutateAsync: doRemoveMatch } = useMutation(removeMatch(uid));
  const { mutateAsync: doRemoveRank } = useMutation(removeRank(uid));

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
      <div className="p-2">
        <Button
          variant="danger"
          onClick={() => showConfirmDeleteTourney(true, tourney)}
          data-testid="deleteTourney"
        >
          <Trash3 />
        </Button>
      </div>
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

                <AddTeamModal onAddTeam={(team) => addTeam(tourney, team)} />
                <AddPhaseModal onAddPhase={(name) => addPhase(tourney, name)} />
                <AddSquadModal
                  onAddSquad={(squad, phase) => addSquad(tourney, phase, squad)}
                />
                <AddPositionModal
                  onAddPosition={(name, { phase, squad }) =>
                    addPosition(tourney, phase, squad, name)
                  }
                />
                <AddMatchModal
                  onAddMatch={(match, { phase, squad }) =>
                    addMatch(tourney, phase, squad, match)
                  }
                />
                <AddRankModal onAddRank={(rank) => addRank(tourney, rank)} />

                <ConfirmationModal
                  id="confirmDeleteTourney"
                  title="Remove Tourney"
                  onConfirm={async () => {
                    doRemoveTourney();
                    return true;
                  }}
                >
                  Are you sure you want to remove this tourney '{tourney.name}'?
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
              </Col>
            </Row>
          </Card>
        </Container>
      </SettingProvider>
    </Loading>
  );
};

export default SettingPage;
