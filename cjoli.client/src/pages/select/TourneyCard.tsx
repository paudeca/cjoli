import { Card, Col, Row } from "react-bootstrap";
import { Tourney } from "../../models";
import { useCJoli } from "../../hooks/useCJoli";
import { useNavigate } from "react-router-dom";
import { useTools } from "../../hooks/useTools";
import styled from "@emotion/styled";
import dayjs from "dayjs";
import { memo } from "react";

const MyCard = styled(Card)`
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.02);
  }
`;

interface TourneyCardProps {
  tourney: Tourney;
  isLive: boolean;
}
const TourneyCard = ({ tourney, isLive }: TourneyCardProps) => {
  const { selectTourney } = useCJoli();
  const navigate = useNavigate();
  const { formatDate } = useTools();
  return (
    <Col
      lg="4"
      role="button"
      className="mb-3"
      onClick={() => {
        const uid = tourney.uid;
        selectTourney(tourney);
        navigate(uid);
      }}
    >
      <MyCard className="shadow">
        <Card.Title className="p-2">{tourney.name}</Card.Title>
        <Card.Subtitle className="ms-auto mx-2 fw-normal">
          {tourney.category}
        </Card.Subtitle>
        <Card.Subtitle className="ms-auto mx-2 fw-normal mb-1">
          {tourney.season}
        </Card.Subtitle>
        <Card.Body>
          <Row>
            <Col>
              <span className="mx-1">
                <span style={{ fontWeight: 500 }}>
                  {formatDate(tourney.startTime)}
                </span>
              </span>
              -
              <span className="mx-1">
                <span style={{ fontWeight: 500 }}>
                  {formatDate(tourney.endTime, { upper: false })}
                </span>
              </span>
            </Col>
          </Row>
          {isLive && (
            <Row>
              <Col lg="auto" className="ms-auto">
                {dayjs(tourney.startTime).fromNow()}
              </Col>
            </Row>
          )}
        </Card.Body>
      </MyCard>
    </Col>
  );
};

export const TourneyCardMemo = memo(TourneyCard);
export default TourneyCardMemo;
