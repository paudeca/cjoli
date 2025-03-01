import dayjs from "dayjs";
import { EventPhase } from "../../../models";
import TeamName from "../../../components/TeamName";
import useScreenSize from "../../../hooks/useScreenSize";
import { Col, Row } from "react-bootstrap";

interface EventRowProps {
  event: EventPhase;
}
const EventRow = ({ event }: EventRowProps) => {
  const extra = event.positionIds.map((positionId) => (
    <TeamName key={positionId} positionId={positionId} hideFavorite />
  ));
  const { isMobile } = useScreenSize();
  const time = dayjs(event.time).format("LT");
  const content =
    extra.length != 0 ? (
      <>
        {event.name} - {extra}
      </>
    ) : (
      event.name
    );
  return (
    <tr>
      {!isMobile && (
        <>
          <td>{time}</td>
          <td colSpan={5}>{content}</td>
        </>
      )}
      {isMobile && (
        <td colSpan={2}>
          <Row>
            <Col>
              {time} {event.name}
            </Col>
          </Row>
          {event.positionIds.map((positionId) => (
            <Row key={positionId}>
              <Col>
                <TeamName positionId={positionId} hideFavorite />
              </Col>
            </Row>
          ))}
        </td>
      )}
    </tr>
  );
};

export default EventRow;
