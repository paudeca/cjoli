import {
  Button,
  ListGroup,
  OverlayTrigger,
  Popover,
  PopoverProps,
} from "react-bootstrap";
import { Match } from "../../../models";
import { Fragment } from "react";
import { useMatchRow } from "./useMatchRow";
import { Trans } from "react-i18next";
import TeamName from "../../../components/TeamName";
import ScoreMatchView from "./ScoreMatchView";
import BetScoreBadge from "../../../components/BetScoreBadge";

const BetScore = ({ match }: { match: Match }) => {
  const { isSimulation } = useMatchRow();
  const { userMatch } = match;
  if (!isSimulation || !match.userMatch || !match.done) {
    return <Fragment />;
  }
  const betScore = userMatch?.betScore || 0;

  const imatch = match.userMatch;
  if (!imatch) {
    return null;
  }

  const BetScorePopover = (props: PopoverProps) => (
    <Popover {...props} body>
      <Popover.Header style={{ color: "black" }}>
        <TeamName positionId={match.positionIdA} hideFavorite /> -
        <TeamName positionId={match.positionIdB} hideFavorite />
      </Popover.Header>
      <Popover.Body>
        <ListGroup className="mb-3">
          <ListGroup.Item className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">
                <Trans i18nKey="betScore.finalScore">Final score</Trans>
              </div>
              <ScoreMatchView match={match} />
            </div>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">
                <Trans i18nKey="betScore.forecastScore">Forecast Score</Trans>
              </div>
              <ScoreMatchView match={imatch} />
            </div>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">
                <Trans i18nKey="betScore.point">Points</Trans>
              </div>
              <BetScoreBadge score={imatch.betScore} />
            </div>
          </ListGroup.Item>
        </ListGroup>
        <Button onClick={() => document.body.click()} size="sm">
          <Trans i18nKey="button.close">Close</Trans>
        </Button>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      overlay={BetScorePopover}
      trigger="click"
      rootClose
      placement="auto"
    >
      <span>
        <BetScoreBadge score={betScore} />
      </span>
    </OverlayTrigger>
  );
};

export default BetScore;
