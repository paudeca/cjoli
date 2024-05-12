import { Bar } from "react-chartjs-2";

import "chartjs-adapter-moment";

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
import { useCJoli } from "../../../hooks/useCJoli";
import { Rank, Score, Team } from "../../../models";
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

const TeamBar = ({ team, teamB }: { team: Team; teamB?: Team }) => {
  const { getTeamRank, getScoreForTeam } = useCJoli();
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);

  const score = getScoreForTeam(team);
  const scoreB = teamB && getScoreForTeam(teamB);

  const getData = React.useCallback((score: Score, rank?: Rank) => {
    return [
      rank?.order || 0,
      score.total,
      score.game,
      score.win,
      score.neutral,
      score.loss,
      score.goalFor / score.game,
      score.goalAgainst / score.game,
      score.shutOut,
      score.goalDiff / score.game,
      //score.penalty,
    ];
  }, []);

  const data = {
    labels: ["Rang", "PTS", "PJ", "V", "N", "D", "BP", "BC", "BL", "GA"],
    datasets: [
      {
        label: team.name,
        data: getData(score!, rank),
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
      <Bar
        data={data}
        options={{
          indexAxis: "y",
        }}
      />
    </div>
  );
};

export default TeamBar;
