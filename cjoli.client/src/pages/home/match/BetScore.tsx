import { Badge } from "react-bootstrap";
import { Match } from "../../../models";
import { Fragment } from "react";
import { useMatchRow } from "./useMatchRow";

const BetScore = ({ match }: { match: Match }) => {
  const { isSimulation } = useMatchRow();
  const { userMatch } = match;
  if (!isSimulation || !match.userMatch || !match.done) {
    return <Fragment />;
  }
  const betScore = userMatch?.betScore || 0;
  return (
    <Badge
      pill
      bg={betScore >= 5 ? "success" : betScore >= 1 ? "warning" : "danger"}
      text={betScore < 5 && betScore >= 1 ? "black" : "white"}
      className="mx-2"
    >
      +{userMatch?.betScore}
    </Badge>
  );
};

export default BetScore;
