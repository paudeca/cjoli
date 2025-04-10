/* eslint-disable max-lines */
import { Table } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import CJoliTooltip from "../../../components/CJoliTooltip";
import React from "react";
import TeamCell from "./TeamCell";
import { Rank, Score, Squad, Team, Tourney } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import { Trans, useTranslation } from "react-i18next";

const percent = (value: number, total: number) =>
  total == 0 ? "" : `${Math.round((value / total) * 100)}%`;

const average = (value: number, total: number) =>
  total == 0 ? "" : `avg: ${(value / total).toFixed(1)}`;

interface TeamTableProps {
  team: Team;
  teamB?: Team;
  squad?: Squad;
}

const useFormatRank = () => {
  const { t } = useTranslation();
  return (rank?: number) => {
    if (rank == undefined) return "";
    if (rank == 0) {
      return ` - ${t("rank.first", "1st")} 🥇`;
    } else if (rank == 1) {
      return ` - ${t("rank.second", "2ème")} 🥈`;
    } else if (rank == 2) {
      return ` - ${t("rank.third", "3rd")} 🥉`;
    } else {
      return ` - ${t("rank.rankth", { rank: rank + 1 })}`;
    }
  };
};

const useColumns = (tourney?: Tourney, teamB?: Team) => {
  const { t } = useTranslation();
  const formatRank = useFormatRank();

  const winPt = tourney?.config.win || 2;

  let columns = [
    {
      label: "Rang",
      description: t("rank.ranking", "Ranking"),
      callRank: (r: Rank) => r.order || 0,
      getLabel: (r: Rank) =>
        r.order == 1
          ? `${t("rank.first")} 🥇`
          : r.order == 2
            ? `${t("rank.second")} 🥈`
            : r.order == 3
              ? `${t("rank.third")} 🥉`
              : t("rank.rankth", { rank: r.order }),
      up: false,
      active: true,
      needTeam: true,
    },
    {
      label: "PTS",
      description: t("rank.total", "Points"),
      callScore: (s: Score) => s.total,
      getInfo: (s: Score) => percent(s.total, winPt * s.game),
      up: true,
      active: !!teamB,
      needTeam: true,
    },
    {
      label: "PJ",
      description: t("rank.game", "Games played"),
      callScore: (s: Score) => s.game,
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "V",
      description: t("rank.win", "Victories"),
      callScore: (s: Score) => s.win,
      getInfo: (s: Score) =>
        percent(s.win, s.game) + formatRank(s.ranks?.win?.rank),
      up: true,
      active: !!teamB,
      needTeam: false,
    },
    {
      label: "N",
      description: t("rank.neutral", "Drawn games"),
      callScore: (s: Score) => s.neutral,
      getInfo: (s: Score) =>
        percent(s.neutral, s.game) + formatRank(s.ranks?.neutral?.rank),
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "D",
      description: t("rank.loss", "Defeats"),
      callScore: (s: Score) => s.loss,
      getInfo: (s: Score) =>
        percent(s.loss, s.game) + formatRank(s.ranks?.loss?.rank),
      up: false,
      active: !!teamB,
      needTeam: false,
    },
    {
      label: "BP",
      description: t("rank.goalFor", "Goals for"),
      callScore: (s: Score) => {
        if (!teamB) return s.goalFor / s.game;
        return s.goalFor;
      },
      getLabel: (s: Score) => s.goalFor,
      getInfo: (s: Score) =>
        average(s.goalFor, s.game) + formatRank(s.ranks?.goalFor?.rank),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "BC",
      description: t("rank.goalAgainst", "Goals against"),
      callScore: (s: Score) => {
        if (!teamB) return s.goalAgainst / s.game;
        return s.goalAgainst;
      },
      getLabel: (s: Score) => s.goalAgainst,
      getInfo: (s: Score) =>
        average(s.goalAgainst, s.game) + formatRank(s.ranks?.goalAgainst?.rank),
      up: false,
      active: true,
      needTeam: false,
    },
    {
      label: "BL",
      description: t("rank.shutOut", "ShutOut"),
      callScore: (s: Score) => {
        if (!teamB) return s.shutOut / s.game;
        return s.shutOut;
      },
      getLabel: (s: Score) => s.shutOut,
      getInfo: (s: Score) =>
        percent(s.shutOut, s.game) + formatRank(s.ranks?.shutOut?.rank),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "+/-",
      description: t("rank.goalDiff", "Goal average"),
      callScore: (s: Score) => {
        if (!teamB) return s.goalDiff / s.game;
        return s.goalDiff;
      },
      getLabel: (s: Score) => s.goalDiff,
      getInfo: (s: Score) =>
        average(s.goalDiff, s.game) + formatRank(s.ranks?.goalDiff?.rank),
      up: true,
      active: true,
      needTeam: false,
    },
  ];
  if (tourney?.config?.hasPenalty) {
    columns = [
      ...columns,
      {
        label: "PEN",
        description: t("rank.penalty", "Penalties"),
        callScore: (s: Score) => s.penalty,
        getInfo: (s: Score) =>
          average(s.penalty, s.game) + formatRank(s.ranks?.penalty?.rank),
        up: false,
        active: true,
        needTeam: false,
      },
    ];
  }

  return columns;
};

