import "bootstrap/dist/css/bootstrap.min.css";
import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import { useCJoli } from "../contexts/CJoliContext";
import { ToastProvider, useToast } from "../contexts/ToastContext";
import MenuNav from "./MenuNav";
import { ToastContainer, Toast, ProgressBar } from "react-bootstrap";

const HomePage = () => {
  const { loadUser, loadRanking } = useCJoli();
  const {
    state: { show, type, message },
    hideToast,
  } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [random, setRandom] = React.useState([40, 20, 60, 80]);

  React.useEffect(() => {
    const call = async () => {
      const refresh = window.setInterval(() => {
        setRandom([Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100]);
      }, 1000);

      const user = await cjoliService.getUser();
      loadUser(user);
      const ranking = await cjoliService.getRanking();
      loadRanking(ranking);
      setLoading(true);
      clearInterval(refresh);
    };
    call();
  }, [loadRanking, loadUser]);
  return (
    <>
      {!loading && (
        <div className='pt-4'>
          <ProgressBar variant='success' now={random[0]} />
          <ProgressBar variant='info' now={random[1]} />
          <ProgressBar variant='warning' now={random[2]} />
          <ProgressBar variant='danger' now={random[3]} />
        </div>
      )}

      {loading && (
        <>
          <MenuNav />
          <RankingStack />
          <MatchesStack />
        </>
      )}
      <ToastContainer position='top-end'>
        <Toast onClose={hideToast} show={show} delay={5000} autohide bg={type}>
          <Toast.Header>
            <strong className='me-auto'>Message</strong>
          </Toast.Header>
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default () => (
  <ToastProvider>
    <HomePage />
  </ToastProvider>
);
