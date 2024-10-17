import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer, Toast, Stack } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import MenuNav from "./menu/MenuNav";
import React from "react";
import * as cjoliService from "../services/cjoliService";
import { useUser } from "../hooks/useUser";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import ChatButton from "../components/ChatButton";
import EstimateButton from "../components/EstimateButton";
import ButtonFixed from "../components/ButtonFixed";
import useScreenSize from "../hooks/useScreenSize";
import { useToast } from "../hooks/useToast";
import { Trans } from "react-i18next";

const MainPage = () => {
  const { loadUser, isConnected } = useUser();
  const [ready, setReady] = React.useState(false);
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const { loadTourneys, selectTourney } = useCJoli();
  const uid = useUid();
  const { pathname } = useLocation();
  const { isMobile } = useScreenSize();
  const isOnChat = pathname.endsWith("chat");

  React.useEffect(() => {
    const call = async () => {
      const user = await cjoliService.getUser();
      loadUser(user);
      setReady(true);

      const data = await cjoliService.getTourneys();
      loadTourneys(data);
      uid && selectTourney(data.find((t) => t.uid === uid)!);
    };
    call();
  }, [loadUser, loadTourneys, selectTourney, uid]);

  return (
    <Loading ready={ready}>
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
