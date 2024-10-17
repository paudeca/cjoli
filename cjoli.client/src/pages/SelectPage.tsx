import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { useNavigate } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import moment from "moment";
import { useTools } from "../hooks/useTools";
import { Clock, ClockHistory, PlusLg } from "react-bootstrap-icons";
import { Tourney } from "../models";
import React from "react";
import styled from "@emotion/styled";
import { Trans, useTranslation } from "react-i18next";
import { useUser } from "../hooks/useUser";

const Title = ({ title, icon }: { title: string; icon: React.ReactNode }) => {
  return (
    <h4 className="display-4" style={{ fontSize: 24 }}>
      <span className="mx-1">{icon}</span>
      {title}
    </h4>
  );
};

const MyCard = styled(Card)`
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.02);
  }
`;

const SelectPage = () => {
  const navigate = useNavigate();
  const { tourneys, selectTourney } = useCJoli();
  const { formatDate } = useTools();
  const { t } = useTranslation();
  const {isAdmin} = useUser();

  const now = moment();

  let datas: {
    type: "live" | "coming" | "past";
    title: string;
    icon: React.ReactNode;
    tourneys: Tourney[];
  }[] = [
    {
      type: "live",
      title: t("select.live", "Live"),
      icon: (
        <Spinner animation="grow" variant="danger" size="sm" className="mb-1" />
      ),
      tourneys: [],
    },
    {
      type: "coming",
      title: t("select.coming", "Coming..."),
      icon: <Clock size="1rem" className="mb-2" />,
      tourneys: [],
    },
    {
      type: "past",
      title: t("select.past", "Past"),
      icon: <ClockHistory size="1rem" className="mb-2" />,
      tourneys: [],
    },
  ];
  datas = (tourneys ?? []).reduce((acc, t) => {
    const index =
      now > moment(t.endTime) ? 2 : now < moment(t.startTime) ? 1 : 0;
    acc[index].tourneys = [...acc[index].tourneys, t];
    return acc;
  }, datas);

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Body>
            <Container>
              {datas
                .filter((d) => d.tourneys.length > 0)
                .map((d, i) => (
                  <React.Fragment key={i}>
                    <Title title={d.title} icon={d.icon} />
                    <Row>
                      {d.tourneys.map((t) => (
                        <Col
                          key={t.id}
                          lg="auto"
                          role="button"
                          className="mb-3"
                          onClick={() => {
                            const uid = t.uid;
                            selectTourney(t);
                            navigate(uid);
                          }}
                        >
                          <MyCard className="shadow">
                            <Card.Title className="p-2">{t.name}</Card.Title>
                            <Card.Subtitle className="ms-auto mx-2 fw-normal">
                              {t.category}
                            </Card.Subtitle>
                            <Card.Subtitle className="ms-auto mx-2 fw-normal mb-1">
                              {t.season}
                            </Card.Subtitle>
                            <Card.Body>
                              <Row>
                                <Col>
                                  <span className="mx-1">
                                    <span style={{ fontWeight: 500 }}>
                                      {formatDate(t.startTime)}
                                    </span>
                                  </span>
                                  -
                                  <span className="mx-1">
                                    <span style={{ fontWeight: 500 }}>
                                      {formatDate(t.endTime, { upper: false })}
                                    </span>
                                  </span>
                                </Col>
                              </Row>
                              {d.type != "live" && (
                                <Row>
                                  <Col lg="auto" className="ms-auto">
                                    {moment(t.startTime).fromNow()}
                                  </Col>
                                </Row>
                              )}
                            </Card.Body>
                          </MyCard>
                        </Col>
                      ))}
                    </Row>
                  </React.Fragment>
                ))}
                {isAdmin && <Row>
                  <Col><Button variant="primary"><PlusLg /> <Trans i18nKey="button.newTourney">New Tourney</Trans></Button></Col>
                </Row>}
            </Container>
          </Card.Body>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default SelectPage;