const TeamTable = ({ team, teamB, squad }: TeamTableProps) => {
  const {
    ranking,
    tourney,
    getTeamRank,
    getScoreForTeam,
    getScoreFromSquad,
    modeScore,
  } = useCJoli();

  //const [mode, setMode] = useState<"tourney" | "season" | "allTime">("tourney");

  let rank = getTeamRank(team);
  let rankB = teamB && getTeamRank(teamB);
  const score = getScoreForTeam(modeScore, team)!;
  //score = ranking?.scores.scoreTeamsSeason[team.id]!;
  let scoreB = teamB && getScoreForTeam(modeScore, teamB);
  const scoreSquad = squad && getScoreFromSquad(squad, team);
  const scoreSquadB = squad && teamB && getScoreFromSquad(squad, teamB);
  if ((!rank || !rankB) && scoreSquad && scoreSquadB) {
    rank = { order: scoreSquad.rank } as Rank;
    rankB = { order: scoreSquadB.rank } as Rank;
  }

  let datas: { team?: Team; rank?: Rank; score?: Score }[] = [
    { team, rank: modeScore == "tourney" ? rank : undefined, score },
  ];
  if (teamB) {
    datas = [
      ...datas,
      {
        team: teamB,
        rank: modeScore == "tourney" ? rankB : undefined,
        score: scoreB,
      },
    ];
  } else {
    const type =
      modeScore == "tourney"
        ? "scoreTourney"
        : modeScore == "season"
          ? "scoreSeason"
          : "scoreAllTime";
    const scoreTourney = ranking?.scores[type];
    scoreB = scoreTourney;
    datas = [
      ...datas,
      { team: undefined, rank: undefined, score: scoreTourney },
    ];
  }

  const columns = useColumns(tourney, teamB);

  return (
    <Table striped bordered size="sm" style={{ textAlign: "center" }}>
      <thead>
        <tr>
          <th />
          {datas.map(({ team }) => (
            <th key={team?.id || 0}>
              {team ? (
                <TeamName teamId={team.id} hideFavorite />
              ) : modeScore == "tourney" ? (
                tourney?.name
              ) : modeScore == "season" ? (
                <Trans i18nKey="team.currentSeason">Current season</Trans>
              ) : (
                <Trans i18nKey="team.allSeasons">All seasons</Trans>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {columns.map((c, i) => (
          <tr key={i}>
            <td>
              <CJoliTooltip info={c.description}>{c.label}</CJoliTooltip>
            </td>
            {datas.map(({ team, rank, score }, j) => (
              <React.Fragment key={j}>
                {c.callRank ? (
                  <TeamCell
                    value={rank}
                    valueB={rankB}
                    call={c.callRank}
                    getLabel={c.getLabel}
                    getInfo={c.getInfo}
                    active={c.active && j == 0}
                    up={c.up}
                    display={!c.needTeam || !!team}
                  />
                ) : (
                  <TeamCell
                    value={score}
                    valueB={scoreB}
                    call={c.callScore!}
                    getLabel={c.getLabel}
                    getInfo={c.getInfo}
                    active={c.active && j == 0}
                    up={c.up}
                    display={!c.needTeam || (!!team && modeScore == "tourney")}
                  />
                )}
              </React.Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TeamTable;
