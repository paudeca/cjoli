import BetScoreBadge from "../../components/BetScoreBadge";
import { useCJoli } from "../../hooks/useCJoli";

const BetScoreTotal = () => {
  const { matches } = useCJoli();
  const score = matches
    .filter((m) => m.userMatch && m.done)
    .reduce((acc, m) => {
      return acc + m.userMatch?.betScore;
    }, 0);
  return <BetScoreBadge score={score} />;
};

export default BetScoreTotal;
