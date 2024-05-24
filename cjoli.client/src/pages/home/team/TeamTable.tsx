import { Table } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import CJoliTooltip from "../../../components/CJoliTooltip";
import React from "react";
import TeamCell from "./TeamCell";
import { Rank, Score, Team } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";

const percent = (value: number, total: number) =>
  total == 0 ? "" : `${Math.round((value / total) * 100)}%`;

const average = (value: number, total: number) =>
  total == 0 ? "" : `avg: ${(value / total).toFixed(1)}`;

const TeamTable = ({ team, teamB }: { team: Team; teamB?: Team }) => {
  const { ranking, tourney, getTeamRank, getScoreForTeam, getRankingByField } =
    useCJoli();
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);
  const score = getScoreForTeam(team)!;
  let scoreB = teamB && getScoreForTeam(teamB);
  score.rank = getRankingByField(team);
  if (teamB && scoreB) {
    scoreB.rank = getRankingByField(teamB);
  }

  let datas: { team?: Team; rank?: Rank; score?: Score }[] = [
    { team, rank, score },
  ];
  if (teamB) {
    datas = [...datas, { team: teamB, rank: rankB, score: scoreB }];
  } else {
    const scoreTourney = ranking?.scores.scoreTourney;
    scoreB = scoreTourney;
    datas = [
      ...datas,
      { team: undefined, rank: undefined, score: scoreTourney },
    ];
  }

  const formatRank = (rank?: number) => {
    if (rank == undefined) return "";
    if (rank == 0) {
      return ` - 1er 🥇`;
    } else if (rank == 1) {
      return ` - 2ème 🥈`;
    } else if (rank == 2) {
      return ` - 3ème 🥉`;
    } else {
      return ` - ${rank + 1}ème`;
    }
  };

  const columns = [
    {
      label: "Rang",
      description: "Classement",
      callRank: (r: Rank) => r.order || 0,
      getLabel: (r: Rank) => (r.order == 1 ? "1er" : `${r.order}ème`),
      up: false,
      active: true,
      needTeam: true,
    },
    {
      label: "PTS",
      description: "Points",
      callScore: (s: Score) => s.total,
      getInfo: (s: Score) => percent(s.total, 3 * s.game),
      up: true,
      active: !!teamB,
      needTeam: true,
    },
    {
      label: "PJ",
      description: "Parties jouées",
      callScore: (s: Score) => s.game,
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "V",
      description: "Victoires",
      callScore: (s: Score) => s.win,
      getInfo: (s: Score) => percent(s.win, s.game) + formatRank(s.rank?.win),
      up: true,
      active: !!teamB,
      needTeam: false,
    },
    {
      label: "N",
      description: "Parties nulles",
      callScore: (s: Score) => s.neutral,
      getInfo: (s: Score) =>
        percent(s.neutral, s.game) + formatRank(s.rank?.neutral),
      up: true,
      active: false,
      needTeam: false,
    },
    {
      label: "D",
      description: "Défaites",
      callScore: (s: Score) => s.loss,
      getInfo: (s: Score) => percent(s.loss, s.game) + formatRank(s.rank?.loss),
      up: false,
      active: !!teamB,
      needTeam: true,
    },
    {
      label: "BP",
      description: "Buts pour",
      callScore: (s: Score) => {
        if (!teamB) return s.goalFor / s.game;
        return s.goalFor;
      },
      getLabel: (s: Score) => s.goalFor,
      getInfo: (s: Score) =>
        average(s.goalFor, s.game) + formatRank(s.rank?.goalFor),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "BC",
      description: "Buts contre",
      callScore: (s: Score) => {
        if (!teamB) return s.goalAgainst / s.game;
        return s.goalAgainst;
      },
      getLabel: (s: Score) => s.goalAgainst,
      getInfo: (s: Score) =>
        average(s.goalAgainst, s.game) + formatRank(s.rank?.goalAgainst),
      up: false,
      active: true,
      needTeam: false,
    },
    {
      label: "BL",
      description: "Blanchissages",
      callScore: (s: Score) => {
        if (!teamB) return s.shutOut / s.game;
        return s.shutOut;
      },
      getLabel: (s: Score) => s.shutOut,
      getInfo: (s: Score) =>
        percent(s.shutOut, s.game) + formatRank(s.rank?.shutOut),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "+/-",
      description: "Goal average",
      callScore: (s: Score) => {
        if (!teamB) return s.goalDiff / s.game;
        return s.goalDiff;
      },
      getLabel: (s: Score) => s.goalDiff,
      getInfo: (s: Score) =>
        average(s.goalDiff, s.game) + formatRank(s.rank?.goalDiff),
      up: true,
      active: true,
      needTeam: false,
    },
    {
      label: "PEN",
      description: "Pénalités",
      callScore: (s: Score) => s.penalty,
      up: false,
      active: true,
      needTeam: false,
    },
  ];

  return (
    <Table striped bordered size="sm" style={{ textAlign: "center" }}>
      <thead>
        <tr>
          <th />
          {datas.map(({ team }) => (
            <th key={team?.id || 0}>
              {team ? <TeamName teamId={team.id} /> : tourney?.name}
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
                    label={c.label}
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
                    label={c.label}
                    value={score}
                    valueB={scoreB}
                    call={c.callScore!}
                    getLabel={c.getLabel}
                    getInfo={c.getInfo}
                    active={c.active && j == 0}
                    up={c.up}
                    display={!c.needTeam || !!team}
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
