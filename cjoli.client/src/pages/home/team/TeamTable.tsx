/* eslint-disable max-lines */
import { Table } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import CJoliTooltip from "../../../components/CJoliTooltip";
import React from "react";
import TeamCell from "./TeamCell";
import { Rank, Score, Squad, Team, Tourney } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import { Trans, useTranslation } from "react-i18next";
import useUid from "../../../hooks/useUid";

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

type Column = {
  label: string;
  description: string;
  callRank?: (r: Rank) => number;
  val?: (s: Score) => number;
  ration?: (s: Score) => string;
  callScore?: (col: Column) => (s: Score) => number | string;
  getLabelRank?: (r: Rank) => number | string | undefined;
  getLabelScore?: (col: Column) => (s: Score) => number | string | undefined;
  getInfo?: (col: Column) => (r: Score) => string | boolean;
  up: boolean;
  active: boolean;
  needTeam: boolean;
};

const useColumns = (tourney?: Tourney, teamB?: Team) => {
  const { t } = useTranslation();
  const { modeScore } = useCJoli();
  const uid = useUid();
  const formatRank = useFormatRank();

  const winPt = tourney?.config.win || 2;
  let columns: Column[] = [];

  if (modeScore == "tourney" && uid) {
    columns = [
      {
        label: "Rang",
        description: t("rank.ranking", "Ranking"),
        callRank: (r: Rank) => r.order || 0,
        getLabelRank: (r: Rank) =>
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
        val: (s: Score) => s.total,
        callScore: (col: Column) => col.val!,
        getInfo: () => (s: Score) =>
          s.game > 0 && percent(s.total, winPt * s.game),
        up: true,
        active: !!teamB,
        needTeam: true,
      },
    ];
  }
  columns = [
    ...columns,
    {
      label: "PJ",
      description: t("rank.game", "Games played"),
      val: (s: Score) => s.game,
      callScore: (col: Column) => col.val!,
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "V",
      description: t("rank.win", "Victories"),
      val: (s: Score) => s.win,
      ration: (s: Score) => (s.game > 0 ? percent(s.win, s.game) : ""),
      callScore: (col: Column) => (uid ? col.val! : col.ration!),
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : col.val!(s)) + formatRank(s.ranks?.win?.rank),
      up: true,
      active: !!teamB,
      needTeam: false,
    },
    {
      label: "N",
      description: t("rank.neutral", "Drawn games"),
      val: (s: Score) => s.neutral,
      ration: (s: Score) => (s.game > 0 ? percent(s.neutral, s.game) : ""),
      callScore: (col: Column) => (uid ? col.val! : col.ration!),
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : col.val!(s)) +
        formatRank(s.ranks?.neutral?.rank),
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "D",
      description: t("rank.loss", "Defeats"),
      val: (s: Score) => s.loss,
      ration: (s: Score) => (s.game > 0 ? percent(s.loss, s.game) : ""),
      callScore: (col: Column) => (uid ? col.val! : col.ration!),
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : col.val!(s)) + formatRank(s.ranks?.loss?.rank),
      up: false,
      active: !!teamB,
      needTeam: false,
    },
    {
      label: "BP",
      description: t("rank.goalFor", "Goals for"),
      val: (s: Score) => {
        return s.goalFor;
      },
      ration: (s: Score) => (s.game > 0 ? average(s.goalFor, s.game) : ""),
      getLabelScore: (col: Column) => (uid ? col.val! : col.ration!),
      callScore: () => (s: Score) => {
        if (!teamB) return s.goalFor / s.game;
        return s.goalFor;
      },
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : s.goalFor) + formatRank(s.ranks?.goalFor?.rank),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "BC",
      description: t("rank.goalAgainst", "Goals against"),
      val: (s: Score) => {
        return s.goalAgainst;
      },
      ration: (s: Score) => (s.game > 0 ? average(s.goalAgainst, s.game) : ""),
      getLabelScore: (col: Column) => (uid ? col.val! : col.ration!),
      callScore: () => (s: Score) => {
        if (!teamB) return s.goalAgainst / s.game;
        return s.goalAgainst;
      },
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : s.goalAgainst) +
        formatRank(s.ranks?.goalAgainst?.rank),
      up: false,
      active: true,
      needTeam: false,
    },
    {
      label: "BL",
      description: t("rank.shutOut", "ShutOut"),
      val: (s: Score) => {
        return s.shutOut;
      },
      ration: (s: Score) => (s.game > 0 ? percent(s.shutOut, s.game) : ""),
      getLabelScore: (col: Column) => (uid ? col.val! : col.ration!),
      callScore: () => (s: Score) => {
        if (!teamB) return s.shutOut / s.game;
        return s.shutOut;
      },
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : s.shutOut) + formatRank(s.ranks?.shutOut?.rank),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "+/-",
      description: t("rank.goalDiff", "Goal average"),
      val: (s: Score) => {
        return s.goalDiff;
      },
      ration: (s: Score) => (s.game > 0 ? average(s.goalDiff, s.game) : ""),
      getLabelScore: (col: Column) => (uid ? col.val! : col.ration!),
      callScore: () => (s: Score) => {
        if (!teamB) return s.goalDiff / s.game;
        return s.goalDiff;
      },
      getInfo: (col: Column) => (s: Score) =>
        (uid ? col.ration!(s) : s.goalDiff) +
        formatRank(s.ranks?.goalDiff?.rank),
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
        val: (s: Score) => s.penalty,
        ration: (s: Score) => (s.game > 0 ? average(s.penalty, s.game) : ""),
        callScore: (col: Column) => (uid ? col.val! : col.ration!),
        getInfo: (col: Column) => (s: Score) =>
          (uid ? col.ration!(s) : col.val!(s)) +
          formatRank(s.ranks?.penalty?.rank),
        up: false,
        active: true,
        needTeam: false,
      },
    ];
  }

  return columns;
};

