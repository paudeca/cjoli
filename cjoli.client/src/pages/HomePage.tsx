import "bootstrap/dist/css/bootstrap.min.css";
import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import { useCJoli } from "../contexts/CJoliContext";
import { ToastProvider, useToast } from "../contexts/ToastContext";
import MenuNav from "./MenuNav";
import { ToastContainer, Toast, ProgressBar } from "react-bootstrap";
import Loading from "../components/Loading";
import { useLocation } from "react-router-dom";

const HomePage = () => {
  const {
    loadUser,
    loadRanking,
    state: { phases },
  } = useCJoli();
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const call = async () => {
      const user = await cjoliService.getUser();
      loadUser(user);
      const ranking = await cjoliService.getRanking();
      loadRanking(ranking);
      setReady(true);
    };
    call();
  }, [loadRanking, loadUser]);

  const { hash } = useLocation();
  let phase = phases && phases.find((p) => `#${p.id}` == hash);
  if (!phase && phases && phases?.length > 0) {
    phase = phases[0];
  }

  return (
    <Loading ready={ready}>
      <MenuNav />
      <RankingStack phase={phase} />
      <MatchesStack phase={phase} />
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

export default () => (
  <ToastProvider>
    <HomePage />
  </ToastProvider>
);
