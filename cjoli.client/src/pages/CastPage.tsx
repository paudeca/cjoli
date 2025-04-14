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
import { useRef } from "react";

interface CastPageProps {
  xl?: boolean;
}

const CastPage = ({ xl }: CastPageProps) => {
  const { gallery, phases, teams, tourney } = useCJoli(
    xl ? "fullcast" : "cast"
  );
  const { getGallery, getRanking } = useApi();
  const uid = useUid();
  const { isMobile } = useScreenSize();
  const { isXl } = useCJoli();

  const [teamId, setTeamId] = useState(0);
  const [teamIdB, setTeamIdB] = useState(0);
  const [images, setImages] = useState(gallery?.messages ?? []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (gallery) {
      const images = (gallery?.messages ?? [])
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      setImages(images);
    }
  }, [gallery]);

  useQuery({
    ...getRanking(uid),
    refetchInterval: 10000,
  });
  const { isLoading, refetch } = useQuery({
    ...getGallery(uid, 0, false, true),
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
                style={{
                  height: isMobile ? "inherit" : isXl ? "100vh" : "80vh",
                }}
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
                style={{
                  height: isMobile ? "inherit" : isXl ? "100vh" : "80vh",
                }}
              />
            ),
          });
        }
      }
      return acc;
    },
    [] as { type: TypePage; content: ReactNode }[]
  );

  const id = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    try {
      id.current = setInterval(() => {
        const height = screen.height;
        if (window.scrollY + height < document.body.scrollHeight) {
          window.scrollTo({
            top: window.scrollY + height - 250,
            behavior: "smooth",
          });
        } else {
          setIndex((index + 1) % items.length);
        }
      }, 5000);
    } catch (e) {
      console.error("excpetion in scroll down", e);
    }
    return () => {
      clearInterval(id.current);
    };
  }, [index, items.length]);

  return (
    <Loading ready={!isLoading}>
      <Container fluid>
        <Row>
          <Col>
            <Carousel
              fade={false}
              wrap
              slide={false}
              interval={null}
              activeIndex={index}
              onSelect={setIndex}
              pause={false}
              onSlide={(eventKey) => {
                window.scrollTo({ top: 0, behavior: "instant" });
                if (items[eventKey] && items[eventKey].type == "match") {
                  if (teams) {
                    const team =
                      teams[Math.floor(Math.random() * teams.length)];
                    setTeamId(team.id);
                    const teamFilter = teams.filter((t) => t.id != team.id);
                    const teamB =
                      teamFilter[Math.floor(Math.random() * teamFilter.length)];
                    setTeamIdB(teamB.id);
                    refetch();
                  }
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
