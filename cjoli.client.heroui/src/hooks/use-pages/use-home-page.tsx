import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { Phase, Score, Squad } from "@@/models";
import { useTranslation } from "react-i18next";
import {
  useApi,
  useBootstrap,
  useCJoli,
  useCjoliService,
  useConfig,
  useUid,
  useUser,
} from "@cjoli/core";

export const useHomePage = (map: Record<string, ReactNode>) => {
  const { phases, matches } = useCJoli("home");
  const { sendMessage, register } = useBootstrap();
  const { getRanking } = useApi();
  const uid = useUid();
  const { phaseId } = useParams();
  const { t } = useTranslation();

  const { refetch, isLoading } = useQuery(getRanking(uid));

  useEffect(() => {
    if (!isLoading) {
      sendMessage({ type: "selectTourney", uid });
    }
    return () => {};
  }, [uid, isLoading, sendMessage]);

  useEffect(() => {
    register("updateRanking", async () => {
      refetch();
    });
    return () => {};
  }, [refetch, register]);

  const phase = useMemo(() => {
    let phase =
      phases && phases.find((p) => phaseId && p.id == parseInt(phaseId));
    if (!phase && phases && phases?.length > 0) {
      phase = phases[0];
    }
    return phase;
  }, [phaseId, phases]);

  const items = useMemo(() => {
    const allMatchesDone = matches.length > 0 && matches.every((m) => m.done);

    return [
      {
        key: "final",
        content: map.final,
        title: t("home.finalRanking", "Final Ranking"),
        hide: !allMatchesDone,
      },
      {
        key: "ranking",
        content: map.ranking,
        title: t("home.ranking", "Ranking"),
        hide: !phase,
      },
      {
        key: "match",
        content: map.match,
        title: t("home.matches", "Matches"),
        hide: !phase,
      },
    ];
  }, [t, matches, phase, map]);

  return { isConfigured: !!phase, isLoading, items };
};

export const useRankingHomePage = () => {
  const { phases, selectDay } = useCJoli();
  const { getPath } = useConfig();
  const navigate = useNavigate();
  const { phaseId, squadId } = useParams();

  const filterPhases =
    phases?.filter(
      (phase: Phase) => !squadId || !phaseId || parseInt(phaseId) == phase.id
    ) || [];

  const handleClick = (phaseId: string | number) => {
    selectDay("0");
    navigate(getPath(`/phase/${phaseId}`));
  };

  return { handleClick, phaseId, phases: filterPhases };
};

export const useTableRankingHomePage = (phase: Phase) => {
  const { isTeamInSquad } = useCJoli();
  const { squadId, teamId } = useParams();

  const filter = teamId
    ? (squad: Squad) => isTeamInSquad(parseInt(teamId), squad)
    : (squad: Squad) => !squadId || parseInt(squadId) == squad.id;
  const squads = phase.squads.filter(filter);

  return { squads };
};

interface Column {
  key: keyof Score;
  label: string;
  color?: boolean;
  info?: string;
  mobile?: boolean;
}

export const useSquadTableRankingHomePage = (squad: Squad) => {
  const { tourney, ranking, loadRanking } = useCJoli();

  const { squadId } = useParams();
  const uid = useUid();
  const { t } = useTranslation();
  const { userConfig } = useUser();
  const { clearSimulations } = useCjoliService();

  const scores = ranking?.scores.scoreSquads.find((s) => s.squadId == squad.id);
  const datas = scores ? scores.scores : [];

  const userMatches = squad.matches
    .filter((m) => m.userMatch && !m.done && userConfig.useCustomEstimate)
    .map((m) => m.userMatch!.id);
  const hasSimulation = userMatches.length > 0;

  const handleRemove = useCallback(
    (ids: number[]) => async () => {
      const ranking = await clearSimulations(uid, ids);
      loadRanking(ranking);
    },
    [loadRanking, uid, clearSimulations]
  );

  const columns: Column[] = useMemo(
    () => [
      { key: "rank", label: "#" },
      { key: "teamId", label: t("rank.team", "Team") },
      {
        key: "total",
        label: "PTS",
        color: true,
        info: t("rank.total", "Points"),
      },
      {
        key: "game",
        label: "PJ",
        info: t("rank.game", "Games played"),
        mobile: true,
      },
      {
        key: "win",
        label: "V",
        info: t("rank.win", "Victories"),
        mobile: true,
      },
      {
        key: "neutral",
        label: "N",
        info: t("rank.neutral", "Drawn games"),
        mobile: true,
      },
      {
        key: "loss",
        label: "D",
        info: t("rank.loss", "Defeats"),
        mobile: true,
      },
      {
        key: "goalFor",
        label: "BP",
        info: t("rank.goalFor", "Goals for"),
        mobile: true,
      },
      {
        key: "goalAgainst",
        label: "BC",
        info: t("rank.goalAgainst", "Goals against"),
        mobile: true,
      },
      {
        key: "shutOut",
        label: "BL",
        info: t("rank.shutOut", "ShutOut"),
        mobile: true,
      },
      {
        key: "goalDiff",
        label: "GA",
        info: t("rank.goalDiff", "Goal average"),
        mobile: true,
      },
    ],
    [t]
  );

  return {
    tourney,
    columns,
    squadId,
    hasSimulation,
    handleRemove,
    userMatches,
    datas,
  };
};
