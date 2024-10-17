import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import TeamStack from "./home/TeamStack";

const HomePage = () => {
  const { loadRanking, phases } = useCJoli();
  const [ready, setReady] = React.useState(false);
  const uid = useUid();
  const { phaseId, teamId } = useParams();

  React.useEffect(() => {
    const call = async () => {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
      setReady(true);
    };
    call();
  }, [loadRanking, uid]);

  let phase =
    phases && phases.find((p) => phaseId && p.id == parseInt(phaseId));
  if (!phase && phases && phases?.length > 0) {
    phase = phases[0];
  }
  return (
    <Loading ready={ready}>
      {teamId && <TeamStack />} 
      <RankingStack phase={phase} />
      <MatchesStack phase={phase} />
    </Loading>
  );
};

export default HomePage;