// eslint-disable-next-line max-statements
const TeamTable = ({ team, teamB, squad }: TeamTableProps) => {
  const {
    tourney,
    getTeamRank,
    getScoreForTeam,
    getScoreAllTeams,
    getScoreFromSquad,
    modeScore,
    classNamesCast,
  } = useCJoli();
  const uid = useUid();

  let rank = getTeamRank(team);
  let rankB = teamB && getTeamRank(teamB);
  const mode =
    uid || typeof modeScore == "object"
      ? modeScore
      : { seasons: [], categories: [] };
  const score = getScoreForTeam(mode, team);
  let scoreB: Score | undefined;
  if (teamB) {
    scoreB = getScoreForTeam(mode, teamB);
  }
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
    scoreB = getScoreAllTeams(mode);
    datas = [...datas, { team: undefined, rank: undefined, score: scoreB }];
  }

  const columns = useColumns(tourney, teamB);

  return (
    <div className="" style={{ width: "100%" }}>
      <Table striped bordered size="sm" style={{ textAlign: "center" }}>
        <thead>
          <tr>
            <th />
            {datas.map(({ team }) => (
              <th
                key={team?.id || 0}
                className={`${classNamesCast.padding}`}
                style={{ fontWeight: 600 }}
              >
                {team ? (
                  <TeamName teamId={team.id} hideFavorite />
                ) : modeScore == "tourney" ? (
                  tourney?.name
                ) : modeScore == "season" ? (
                  <Trans i18nKey="team.currentSeason">Current season</Trans>
                ) : uid ? (
                  <Trans i18nKey="team.allSeasons">All seasons</Trans>
                ) : (
                  <Trans i18nKey="team.allTeams">All teams</Trans>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((c, i) => (
            <tr key={i}>
              <td className={classNamesCast.padding}>
                <CJoliTooltip info={c.description}>{c.label}</CJoliTooltip>
              </td>
              {datas.map(({ team, rank, score }, j) => (
                <React.Fragment key={j}>
                  {c.callRank ? (
                    <TeamCell
                      value={rank}
                      valueB={rankB}
                      call={c.callRank}
                      getLabel={c.getLabelRank}
                      active={c.active && j == 0}
                      up={c.up}
                      display={!c.needTeam || !!team}
                    />
                  ) : (
                    <TeamCell
                      value={score}
                      valueB={scoreB}
                      call={c.callScore!(c)}
                      getLabel={
                        c.getLabelScore ? c.getLabelScore(c) : undefined
                      }
                      getInfo={c.getInfo ? c.getInfo(c) : undefined}
                      active={c.active && j == 0}
                      up={c.up}
                      display={
                        !c.needTeam || (!!team && modeScore == "tourney")
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TeamTable;
