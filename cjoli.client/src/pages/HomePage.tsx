import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { useCJoli } from "../hooks/useCJoli";
import useUid from "../hooks/useUid";
import TeamStack from "./home/TeamStack";
//import SummaryStack from "./home/SummaryStack";
import { useQuery } from "@tanstack/react-query";
import { useServer } from "../hooks/useServer";
import { useEffect, useState } from "react";
import CJoliStack from "../components/CJoliStack";
import CJoliCard from "../components/CJoliCard";
import { Alert } from "react-bootstrap";
import { Trans } from "react-i18next";
import { useApi } from "../hooks/useApi";

const HomePage = () => {
  const { phases } = useCJoli();
  const { sendMessage, register } = useServer();
  const { getRanking } = useApi();
  const uid = useUid();
  const { phaseId, teamId } = useParams();
  const [loading, setLoading] = useState(true);

  const { refetch, isFetching } = useQuery(getRanking(uid));

  useEffect(() => {
    !isFetching && sendMessage({ type: "selectTourney", uid });
    !isFetching && setLoading(false);
  }, [uid, isFetching, sendMessage]);

  useEffect(() => {
    register("updateRanking", async () => {
      refetch(); //disable, cause full refresh page on saveMatch
    });
  }, [refetch, register]);

  let phase =
    phases && phases.find((p) => phaseId && p.id == parseInt(phaseId));
  if (!phase && phases && phases?.length > 0) {
    phase = phases[0];
  }
  return (
    <Loading ready={!loading}>
      {teamId && <TeamStack />}
      {/*!teamId && <SummaryStack />*/}
      {phase && <RankingStack phase={phase} />}
      {phase && <MatchesStack phase={phase} />}
      {!phase && (
        <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
          <div className="p-2">
            <CJoliCard>
              <Alert variant="warning" className="mb-0">
                <Trans i18nKey="home.tourneyNotConfigured">
                  Tourney not configured
                </Trans>
              </Alert>
            </CJoliCard>
          </div>
        </CJoliStack>
      )}
    </Loading>
  );
};

export default HomePage;
