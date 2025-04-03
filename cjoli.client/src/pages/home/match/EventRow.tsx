import dayjs from "dayjs";
import { EventPhase } from "../../../models";
import TeamName from "../../../components/TeamName";
import useScreenSize from "../../../hooks/useScreenSize";
import { Col, Row, Stack } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TeamSelect from "../../../components/TeamSelect";
import { useCJoli } from "../../../hooks/useCJoli";
import ScoreButton from "./ScoreButton";
import { useState } from "react";
import { useMatch } from "../../../hooks/useMatch";
import useUid from "../../../hooks/useUid";
import { useUser } from "../../../hooks/useUser";

interface EventRowProps {
  event: EventPhase;
  hasLocation: boolean;
  modeCast?: boolean;
}
// eslint-disable-next-line complexity
const EventRow = ({ event, hasLocation, modeCast }: EventRowProps) => {
  const { teams } = useCJoli();
  const { t } = useTranslation();
  const uid = useUid();
  const { updateEvent } = useMatch(uid);

  const extra = event.positionIds.map((positionId) => (
    <TeamName key={positionId} positionId={positionId} hideFavorite />
  ));
  const { isMobile } = useScreenSize();
  const { isAdmin } = useUser();
  const time = dayjs(event.time).format("LT");

  const label =
    event.eventType == "Resurfacing"
      ? t("event.resurfacing", "🚛 Resurfacing")
      : event.name;
  const content =
    extra.length != 0 ? (
      <>
        {label} - {extra}
      </>
    ) : (
      label
    );

  const datas: {
    first?: number;
    second?: number;
    third?: number;
    done: boolean;
  } = event.datas ? JSON.parse(event.datas) : { done: false };

  const [selected, setSelected] = useState(datas);

  const editMode = isAdmin && !datas.done && !modeCast;

  let competition = null;
  if (event.eventType == "Competition") {
    competition = (
      <>
        <Row>
          <Col xs={12} md={4} className="mt-2">
            <span>🥇</span>
            {editMode && (
              <TeamSelect
                value={selected.first}
                teams={teams ?? []}
                onChangeTeam={(team) =>
                  setSelected({ ...selected, first: team?.id })
                }
              />
            )}
            {!editMode && <TeamName teamId={datas.first!} hideFavorite />}
          </Col>
          <Col xs={12} md={4} className="mt-2">
            <span>🥈</span>
            {editMode && (
              <TeamSelect
                value={selected.second}
                teams={teams ?? []}
                onChangeTeam={(team) =>
                  setSelected({ ...selected, second: team?.id })
                }
              />
            )}
            {!editMode && <TeamName teamId={datas.second!} hideFavorite />}
          </Col>
          <Col xs={12} md={4} className="mt-2">
            <span>🥉</span>
            {editMode && (
              <TeamSelect
                value={selected.third}
                teams={teams ?? []}
                onChangeTeam={(team) =>
                  setSelected({ ...selected, third: team?.id })
                }
              />
            )}
            {!editMode && <TeamName teamId={datas.third!} hideFavorite />}
          </Col>
        </Row>
        {isAdmin && !modeCast && (
          <Row className="mt-2">
            <Col xs={{ offset: 10 }}>
              {!datas.done && (
                <ScoreButton
                  action="save"
                  id={`event-${event.id}`}
                  onClick={async () =>
                    updateEvent(event, { ...selected, done: true })
                  }
                />
              )}
              {datas.done && (
                <ScoreButton
                  action="remove"
                  id={`event-${event.id}`}
                  onClick={async () =>
                    updateEvent(event, {
                      first: 0,
                      second: 0,
                      third: 0,
                      done: false,
                    })
                  }
                />
              )}
            </Col>
          </Row>
        )}
      </>
    );
  }

  return (
    <tr>
      {!isMobile && (
        <>
          <td>{time}</td>
          <td colSpan={hasLocation ? 5 : 4}>
            <Stack>
              <div>{content}</div>
              {competition}
            </Stack>
          </td>
        </>
      )}
      {isMobile && (
        <td colSpan={2}>
          <Row>
            <Col>
              {time} {label}
            </Col>
          </Row>
          {event.positionIds.map((positionId) => (
            <Row key={positionId}>
              <Col>
                <TeamName positionId={positionId} hideFavorite />
              </Col>
            </Row>
          ))}
          {competition}
        </td>
      )}
    </tr>
  );
};

export default EventRow;
