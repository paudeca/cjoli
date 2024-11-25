import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer, Toast, Stack } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import MenuNav from "./menu/MenuNav";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import ChatButton from "./home/button/ChatButton";
import EstimateButton from "./home/button/EstimateButton";
import ButtonFixed from "../components/ButtonFixed";
import useScreenSize from "../hooks/useScreenSize";
import { useToast } from "../hooks/useToast";
import { Trans, useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import { useServer } from "../hooks/useServer";
import { useApi } from "../hooks/useApi";
import ScrollButton from "./home/button/ScrollButton";
import { Match } from "../models";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import { Global, ThemeProvider } from "@emotion/react";
import { useLogger } from "../hooks/useLogger";
import { useGlobal } from "../styles";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

let init = false;

const MainPage = () => {
  const { isConnected } = useUser();
  const logger = useLogger();
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const {
    selectTourney,
    matches,
    theme: { primary, secondary },
    teams,
    setColor,
    isHomePage,
    daySelected,
  } = useCJoli();
  const uid = useUid();
  const { pathname } = useLocation();
  const { isMobile } = useScreenSize();
  const isOnChat = pathname.endsWith("chat");
  const { i18n } = useTranslation();
  const { setCountUser, userConfig } = useUser();
  const { register } = useServer();
  const { getUser, getTourneys } = useApi();
  const location = useLocation();

  const theme = {
    colors: {
      primary,
      secondary,
    },
  };

  useQuery(getUser());

  const { isLoading, data: tourneys } = useQuery(getTourneys({}));

  useEffect(() => {
    uid && tourneys && selectTourney(tourneys.find((t) => t.uid === uid)!);
  }, [uid, tourneys, selectTourney]);

  useEffect(() => {
    register("users", (value) => {
      setCountUser(value);
    });
  }, [register, setCountUser]);

  useEffect(() => {
    const team = teams?.find((t) => t.id == userConfig.favoriteTeamId);
    if (team) {
      setColor(
        team.datas?.primaryColor ?? team.primaryColor ?? "#202644",
        team.datas?.secondaryColor ?? team.secondaryColor ?? "#932829"
      );
    }
  }, [teams, userConfig, setColor]);

  useEffect(() => {
    if (!init) {
      logger.info("Start Application CJoli");
      init = true;
    }
  }, [logger]);

  dayjs.locale(i18n.resolvedLanguage);

  const [nextMatch, setNextMatch] = useState<Match>();
  useEffect(() => {
    const filtered = matches.filter(
      (m) => !m.done && dayjs(m.time).format("YYYY-MM-DD") == daySelected
    );
    filtered.sort((a, b) => (a.time < b.time ? -1 : 1));
    if (filtered.length > 0) {
      const nextMatch = filtered[0];
      setNextMatch(nextMatch);
    } else {
      setNextMatch(undefined);
    }
  }, [matches, nextMatch, daySelected]);

  useEffect(() => {
    logger.info("Navigation", location.pathname);
  }, [location.pathname, logger]);

  const style = useGlobal(theme);

  return (
    <ThemeProvider theme={theme}>
      <Global styles={style} />
      <Loading ready={!isLoading}>
        <MenuNav />
        <Outlet />
        <ButtonFixed>
          <Stack gap={1}>
            {uid && !isOnChat && isMobile && isConnected && <EstimateButton />}
            {isHomePage && (
              <ScrollButton to="ranking" icon={<ArrowUp />} down={false} />
            )}
            {nextMatch && (
              <ScrollButton
                to={`match-${nextMatch.id}`}
                icon={<ArrowDown />}
                down
              />
            )}
            {uid && !isOnChat && <ChatButton />}
          </Stack>
        </ButtonFixed>
        <ToastContainer position="top-end" className="position-fixed">
          <Toast
            onClose={hideToast}
            show={show}
            delay={5000}
            autohide
            bg={type}
          >
            <Toast.Header>
              <strong className="me-auto">
                <Trans i18nKey="message">Message</Trans>
              </strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Loading>
    </ThemeProvider>
  );
};

export default MainPage;
