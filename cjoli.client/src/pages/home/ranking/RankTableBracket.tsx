import {
  Card,
  Carousel,
  Col,
  Container,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { Match, MatchType, Phase, Squad } from "../../../models";
import TeamName from "../../../components/TeamName";
import ScoreBage from "../../../components/ScoreBadge";
import useScreenSize from "../../../hooks/useScreenSize";

const TeamBracket = ({
  match,
  mode,
  positionId,
  left,
}: {
  match: Match;
  mode: "A" | "B";
  positionId: number;
  left?: boolean;
}) => {
  const { isMobile } = useScreenSize();
  return (
    <Row>
      <Col
        className={isMobile ? "text-center" : left ? `text-start` : `text-end`}
      >
        {match.done && left && <ScoreBage match={match} mode={mode} />}
        <TeamName
          positionId={positionId}
          hideFavorite
          className="font-weight-bold"
        />
        {match.done && !left && (
          <ScoreBage match={match} mode={mode} className="mx-1" />
        )}
      </Col>
    </Row>
  );
};

const MatchBracket = ({
  match,
  max,
  left,
  height,
}: {
  match: Match;
  max?: boolean;
  left?: boolean;
  height: number;
}) => {
  const { isMobile } = useScreenSize();
  return (
    <Row
      className={`d-flex align-items-center ${max ? "h-100" : isMobile ? "my-2" : "my-5"}`}
    >
      <Col>
        <Card>
          <Card.Title>{match.name}</Card.Title>
          <TeamBracket
            match={match}
            mode="A"
            positionId={match.positionIdA}
            left={left}
          />
          <ProgressBar
            now={match.done ? 100 : 0}
            className="mx-auto"
            style={{ width: 5, height }}
          />
          <TeamBracket
            match={match}
            mode="B"
            positionId={match.positionIdB}
            left={left}
          />
        </Card>
      </Col>
    </Row>
  );
};

const FinalMatchBracket = ({ match }: { match: Match }) => {
  return (
    <Card>
      <Card.Title>{match.name}</Card.Title>
      <Row className={`d-flex align-items-center`}>
        <Col>
          <TeamName positionId={match.positionIdA} hideFavorite />
          {match.done && <ScoreBage match={match} mode="A" className="mx-1" />}
          <ProgressBar
            now={match.done ? 100 : 0}
            className="d-inline-flex mx-2"
            style={{ width: 40, height: 5 }}
          />
          {match.done && <ScoreBage match={match} mode="B" className="mx-1" />}
          <TeamName positionId={match.positionIdB} hideFavorite />
        </Col>
      </Row>
    </Card>
  );
};

const MobileBracket = ({ bracket }: { bracket: Record<MatchType, Match> }) => {
  return (
    <div className="mx-2">
      <Carousel data-bs-theme="dark">
        {bracket.Quarter1 && (
          <Carousel.Item>
            <Container data-bs-theme="light">
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Quarter1} height={20} />
                </Col>
              </Row>
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Quarter2} height={20} />
                </Col>
              </Row>
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Quarter3} height={20} />
                </Col>
              </Row>
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Quarter4} height={20} />
                </Col>
              </Row>
              <Row style={{ height: 60 }}></Row>
            </Container>
          </Carousel.Item>
        )}
        <Carousel.Item>
          <Container data-bs-theme="light">
            <Row>
              <Col xs={{ offset: 1, span: 10 }}>
                <MatchBracket match={bracket.Semi1} height={20} />
              </Col>
            </Row>
            <Row>
              <Col xs={{ offset: 1, span: 10 }}>
                <MatchBracket match={bracket.Semi2} height={20} />
              </Col>
            </Row>
            {bracket.Final3 && (
              <>
                <Row>
                  <Col xs={{ offset: 1, span: 10 }}>
                    <MatchBracket match={bracket.Semi3} height={20} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={{ offset: 1, span: 10 }}>
                    <MatchBracket match={bracket.Semi4} height={20} />
                  </Col>
                </Row>
              </>
            )}
            <Row style={{ height: 60 }}></Row>
          </Container>
        </Carousel.Item>
        <Carousel.Item>
          <Container data-bs-theme="light">
            <Row>
              <Col xs={{ offset: 1, span: 10 }}>
                <MatchBracket match={bracket.Final1} height={20} />
              </Col>
            </Row>
            {bracket.Final2 && (
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Final2} height={20} />
                </Col>
              </Row>
            )}
            {bracket.Final3 && (
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Final3} height={20} />
                </Col>
              </Row>
            )}
            {bracket.Final4 && (
              <Row>
                <Col xs={{ offset: 1, span: 10 }}>
                  <MatchBracket match={bracket.Final4} height={20} />
                </Col>
              </Row>
            )}
            <Row style={{ height: 60 }}></Row>
          </Container>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

const DesktopBracket = ({ bracket }: { bracket: Record<MatchType, Match> }) => {
  return (
    <div className="m-4">
      <Row>
        <Col lg={2}>
          {bracket.Quarter1 && (
            <>
              <MatchBracket match={bracket.Quarter1} height={40} />
              <MatchBracket match={bracket.Quarter2} height={40} />
            </>
          )}
        </Col>
        <Col lg={2}>
          {bracket.Semi1 && (
            <MatchBracket match={bracket.Semi1} max height={120} />
          )}
        </Col>
        <Col lg={4} className="text-center">
          {bracket.Final1 && (
            <Row className="h-50 d-flex align-items-end">
              <Col>
                <FinalMatchBracket match={bracket.Final1} />
              </Col>
            </Row>
          )}
          {bracket.Final2 && (
            <Row className="h-50 d-flex align-items-center">
              <Col>
                <FinalMatchBracket match={bracket.Final2} />
              </Col>
            </Row>
          )}
        </Col>
        {bracket.Semi2 && (
          <Col lg={2}>
            <MatchBracket match={bracket.Semi2} max left height={120} />
          </Col>
        )}
        {bracket.Quarter1 && (
          <Col lg={2}>
            <MatchBracket match={bracket.Quarter3} left height={40} />
            <MatchBracket match={bracket.Quarter4} left height={40} />
          </Col>
        )}
      </Row>
      {bracket.Final3 && (
        <Row>
          <Col lg={2}></Col>
          <Col lg={2}>
            <MatchBracket match={bracket.Semi3} max height={120} />
          </Col>
          <Col lg={4} className="text-center">
            <Row className="h-50 d-flex align-items-end">
              <Col>
                <FinalMatchBracket match={bracket.Final3} />
              </Col>
            </Row>
            {bracket.Final4 && (
              <Row className="h-50 d-flex align-items-center">
                <Col>
                  <FinalMatchBracket match={bracket.Final4} />
                </Col>
              </Row>
            )}
          </Col>
          <Col lg={2}>
            <MatchBracket match={bracket.Semi4} max left height={120} />
          </Col>
          <Col lg={2}></Col>
        </Row>
      )}
    </div>
  );
};

interface RankTableBracketProps {
  phase: Phase;
  squad: Squad;
}

const RankTableBracket = ({ squad }: RankTableBracketProps) => {
  const { isMobile } = useScreenSize();
  const bracket: Record<MatchType, Match> = squad.matches
    .filter((m) => m.matchType)
    .reduce(
      (acc, m) => {
        return { ...acc, [m.matchType!]: m };
      },
      {} as Record<MatchType, Match>
    );
  return isMobile ? (
    <MobileBracket bracket={bracket} />
  ) : (
    <DesktopBracket bracket={bracket} />
  );
};

export default RankTableBracket;
