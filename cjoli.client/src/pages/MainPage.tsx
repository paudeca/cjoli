import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer, Toast, Stack } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import MenuNav from "./menu/MenuNav";
import { useEffect } from "react";
import * as cjoliService from "../services/cjoliService";
import { useUser } from "../hooks/useUser";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import ChatButton from "../components/ChatButton";
import EstimateButton from "../components/EstimateButton";
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

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const MainPage = () => {
  const { loadUser, isConnected } = useUser();
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const { loadTourneys, selectTourney } = useCJoli();
  const uid = useUid();
  const { pathname } = useLocation();
  const { isMobile } = useScreenSize();
  const isOnChat = pathname.endsWith("chat");
  const { i18n } = useTranslation();
  const { setCountUser } = useUser();
  const { register } = useServer();

  useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const user = await cjoliService.getUser();
      loadUser(user);
      return user;
    },
  });

  const { isLoading } = useQuery({
    queryKey: ["getTourneys", uid],
    queryFn: async () => {
      const tourneys = await cjoliService.getTourneys();
      loadTourneys(tourneys);
      uid && tourneys && selectTourney(tourneys.find((t) => t.uid === uid)!);
      return tourneys;
    },
  });

  useEffect(() => {
    register("users", (value) => {
      setCountUser(value);
    });
  }, [register, setCountUser]);

  dayjs.locale(i18n.resolvedLanguage);

  return (
    <Loading ready={!isLoading}>
      <MenuNav />
      <Outlet />
      <ButtonFixed>
        <Stack gap={1}>
          {uid && !isOnChat && isMobile && isConnected && <EstimateButton />}
          {uid && !isOnChat && <ChatButton />}
        </Stack>
      </ButtonFixed>
      <ToastContainer position="top-end">
        <Toast onClose={hideToast} show={show} delay={5000} autohide bg={type}>
          <Toast.Header>
            <strong className="me-auto">
              <Trans i18nKey="message">Message</Trans>
            </strong>
          </Toast.Header>
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Loading>
  );
};

export default MainPage;
