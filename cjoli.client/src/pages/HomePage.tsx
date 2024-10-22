import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import TeamStack from "./home/TeamStack";
//import SummaryStack from "./home/SummaryStack";
import { useQuery } from "@tanstack/react-query";
import { useServer } from "../hooks/useServer";
import { useEffect } from "react";

const HomePage = () => {
  const { loadRanking, phases } = useCJoli();
  const { sendMessage, register } = useServer();
  const uid = useUid();
  const { phaseId, teamId } = useParams();

  const { isLoading, refetch } = useQuery({
    queryKey: ["getRanking", uid],
    queryFn: async () => {
      sendMessage({ type: "selectTourney", uid });
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
      return ranking;
    },
  });

  useEffect(() => {
    register("updateRanking", async () => {
      refetch();
    });
  }, [refetch, register]);

  let phase =
    phases && phases.find((p) => phaseId && p.id == parseInt(phaseId));
  if (!phase && phases && phases?.length > 0) {
    phase = phases[0];
  }
  return (
    <Loading ready={!isLoading}>
      {teamId && <TeamStack />}
      {/*!teamId && <SummaryStack />*/}
      <RankingStack phase={phase} />
      {phase && <MatchesStack phase={phase} />}
    </Loading>
  );
};

export default HomePage;
