import { Badge } from "react-bootstrap";

const BetScoreBadge = ({ score }: { score: number }) => {
  return (
    <Badge
      pill
      bg={score >= 5 ? "success" : score >= 1 ? "warning" : "danger"}
      text={score < 5 && score >= 1 ? "black" : "white"}
      className="mx-2"
      role="button"
    >
      +{score}
    </Badge>
  );
};

export default BetScoreBadge;
