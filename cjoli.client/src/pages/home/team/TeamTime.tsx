import { Line } from "react-chartjs-2";
import dayjs from "dayjs";

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
import { useParams } from "react-router-dom";
import { Score } from "../../../models";
import useScreenSize from "../../../hooks/useScreenSize";

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

const CHART_COLORS = {
  red: "255, 99, 132",
  orange: "255, 159, 64",
  yellow: "255, 205, 86",
  green: "75, 192, 192",
  teal: "38, 166, 154",
  blue: "54, 162, 235",
  purple: "153, 102, 255",
  brown: "121, 85, 72",
  grey: "120, 144, 156",
};

const TeamTime = () => {
  const { ranking, tourney } = useCJoli();
  const { teamId } = useParams();
  const { isMobile } = useScreenSize();

  let defintions = [
    {
      label: "PTS",
      value: (s: Score) => s.total,
      color: CHART_COLORS.purple,
    },
    {
      label: "PJ",
      value: (s: Score) => s.game,
      color: CHART_COLORS.grey,
    },
    {
      label: "V",
      value: (s: Score) => s.win,
      color: CHART_COLORS.red,
    },
    {
      label: "N",
      value: (s: Score) => s.neutral,
      color: CHART_COLORS.orange,
    },
    {
      label: "L",
      value: (s: Score) => s.loss,
      color: CHART_COLORS.yellow,
    },
    {
      label: "BP",
      value: (s: Score) => s.goalFor,
      color: CHART_COLORS.teal,
    },
    {
      label: "BC",
      value: (s: Score) => s.goalAgainst,
      color: CHART_COLORS.green,
    },
    {
      label: "GA",
      value: (s: Score) => s.goalDiff,
      color: CHART_COLORS.blue,
    },
    {
      label: "BL",
      value: (s: Score) => s.shutOut,
      color: CHART_COLORS.brown,
    },
  ];
  if (tourney?.config.hasPenalty) {
    defintions = [
      ...defintions,
      {
        label: "P",
        value: (s: Score) => s.penalty,
        color: CHART_COLORS.grey,
      },
    ];
  }

  const data: {
    datasets: {
      label: string;
      data: { x: number | Date; y: Date | number }[];
    }[];
  } = {
    datasets: defintions.map((def) => ({
      label: def.label,
      data: (ranking?.history || {})[parseInt(teamId!)].map((s) => ({
        x: !isMobile ? s.time : def.value(s),
        y: !isMobile ? def.value(s) : s.time,
      })),
      borderWidth: 1,
      borderColor: `rgb(${def.color})`,
      backgroundColor: `rgba(${def.color},0.5)`,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
    })),
  };

  return (
    <div
      style={{
        width: "100%",
        height: 450,
      }}
    >
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
            },
          },
          indexAxis: !isMobile ? "x" : "y",
          scales: {
            [!isMobile ? "x" : "y"]: {
              type: "time",
              reverse: isMobile,
              time: { unit: "hour", displayFormats: { hour: "LLL" } },
              ticks: {
                callback: (value, index, ticks) => {
                  const v = Math.round(ticks.length / 15);
                  if (index % v == 0) return dayjs(value).format("LT");
                },
                source: "auto",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default TeamTime;
