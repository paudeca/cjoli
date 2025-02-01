import { Radar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  ScatterController,
  ArcElement,
  LineElement,
  PointElement,
  Decimation,
  Filler,
  SubTitle,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
} from "chart.js";
import { Rank, Score, Team } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import React from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  ScatterController,
  ArcElement,
  LineElement,
  PointElement,
  Decimation,
  Filler,
  SubTitle,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale
);

interface TeamRadarProps {
  team: Team;
  teamB?: Team;
}

const TeamRadar = ({ team, teamB }: TeamRadarProps) => {
  const { ranking, getTeamRank, getScoreForTeam } = useCJoli();
  const options = {
    responsive: true,
  };
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);

  const score = getScoreForTeam(team);
  const scoreB = teamB && getScoreForTeam(teamB);

  const countTeams = ranking?.tourney.teams.length || 0;
  const winPt = ranking?.tourney.config.win || 2;
  const ranks = score?.ranks;

  const getData = React.useCallback(
    (score: Score, rank?: Rank) => {
      return [
        score.game > 0
          ? ((countTeams - (rank?.order || 0)) / countTeams) * 100
          : 0,
        (score.total / (score.game * winPt)) * 100,
        (score.win / ranks!.win.max) * 100,
        (score.neutral / ranks!.neutral.max) * 100,
        ((ranks!.loss.max - score.loss) / ranks!.loss.max) * 100,
        (score.goalFor / ranks!.goalFor.max) * 100,
        ((ranks!.goalAgainst.max - score.goalAgainst) /
          ranks!.goalAgainst.max) *
          100,
        (score.shutOut / ranks!.shutOut.max) * 100,
        ((score.goalDiff - ranks!.goalDiff.min) /
          (ranks!.goalDiff.max - ranks!.goalDiff.min)) *
          100,
      ];
    },
    [countTeams, ranks, winPt]
  );

  if (!team || !score) {
    return <></>;
  }

  const data = {
    labels: ["Rang", "PTS", "V", "N", "D", "BP", "BC", "BL", "GA"],
    datasets: [
      {
        label: team.name,
        data: getData(score, rank),
        borderWidth: 1,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132,0.5)",
      },
    ],
  };
  if (teamB && teamB && scoreB) {
    data.datasets = [
      ...data.datasets,
      {
        label: teamB.name,
        data: getData(scoreB, rankB),
        borderWidth: 1,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235,0.5)",
      },
    ];
  }

  return (
    <div
      style={{
        width: "100%",
        maxHeight: 450,
      }}
    >
      <Radar
        data={data}
        options={{
          ...options,
          scales: {
            r: { beginAtZero: true, display: true },
          },
        }}
      />
    </div>
  );
};

export default TeamRadar;
