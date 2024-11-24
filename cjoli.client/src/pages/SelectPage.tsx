import { Button, Card, Col, Container, Row } from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { useCJoli } from "../hooks/useCJoli";
import dayjs from "dayjs";
import { Clock, ClockHistory, PlusLg } from "react-bootstrap-icons";
import { Tourney } from "../models";
import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import TourneyCard from "./select/TourneyCard";
import { useUser } from "../hooks/useUser";
import AddItemModal from "../modals/AddItemModal";
import { useModal } from "../hooks/useModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { useApi } from "../hooks/useApi";

const MySpinner = styled("div")`
  width: 18px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(farthest-side, #ed303c 94%, #0000),
    radial-gradient(farthest-side, #3b8183 94%, #0000),
    radial-gradient(farthest-side, #fad089 94%, #0000),
    radial-gradient(farthest-side, #ff9c5b 94%, #0000), #ed303c;
  background-size: 105% 105%;
  background-repeat: no-repeat;
  animation: l5 2s infinite;
  @keyframes l5 {
    0% {
      background-position: 50% -50px, -40px 50%, 50% calc(100% + 50px),
        calc(100% + 50px) 50%;
    }
    20%,
    25% {
      background-position: 50% -50px, -50px 50%, 50% calc(100% + 50px), 50% 50%;
    }
    45%,
    50% {
      background-position: 50% -50px, -50px 50%, 50% 50%, 50% 50%;
    }
    75%,
    75% {
      background-position: 50% -50px, 50% 50%, 50% 50%, 50% 50%;
    }
    95%,
    100% {
      background-position: 50% 50%, 50% 50%, 50% 50%, 50% 50%;
    }
  }
`;

const Title = ({ title, icon }: { title: string; icon: React.ReactNode }) => {
  return (
    <h4
      className="display-4"
      style={{ fontSize: 24, display: "flex", alignItems: "baseline" }}
    >
      <span className="mx-1">{icon}</span>
      {title}
    </h4>
  );
};

const SelectPage = () => {
  const { tourneys } = useCJoli("welcome");
  const { t } = useTranslation();
  const { isAdmin } = useUser();
  const { setShow: showAddTourney } = useModal("addTourney");
  const { getTourneys, saveTourney } = useApi();

  const { mutate: addTourney, isSuccess } = useMutation(saveTourney({}));
  useQuery(getTourneys({ enabled: isSuccess }));

  const now = dayjs();

  const groups = useMemo(() => {
    const init: {
      type: "live" | "coming" | "past";
      title: string;
      icon: React.ReactNode;
      tourneys: Tourney[];
    }[] = [
      {
        type: "live",
        title: t("select.live", "Live"),
        icon: <MySpinner />,
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
    return (tourneys ?? []).reduce((acc, t) => {
      const index =
        now > dayjs(t.endTime) ? 2 : now < dayjs(t.startTime) ? 1 : 0;
      acc[index].tourneys = [...acc[index].tourneys, t];
      return acc;
    }, init);
  }, [t, now, tourneys]);

  //invert order tourney in future
  groups[1].tourneys.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Body>
            <Container>
              {groups
                .filter((group) => group.tourneys.length > 0)
                .map((group, i) => (
                  <React.Fragment key={i}>
                    <Title title={group.title} icon={group.icon} />
                    <Row>
                      {group.tourneys.map((tourney) => (
                        <TourneyCard
                          key={tourney.id}
                          tourney={tourney}
                          isLive={group.type != "live"}
                        />
                      ))}
                    </Row>
                  </React.Fragment>
                ))}
              {isAdmin && (
                <Row>
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => showAddTourney(true)}
                    >
                      <PlusLg />{" "}
                      <Trans i18nKey="button.newTourney">New Tourney</Trans>
                    </Button>
                  </Col>
                </Row>
              )}
            </Container>
          </Card.Body>
        </CJoliCard>
      </div>
      <AddItemModal
        id="addTourney"
        title={t("select.addTourney", "Add Tourney")}
        fieldLabel="Id"
        onItemTeam={async (value) => {
          addTourney({ uid: value, name: value } as Tourney);
          return true;
        }}
      />
    </CJoliStack>
  );
};

export default SelectPage;
