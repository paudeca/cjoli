import { Card, Container, Row, Spinner } from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { useCJoli } from "../hooks/useCJoli";
import dayjs from "dayjs";
import { Clock, ClockHistory } from "react-bootstrap-icons";
import { Tourney } from "../models";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import TourneyCard from "./select/TourneyCard";

const Title = memo(
  ({ title, icon }: { title: string; icon: React.ReactNode }) => {
    return (
      <h4 className="display-4" style={{ fontSize: 24 }}>
        <span className="mx-1">{icon}</span>
        {title}
      </h4>
    );
  }
);

const SelectPage = () => {
  const { tourneys } = useCJoli();
  const { t } = useTranslation();

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
        icon: (
          <Spinner
            animation="grow"
            variant="danger"
            size="sm"
            className="mb-1"
          />
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
    return (tourneys ?? []).reduce((acc, t) => {
      const index =
        now > dayjs(t.endTime) ? 2 : now < dayjs(t.startTime) ? 1 : 0;
      acc[index].tourneys = [...acc[index].tourneys, t];
      return acc;
    }, init);
  }, [t, now, tourneys]);

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
            </Container>
          </Card.Body>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default SelectPage;
