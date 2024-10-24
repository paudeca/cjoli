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
import { useCJoli } from "../../hooks/useCJoli";
import { Score } from "../../models";
import useScreenSize from "../../hooks/useScreenSize";

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

const list = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.yellow,
  CHART_COLORS.green,
  CHART_COLORS.teal,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.brown,
  CHART_COLORS.grey,
];

const TimeLine = ({ type }: { type: keyof Score }) => {
  const { teams, ranking } = useCJoli();
  const { isMobile } = useScreenSize();

  const defintions = (teams || []).map((team, i) => {
    return {
      teamId: team.id,
      label: team.name,
      value: (s: Score) => s[type],
      color: list[i % list.length],
    };
  });

  const data: {
    datasets: {
      label: string;
      data: {
        x: number | Date | Record<string, number>;
        y: number | Date | Record<string, number>;
      }[];
    }[];
  } = {
    datasets: defintions.map((def) => ({
      label: def.label,
      data: (ranking?.history || {})[def.teamId].map((s) => ({
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

export default TimeLine;
