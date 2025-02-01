import { Badge } from "react-bootstrap";
import ScoreCellView from "./ScoreCellView";
import { IMatch } from "../../../models";
import useScreenSize from "../../../hooks/useScreenSize";

const ScoreMatchView = ({ match }: { match: IMatch }) => {
  const { isMobile } = useScreenSize();
  return (
    <>
      <ScoreCellView match={match} mode="A" />
      {!isMobile && (
        <Badge
          bg="light"
          text="black"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
        >
          <b>-</b>
        </Badge>
      )}
      <ScoreCellView match={match} mode="B" />
    </>
  );
};

export default ScoreMatchView;
