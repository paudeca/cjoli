import { useCallback, useState } from "react";
import Loading from "../components/Loading";
import CJoliStack from "../components/CJoliStack";
import { useCJoli } from "../hooks/useCJoli";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import CJoliTimeline from "../components/CJoliTimeline";
import CJoliTimeEvent from "../components/CJoliTimeEvent";
import { useApi } from "../hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import useUid from "../hooks/useUid";
import { useParams } from "react-router-dom";
import TeamName from "../components/TeamName";
import ScoreBage from "../components/ScoreBadge";
import { Match } from "../models";
import { BoxArrowInLeft, BoxArrowRight, Clock } from "react-bootstrap-icons";
import dayjs from "dayjs";
import { MatchEvent } from "../models/MatchEvent";
import { useTranslation } from "react-i18next";
import { useModal } from "../hooks/useModal";
import BasicModal from "../components/modals/BasicModal";
import CJoliTabs from "../components/CJoliTabs";
import PlayerSelect from "../components/selects/PlayerSelect";

interface MatchEventCardProps {
  event: MatchEvent;
  match: Match;
}
const MatchEventCard = ({ event, match }: MatchEventCardProps) => {
  const { findTeam } = useCJoli();
  const { t } = useTranslation();
  const teamA = findTeam({ positionId: match.positionIdA });
  const teamB = findTeam({ positionId: match.positionIdB });

  const mode =
    event.teamId == teamA?.id
      ? "left"
      : event.teamId == teamB?.id
        ? "right"
        : "middle";
  const team = mode == "left" ? teamA : teamB;

  const findPlayerName = useCallback(
    (player: number) =>
      team?.datas?.players.find((p) => p.number == player)?.name,
    [team?.datas?.players],
  );

  const getLabelPlayer = useCallback((num: number) => {
    return `#${num} ${findPlayerName(num) || ""}`;
  }, []);

  let body = null;
  switch (event.type) {
    case "Goal":
      body = (
        <>
          <h6>{getLabelPlayer(event.playerNum)}</h6>
          {event.assist1Num > 0 && (
            <div>{getLabelPlayer(event.assist1Num)}</div>
          )}
          {event.assist2Num > 0 && (
            <div>{getLabelPlayer(event.assist2Num)}</div>
          )}
        </>
      );
      break;
    case "GoalKeeper":
      body = (
        <>
          <h6>
            <BoxArrowRight className="mx-2" /> {getLabelPlayer(event.playerNum)}
          </h6>
          <h6>
            <BoxArrowInLeft className="mx-2" />{" "}
            {getLabelPlayer(event.goalKeeperInNum)}
          </h6>
        </>
      );
      break;
    case "Penalty":
      body = (
        <>
          <h6>{getLabelPlayer(event.playerNum)}</h6>
          <div>Type: {event.penalty}</div>
          <div>
            <Clock className="me-1" />{" "}
            {dayjs.duration(event.penaltyTime * 1000).humanize()}
          </div>
        </>
      );
      break;
  }
  return (
    <CJoliTimeEvent
      mode={mode}
      match={match}
      team={team}
      title={t(`match.event${event.type}`, event.type)}
      time={event.time}
      isGoal={event.type == "Goal"}
    >
      {body}
    </CJoliTimeEvent>
  );
};

const MatchPage = () => {
  const { isCastPage, isXl, findTeam } = useCJoli();
  const { getMatch, getRanking } = useApi();
  const uid = useUid();
  const { matchId } = useParams();
  const { t } = useTranslation();

  const { setShowWithData } = useModal<string>("editEvent");

  useQuery(getRanking(uid));

  const [positionIdSelected, setPositionIdSelected] = useState<number>(0);

  const { data: match, isLoading } = useQuery(
    getMatch(uid, parseInt(matchId!)),
  );

  const matches = match?.events
    .reduce<Match[]>((acc, event) => {
      const lastMatch =
        acc.length > 0
          ? acc[acc.length - 1]
          : { ...match, scoreA: 0, scoreB: 0 };

      if (event.type == "Goal") {
        const teamA = findTeam({ positionId: match.positionIdA });

        const mode = event.teamId == teamA?.id ? "left" : "right";

        const m =
          mode == "left"
            ? { ...lastMatch, scoreA: lastMatch.scoreA + 1 }
            : { ...lastMatch, scoreB: lastMatch.scoreB + 1 };
        return [...acc, m];
      } else {
        return [...acc, lastMatch];
      }
    }, [])
    .reverse();

  const finalMatch = matches ? { ...matches[0], done: true } : undefined;

  const events = match ? [...match.events].reverse() : [];
  const teamA = findTeam({ positionId: match?.positionIdA })!;

  return (
    <Loading ready={!isLoading}>
      <CJoliStack
        gap={0}
        className={`${isXl ? "col-md-12" : isCastPage ? "col-md-10" : "col-md-8"} mx-auto mt-5`}
        data-testid="team"
      >
        <Container className="px-5 py-5">
          <Card className="p-4 mb-4">
            <Row>
              <Col className="d-flex justify-content-center align-items-center">
                <TeamName positionId={match?.positionIdA} hideFavorite xl />
              </Col>
              <Col>
                <Row>
                  <Col className="d-flex justify-content-center align-items-center">
                    <ScoreBage match={finalMatch!} mode="A" xl />
                    <h1>-</h1>
                    <ScoreBage match={finalMatch!} mode="B" xl />
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-center">
                    <span className="small text-muted">
                      <Clock className="me-1" />
                      {dayjs(match?.time).format("dddd LL LT")}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col className="d-flex justify-content-center align-items-center">
                <TeamName positionId={match?.positionIdB} hideFavorite xl />
              </Col>
            </Row>
          </Card>
          <div className="d-grid gap-2 p-4">
            <Button
              variant="secondary"
              onClick={() => setShowWithData(true, "Hello")}
            >
              Add Event
            </Button>
          </div>
          <CJoliTimeline>
            {events.map((event, i) => (
              <MatchEventCard
                key={event.id}
                event={event}
                match={matches![i]}
              />
            ))}
          </CJoliTimeline>
        </Container>
      </CJoliStack>
      <BasicModal id="editEvent" title="Edit Event" onSubmit={() => {}}>
        <CJoliTabs
          tabs={[
            { id: "goal", label: t("match.eventGoal", "Goal") },
            { id: "penalty", label: t("match.eventPenalty", "Penalty") },
            {
              id: "goalKeeper",
              label: t("match.eventGoalKeeper", "GoalKeeper"),
            },
          ]}
          onSelect={() => {}}
        >
          <>
            <Row>
              <Col className="d-flex">
                <Button
                  variant="outline-primary"
                  className="mx-3"
                  active={positionIdSelected == match?.positionIdA}
                  onClick={() => setPositionIdSelected(match?.positionIdA || 0)}
                >
                  <TeamName positionId={match?.positionIdA} hideFavorite />
                </Button>
                <Button
                  variant="outline-primary"
                  className="mx-3"
                  active={positionIdSelected == match?.positionIdB}
                  onClick={() => setPositionIdSelected(match?.positionIdB || 0)}
                >
                  <TeamName positionId={match?.positionIdB} hideFavorite />
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <PlayerSelect team={teamA} isClearable />
              </Col>
            </Row>
          </>
        </CJoliTabs>
      </BasicModal>
    </Loading>
  );
};

export default MatchPage;
