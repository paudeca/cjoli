import BetScoreBadge from "../../components/BetScoreBadge";
import { useCJoli } from "../../hooks/useCJoli";
import { useUser } from "../../hooks/useUser";

const BetScoreTotal = () => {
  const { matches, ranking } = useCJoli();
  const { user } = useUser();
  const userMatches = matches.filter((m) => m.userMatch && m.done);
  if (userMatches.length == 0) {
    return null;
  }
  const score = userMatches.reduce((acc, m) => {
    return acc + (m.userMatch?.betScore || 0);
  }, 0);

  const rank = ranking?.scores.bet.scores.findIndex(
    (s) => s.userId == user?.id
  );

  const getRank = () => {
    switch (rank) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return "";
    }
  };

  return (
    <span role="button">
      Score: <BetScoreBadge score={score} />
      {getRank()}
    </span>
  );
};

export default BetScoreTotal;
