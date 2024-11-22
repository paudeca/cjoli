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
import { css, Global, ThemeProvider } from "@emotion/react";
import { useColor } from "../hooks/useColor";
import { useLogger } from "../hooks/useLogger";

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
  const { lightness, isWhite } = useColor();
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

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            background-color: ${theme.colors.primary};
            color: white;
            uuser-select: none;
          }
          input::placeholder {
            opacity: 0.5 !important;
          }
          span.badge.bg-secondary.menu {
            background-color: grey !important;
            opacity: 0.5;
          }
          .btn-primary {
            --bs-btn-bg: ${lightness(primary, 10)};
            --bs-btn-border-color: ${isWhite(primary)
              ? "black"
              : lightness(primary, 10)};
            --bs-btn-hover-bg: ${lightness(
              primary,
              isWhite(primary) ? -5 : 20
            )};
            --bs-btn-hover-border-color: ${isWhite(primary)
              ? "black"
              : lightness(primary, 20)};
            --bs-btn-active-bg: ${lightness(
              primary,
              isWhite(primary) ? -10 : 30
            )};
            --bs-btn-active-border-color: ${isWhite(primary)
              ? "black"
              : lightness(primary, 30)};
            --bs-btn-disabled-bg: ${lightness(primary, 10)};
            --bs-btn-color: ${isWhite(primary) ? "black" : "white"};
            --bs-btn-hover-color: ${isWhite(primary) ? "black" : "white"};
            --bs-btn-active-color: ${isWhite(primary) ? "black" : "white"};
            --bs-btn-disabled-color: ${isWhite(primary) ? "black" : "white"};
          }
          .progress {
            --bs-progress-bar-bg: ${theme.colors.secondary};
          }
          .accordion-button {
            --bs-accordion-active-bg: ${theme.colors.secondary};
            &:not(collapsed),
            &:not(collapsed)::after {
              --bs-accordion-active-color: white;
              --bs-body-color: white;
            }
          }
          .bg-secondary {
            --bs-bg-opacity: 1;
            --bs-secondary-rgb: 120, 129, 169;
          }
          .form-check-input:checked {
            background-color: ${lightness(
              primary,
              isWhite(primary) ? -50 : 10
            )};
            border-color: ${lightness(primary, isWhite(primary) ? -50 : 10)};
          }

          .nav-pills {
            --bs-nav-pills-link-active-bg: ${theme.colors.primary};
          }

          .popover {
            --bs-popover-max-width: 800px;
          }

          .chat-messages {
            display: flex;
            flex-direction: column;
            max-height: 800px;
            overflow-y: scroll;
          }

          .chat-message-left,
          .chat-message-right {
            display: flex;
            flex-shrink: 0;
          }

          .chat-message-left {
            margin-right: auto;
          }

          .chat-message-right {
            flex-direction: row-reverse;
            margin-left: auto;
          }
        `}
      />
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
