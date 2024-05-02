import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import Loading from "../components/Loading";
import { useLocation } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import { useUser } from "../hooks/useUser";
import useUid from "../hooks/useUid";

const HomePage = () => {
  const { loadRanking, phases } = useCJoli();
  const { loadUser } = useUser();
  const [ready, setReady] = React.useState(false);
  const uid = useUid();

  React.useEffect(() => {
    const call = async () => {
      const ranking = await cjoliService.getRanking(uid);
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
      <RankingStack phase={phase} />
      <MatchesStack phase={phase} />
    </Loading>
  );
};

export default HomePage;
