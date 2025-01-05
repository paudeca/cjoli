import { Badge } from "react-bootstrap";
import { IMatch } from "../../../models";

interface ScoreCellViewProps {
  match: IMatch;
  mode: "A" | "B";
}

const ScoreCellView = ({ match, mode }: ScoreCellViewProps) => {
  let badge =
    (mode == "A" && match.scoreA > match.scoreB) ||
    (mode == "B" && match.scoreA < match.scoreB)
      ? "success"
      : match.scoreA === match.scoreB
        ? "warning"
        : "danger";
  if (match.forfeitA) {
    badge = mode == "A" ? "danger" : "success";
  } else if (match.forfeitB) {
    badge = mode == "A" ? "success" : "danger";
  }
  const text = badge == "warning" ? "black" : "white";

  return (
    <Badge
      bg={badge}
      text={text}
      style={{ fontSize: "18px", opacity: match.done ? 1 : 0.6 }}
      className="my-1"
    >
      {mode == "A" ? match.scoreA : match.scoreB}
    </Badge>
  );
};

export default ScoreCellView;
