import { Badge } from "react-bootstrap";
import { IMatch } from "../models";
import { useCJoli } from "../hooks/useCJoli";

interface ScoreBadgeProps {
  match: IMatch;
  mode: "A" | "B";
  className?: string;
  xl?: boolean;
  sm?: boolean;
}

const ScoreBage = ({ match, mode, className, xl, sm }: ScoreBadgeProps) => {
  const { isXl } = useCJoli();
  let badge =
    (mode == "A" && (match.scoreA > match.scoreB || match.winnerA)) ||
    (mode == "B" && (match.scoreA < match.scoreB || match.winnerB))
      ? "success"
      : match.scoreA === match.scoreB && !match.winnerA && !match.winnerB
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
      style={{
        fontSize: xl || isXl ? "32px" : sm ? "14px" : "18px",
        opacity: match.done ? 1 : 0.6,
      }}
      className={`my-1 ${className}`}
    >
      {mode == "A" ? match.scoreA : match.scoreB}
    </Badge>
  );
};

export default ScoreBage;
