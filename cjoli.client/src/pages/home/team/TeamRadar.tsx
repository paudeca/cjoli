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
import React, { useCallback } from "react";

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
  const {
    ranking,
    getTeamRank,
    getScoreForTeam,
    modeScore,
    isXl,
    classNamesCast,
  } = useCJoli();
  const options = {
    responsive: true,
  };
  const rank = getTeamRank(team);
  const rankB = teamB && getTeamRank(teamB);

  const score = getScoreForTeam(modeScore, team);
  const scoreB = teamB && getScoreForTeam(modeScore, teamB);

  const countTeams = ranking?.tourney?.teams.length || 10;
  const winPt = ranking?.tourney?.config.win || 2;

  const getDataRatio = useCallback((type: keyof Score, score: Score) => {
    return (
      ((score[type] as number) / score.game / score.ranks[type]?.maxRatio) * 100
    );
  }, []);

  const getDataRatioReverse = useCallback((type: keyof Score, score: Score) => {
    return (
      ((score.ranks[type]?.maxRatio - (score[type] as number) / score.game) /
        score.ranks[type]?.maxRatio) *
      100
    );
  }, []);

  const getData = React.useCallback(
    (score: Score, rank?: Rank) => {
      let data: number[] = [];
      if (modeScore == "tourney") {
        data = [
          score.game > 0 && modeScore == "tourney"
            ? ((countTeams - (rank?.order || 0)) / (countTeams - 1)) * 100
            : 0,
          (score.total / (score.game * winPt)) * 100,
        ];
      }
      data = [
        ...data,
        getDataRatio("win", score),
        getDataRatio("neutral", score),
        getDataRatioReverse("loss", score),
        getDataRatio("goalFor", score),
        getDataRatioReverse("goalAgainst", score),
        getDataRatio("shutOut", score),
        //getDataRatio("goalDiff", score),
        ((score.goalDiff / score.game - score.ranks!.goalDiff?.minRatio) /
          (score.ranks!.goalDiff?.maxRatio - score.ranks!.goalDiff?.minRatio)) *
          100,
      ];
      return data;
    },
    [countTeams, winPt, modeScore, getDataRatio, getDataRatioReverse]
  );

  if (!team || !score) {
    return <></>;
  }

  const data = {
    labels:
      modeScore == "tourney"
        ? ["Rang", "PTS", "V", "N", "D", "BP", "BC", "BL", "GA"]
        : ["V", "N", "D", "BP", "BC", "BL", "GA"],
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
        width: isXl ? "70%" : "100%",
        maxHeight: isXl ? 1000 : 450,
      }}
    >
      <Radar
        data={data}
        options={{
          ...options,
          scales: {
            r: {
              beginAtZero: true,
              display: true,
              ticks: { font: { size: classNamesCast.radar } },
              pointLabels: {
                font: { size: classNamesCast.radar },
              },
            },
          },

          plugins: {
            legend: {
              labels: {
                font: {
                  size: classNamesCast.radar,
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default TeamRadar;
