import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import { useCallback } from "react";
import {
  Match,
  Phase,
  Position,
  Rank,
  Squad,
  Team,
  Tourney,
} from "../../models";

export const useAddSetting = () => {
  const { saveTourney } = useApi();
  const { showToast } = useToast();

  const { mutateAsync: doSaveTourney } = useMutation(
    saveTourney({
      onSuccess: () => {
        showToast("success", "Tourney updated");
      },
    })
  );

  const addTeam = useCallback(
    async ({ tourney, team }: { tourney: Tourney; team: Partial<Team> }) => {
      await doSaveTourney({
        ...tourney,
        teams: [...tourney.teams, team as Team],
      });
      return true;
    },
    [doSaveTourney]
  );

  const addPhase = useCallback(
    async ({ tourney, phase }: { tourney: Tourney; phase: Phase }) => {
      doSaveTourney({
        ...tourney,
        phases: [...tourney.phases, phase],
      });
      return true;
    },
    [doSaveTourney]
  );

  const addSquad = useCallback(
    async ({
      tourney,
      phase,
      squad,
    }: {
      tourney: Tourney;
      phase: Phase;
      squad: Squad;
    }) => {
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
    async ({
      tourney,
      phase,
      squad,
      position,
    }: {
      tourney: Tourney;
      phase: Phase;
      squad: Squad;
      position: Position;
    }) => {
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
    async ({
      tourney,
      phase,
      squad,
      match,
    }: {
      tourney: Tourney;
      phase: Phase;
      squad: Squad;
      match: Match;
    }) => {
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
    async ({ tourney, rank }: { tourney: Tourney; rank: Rank }) => {
      rank.order = tourney.ranks.length + 1;
      await doSaveTourney({
        ...tourney,
        ranks: [...tourney.ranks, rank],
      });
      return true;
    },
    [doSaveTourney]
  );

  return {
    doSaveTourney,
    addTeam,
    addPhase,
    addSquad,
    addPosition,
    addMatch,
    addRank,
  };
};
