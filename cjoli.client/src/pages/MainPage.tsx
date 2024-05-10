import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer, Toast } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import MenuNav from "./MenuNav";
import React from "react";
import { useToast } from "../contexts/ToastContext";
import * as cjoliService from "../services/cjoliService";
import { useUser } from "../hooks/useUser";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import ChatButton from "./home/ChatButton";

const MainPage = () => {
  const { loadUser } = useUser();
  const [ready, setReady] = React.useState(false);
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const { loadTourneys, selectTourney } = useCJoli();
  const uid = useUid();

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
      <ChatButton />
      <ToastContainer position="top-end">
        <Toast onClose={hideToast} show={show} delay={5000} autohide bg={type}>
          <Toast.Header>
            <strong className="me-auto">Message</strong>
          </Toast.Header>
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Loading>
  );
};

export default MainPage;
