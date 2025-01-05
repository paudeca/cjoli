import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TimeLine, { LIST_COLORS } from "./TimeLine";
import { Score, ScoreSource } from "../../models";
import { useState } from "react";
import { useCJoli } from "../../hooks/useCJoli";
import useScreenSize from "../../hooks/useScreenSize";
import { ChartData } from "chart.js";

const TimeLineTourney = () => {
  const [type, setType] = useState<keyof Score>("total");
  const { t } = useTranslation();
  const { teams, ranking } = useCJoli();
  const { isMobile } = useScreenSize();

  const options = [
    { id: "total", label: t("rank.total", "Points") },
    { id: "game", label: t("rank.game", "Games played") },
    { id: "win", label: t("rank.win", "Victories") },
    { id: "neutral", label: t("rank.neutral", "Drawn games") },
    { id: "loss", label: t("rank.loss", "Defeats") },
    { id: "goalFor", label: t("rank.goalFor", "Goals for") },
    { id: "goalAgainst", label: t("rank.goalAgainst", "Goals against") },
    { id: "shutOut", label: t("rank.shutOut", "ShutOut") },
    { id: "goalDiff", label: t("rank.goalDiff", "Goal average") },
  ];

  const defintions = (teams || []).map((team, i) => {
    return {
      teamId: team.id,
      label: team.name,
      value: (s: Score) => s[type],
      color: LIST_COLORS[i % LIST_COLORS.length],
    };
  });

  const data: {
    datasets: {
      label: string;
      data: {
        x:
          | number
          | Date
          | Record<string, { rank: number; max: number; min: number }>
          | Record<number, ScoreSource>;
        y:
          | number
          | Date
          | Record<string, { rank: number; max: number; min: number }>
          | Record<number, ScoreSource>;
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
    <Form>
      <Form.Select
        onChange={(e) => setType(e.currentTarget.value as keyof Score)}
        data-testid="select"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </Form.Select>

      <TimeLine data={data as ChartData<"line">} />
    </Form>
  );
};

export default TimeLineTourney;
