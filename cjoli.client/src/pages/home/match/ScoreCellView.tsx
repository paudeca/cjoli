import { Badge } from "react-bootstrap";

const ScoreCellView = ({
  score,
  bg,
  text,
}: {
  score: number;
  bg: string;
  text: string;
}) => {
  return (
    <Badge bg={bg} text={text} style={{ fontSize: "18px" }} className="my-1">
      {score}
    </Badge>
  );
};

export default ScoreCellView;
