import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TimeLine, { LIST_COLORS } from "./TimeLine";
import { useState } from "react";
import { BetScore } from "../../models/BetScore";
import { useCJoli } from "../../hooks/useCJoli";
import useScreenSize from "../../hooks/useScreenSize";
import { ChartData } from "chart.js";

const TimeLineUser = () => {
  const [type, setType] = useState<keyof BetScore>("score");
  const { t } = useTranslation();
  const { ranking } = useCJoli();
  const { isMobile } = useScreenSize();

  const options = [
    { id: "score", label: t("rank.score", "Score") },
    { id: "perfect", label: t("rank.perfect", "Perfect") },
    { id: "winner", label: t("rank.winner", "Winner") },
    { id: "diff", label: t("rank.diff", "Diff") },
    { id: "goal", label: t("rank.goal", "Goal") },
  ];

  const users = Object.keys(ranking?.scores.bet.history || {}).map((k) =>
    parseInt(k)
  );
  users.sort((a, b) => {
    const rankA =
      ranking?.scores.bet.scores.findIndex((s) => s.userId == a) ?? 0;
    const rankB =
      ranking?.scores.bet.scores.findIndex((s) => s.userId == b) ?? 0;
    return rankA < rankB ? -1 : 1;
  });

  const names: Record<number, string> = ranking!.scores.bet.users.reduce(
    (acc, u) => ({ ...acc, [u.id]: u.login }),
    {}
  );

  const defintions = (users || []).map((user, i) => {
    return {
      userId: user,
      label: names[user] ?? "Bot",
      value: (s: BetScore) => s[type],
      color: LIST_COLORS[i % LIST_COLORS.length],
    };
  });

  const data = {
    datasets: defintions.map((def) => {
      const data = (ranking?.scores.bet.history || {})[def.userId];
      return {
        label: def.label,
        data: data
          .filter((s, i) => {
            if (i > 0) {
              const val0 = def.value(data[i - 1]);
              const val = def.value(s);
              return val0 != val;
            }
            return true;
          })
          .map((s) => {
            return {
              x: !isMobile ? s.time : def.value(s),
              y: !isMobile ? def.value(s) : s.time,
            };
          }),
        borderWidth: 1,
        borderColor: `rgb(${def.color})`,
        backgroundColor: `rgba(${def.color},0.5)`,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      };
    }),
  };

  return (
    <Form>
      <Form.Select
        onChange={(e) => setType(e.currentTarget.value as keyof BetScore)}
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

export default TimeLineUser;
