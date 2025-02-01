import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import TeamStack from "./home/TeamStack";
import { useQuery } from "@tanstack/react-query";
import { useServer } from "../hooks/useServer";
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import RankingMatchesStack from "./team/RankingMatchesStack";

const TeamPage = () => {
  const { phases, isTeamInPhase, getTeam } = useCJoli("team");
  const { sendMessage, register } = useServer();
  const { getRanking } = useApi();
  const uid = useUid();
  const { teamId } = useParams();
  const [loading, setLoading] = useState(true);

  const team = teamId && getTeam(parseInt(teamId));

  const { refetch, isFetching } = useQuery(getRanking(uid));

  useEffect(() => {
    !isFetching && sendMessage({ type: "selectTourney", uid });
    !isFetching && setLoading(false);
  }, [uid, isFetching, sendMessage]);

  useEffect(() => {
    register("updateRanking", async () => {
      refetch();
    });
  }, [refetch, register]);

  if (!team) {
    return <></>;
  }
  return (
    <Loading ready={!loading}>
      <TeamStack />
      {phases
        ?.filter((phase) => isTeamInPhase(team.id, phase))
        .map((phase) => (
          <RankingMatchesStack key={phase.id} phase={phase} team={team} />
        ))}
    </Loading>
  );
};

export default TeamPage;
