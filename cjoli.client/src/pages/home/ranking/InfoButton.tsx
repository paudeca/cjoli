import styled from "@emotion/styled";
import { Overlay, Popover, Button, ListGroup, Row, Col } from "react-bootstrap";
import {
  CaretDownFill,
  CaretUpFill,
  InfoCircle,
  ViewStacked,
} from "react-bootstrap-icons";
import { Fragment, ReactNode, useRef, useState } from "react";
import { Score, ScoreSource, Squad } from "../../../models";
import { Trans } from "react-i18next";
import { useCJoli } from "../../../hooks/useCJoli";

const MyButton = styled(InfoCircle)`
  color: #bbb;
  &:hover {
    color: black;
  }
`;

interface InfoButtonProps {
  score: Score;
  squad: Squad;
}

const InfoButton = ({ score, squad }: InfoButtonProps) => {
  const { getTeamInfo, tourney, getIndexScoreFromPosition } = useCJoli();

  const { name, logo } = getTeamInfo(score.positionId);
  const [open, setOpen] = useState(false);
  const target = useRef(null);
  if (!tourney) {
    return <></>;
  }
  const {
    config: { win, neutral, loss },
  } = tourney;

  const details = [
    { label: "V", value: score.win, pts: win },
    { label: "N", value: score.neutral, pts: neutral },
    { label: "D", value: score.loss, pts: loss },
  ];
  let i = 0;
  const result = details.reduce((acc, d) => {
    if (d.value != 0 && d.pts != 0) {
      return [
        ...acc,
        <Fragment key={i++}>
          {acc.length > 0 && <> + </>}
          <b>{d.value}</b>
          {d.label} x <b>{d.pts}</b>
        </Fragment>,
      ];
    }
    return acc;
  }, [] as ReactNode[]);

  const sources = Object.keys(score.sources)
    .map((k) => ({ ...score.sources[parseInt(k)], positionId: parseInt(k) }))
    .filter((s) => s.type != "total");

  const getSourceValue = (source: ScoreSource) => {
    switch (source.type) {
      case "direct":
        return source.winner ? (
          <Col className="fw-bold">
            <Trans i18nKey="ranking.victory">Victory</Trans>
          </Col>
        ) : (
          <Col className="fw-bold">
            <Trans i18nKey="ranking.defeat">Defeat</Trans>
          </Col>
        );
    }
    return (
      <Col>
        <Trans
          i18nKey={`ranking.source.${source.type}${
            source.winner ? "" : "-min"
          }`}
        >
          {source.type}
        </Trans>{" "}
        : <span className="fw-bold">{source.value}</span>
      </Col>
    );
  };

  return (
    <>
      <div ref={target} className="d-flex">
        <MyButton
          role="button"
          size={18}
          className="mx-2"
          onClick={() => setOpen(!open)}
        />
      </div>
      <Overlay
        target={target.current}
        show={open}
        rootClose
        onHide={() => setOpen(false)}
        placement="left"
      >
        {(props) => (
          <Popover {...props}>
            <Popover.Header style={{ color: "black" }}>
              <img
                src={logo}
                style={{ maxWidth: "20px", maxHeight: "20px" }}
                className="mx-2"
              />
              {name}
            </Popover.Header>
            <Popover.Body>
              <ListGroup className="mb-3">
                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">
                      <Trans i18nKey={"ranking.rank"}>Rank</Trans>
                    </div>
                    {score.rank}
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">PTS</div>
                    {score.total}
                  </div>
                </ListGroup.Item>
                {score.total != 0 && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">
                        <Trans i18nKey="ranking.calculation">Calculation</Trans>
                      </div>
                      {result.map((r) => r)} = {score.total}
                    </div>
                  </ListGroup.Item>
                )}
                {sources.map((s) => {
                  const positionB = s.positionId;
                  const source = score.sources[positionB];
                  const infoB = getTeamInfo(positionB);
                  const scoreB = getIndexScoreFromPosition(positionB, squad.id);

                  return (
                    <ListGroup.Item
                      key={positionB}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">
                          <Trans i18nKey="ranking.equality">Equality</Trans>{" "}
                          {scoreB && score.rank == scoreB.rank && (
                            <ViewStacked className="mx-1" />
                          )}
                          {scoreB && score.rank < scoreB.rank && (
                            <CaretUpFill
                              color="rgb(25, 135, 84)"
                              className="mx-1"
                            />
                          )}
                          {scoreB && score.rank > scoreB.rank && (
                            <CaretDownFill
                              color="rgb(220, 53, 69)"
                              className="mx-1"
                            />
                          )}
                        </div>
                        <Row>
                          <Col>
                            <img
                              src={infoB.logo}
                              style={{ maxWidth: "20px", maxHeight: "20px" }}
                              className="mx-2"
                            />
                            {infoB.name}
                          </Col>
                        </Row>
                        <Row>{getSourceValue(source)}</Row>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              <Button onClick={() => setOpen(false)} size="sm">
                <Trans i18nKey="button.close">Close</Trans>
              </Button>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default InfoButton;