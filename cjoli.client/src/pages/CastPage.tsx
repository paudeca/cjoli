import { Carousel, Col, Container, Row } from "react-bootstrap";
import { useCJoli } from "../hooks/useCJoli";
import { useApi } from "../hooks/useApi";
import useUid from "../hooks/useUid";
import { ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import useScreenSize from "../hooks/useScreenSize";
import TeamStack from "./home/TeamStack";

let idleTime = 0;

const CastPage = () => {
  const { gallery, phases, teams, tourney } = useCJoli("cast");
  const { getGallery, getRanking } = useApi();
  const uid = useUid();
  const { isMobile } = useScreenSize();

  const [teamId, setTeamId] = useState(0);
  const [teamIdB, setTeamIdB] = useState(0);
  const [images, setImages] = useState(gallery?.messages ?? []);
  useEffect(() => {
    if (gallery) {
      const images = (gallery?.messages ?? [])
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      setImages(images);
    }
  }, [gallery]);

  useEffect(() => {
    return () => {
      clearTimeout(idleTime);
    };
  }, []);

  useQuery({
    ...getRanking(uid),
    refetchInterval: 10000,
  });
  const { isLoading } = useQuery({
    ...getGallery(uid, 0, false, true),
    refetchInterval: 10000 * (phases ?? [{}]).length,
  });

  type TypePage = "ranking" | "match" | "team" | "image" | "qrcode";

  const items: { type: TypePage; content: ReactNode }[] = (phases ?? []).reduce(
    (acc, p, i) => {
      acc.push({
        type: "ranking",
        content: <RankingStack phase={p} modeCast />,
      });
      acc.push({ type: "match", content: <MatchesStack phase={p} modeCast /> });
      acc.push({
        type: "team",
        content: <TeamStack teamId={teamId} teamIdB={teamIdB} modeCast />,
      });
      const m = images[i];
      if (m) {
        acc.push({
          type: "image",
          content: (
            <div className="ratioo ratioo-1x1">
              <img
                src={m.mediaUrl}
                className="img-fluid mx-auto d-block"
                style={{ height: isMobile ? "inherit" : "80vh" }}
              />
            </div>
          ),
        });
        if (i == 0 && tourney?.whatsappNumber) {
          acc.push({
            type: "qrcode",
            content: (
              <img
                src={`/qrcodes/${uid}.png`}
                className="img-fluid mx-auto d-block"
                style={{ height: isMobile ? "inherit" : "80vh" }}
              />
            ),
          });
        }
      }
      return acc;
    },
    [] as { type: TypePage; content: ReactNode }[]
  );

  const scrollDown = (delay: number) => {
    idleTime = window.setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + screen.height,
        behavior: "smooth",
      });
      if (window.scrollY + screen.height < document.body.scrollHeight) {
        scrollDown(delay);
      }
    }, delay);
  };

  return (
    <Loading ready={!isLoading}>
      <Container fluid>
        <Row>
          <Col>
            <Carousel
              fade={false}
              wrap
              slide={false}
              interval={10000}
              pause={false}
              onSlide={(eventKey) => {
                if (idleTime) {
                  clearTimeout(idleTime);
                }
                if (items[eventKey].type == "match") {
                  if (teams) {
                    const team =
                      teams[Math.floor(Math.random() * teams.length)];
                    setTeamId(team.id);
                    const teamFilter = teams.filter((t) => t.id != team.id);
                    const teamB =
                      teamFilter[Math.floor(Math.random() * teamFilter.length)];
                    setTeamIdB(teamB.id);
                  }
                }
                window.scrollTo({
                  top: 0,
                });
                const pages = Math.floor(
                  document.body.scrollHeight / screen.height
                );
                if (pages > 0) {
                  scrollDown(10000 / (pages + 1));
                }
              }}
              onSlid={() => {}}
            >
              {items?.map((item, i) => (
                <Carousel.Item key={i}>{item.content}</Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>
      </Container>
    </Loading>
  );
};

export default CastPage;
