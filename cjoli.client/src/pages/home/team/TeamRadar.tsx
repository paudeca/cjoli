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
  teamA: { team: Team; rank: Rank; score: Score };
  teamB?: { team?: Team; rank?: Rank; score?: Score };
  direction: "vertical" | "horizontal";
}

const TeamRadar = ({ teamA, teamB, direction }: TeamRadarProps) => {
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Chart.js Radar Chart",
      },
    },
  };
  const { team, rank, score } = teamA;
  console.log("TeamRadar", team, rank, score);
  if (!team || !score) {
    return <></>;
  }

  const data = {
    labels: ["Rang", "PTS", "PJ", "V", "N", "D", "BP", "BC", "BL", "GA", "PEN"],
    datasets: [
      {
        label: team.name,
        data: [
          rank?.order || 0,
          score.total,
          score.game,
          score.win,
          score.neutral,
          score.loss,
          score.goalFor,
          score.goalAgainst,
          score.shutOut,
          score.goalDiff,
          score.penalty,
        ],
        borderWidth: 1,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132,0.5)",
      },
    ],
  };
  if (teamB && teamB.team && teamB.score) {
    data.datasets = [
      ...data.datasets,
      {
        label: teamB.team.name,
        data: [
          teamB.rank?.order || 0,
          teamB.score.total,
          teamB.score.game,
          teamB.score.win,
          teamB.score.neutral,
          teamB.score.loss,
          teamB.score.goalFor,
          teamB.score.goalAgainst,
          teamB.score.shutOut,
          teamB.score.goalDiff,
          teamB.score.penalty,
        ],
        borderWidth: 1,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235,0.5)",
      },
    ];
  }

  return (
    <div style={{ width: direction == "horizontal" ? "100%" : "100%" }}>
      <Radar
        data={data}
        options={{ ...options, scales: { r: { beginAtZero: true } } }}
      />
    </div>
  );
};

export default TeamRadar;
