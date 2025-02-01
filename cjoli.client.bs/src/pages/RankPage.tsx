import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { Card } from "react-bootstrap";
import { useEffect } from "react";
import useUid from "../hooks/useUid";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";
import { useServer } from "../hooks/useServer";
import { useApi } from "../hooks/useApi";
import { useCJoli } from "../hooks/useCJoli";
import CJoliTabs from "../components/CJoliTabs";
import { useNavigate, useParams } from "react-router-dom";
import RankTableTourney from "./rank/RankTableTourney";
import RankTableUser from "./rank/RankTableUser";
import TimeLineTourney from "./rank/TimeLineTourney";
import TimeLineUser from "./rank/TimeLineUser";

const RankPage = () => {
  useCJoli("ranking");
  const { register, path } = useServer();
  const { getRanking } = useApi();
  const navigate = useNavigate();
  const { mode } = useParams();
  const uid = useUid();

  const { isLoading, refetch } = useQuery(getRanking(uid));

  useEffect(() => {
    register("updateRanking", async () => {
      refetch();
    });
  }, [register, refetch]);

  return (
    <Loading ready={!isLoading}>
      <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
        <CJoliTabs
          tabs={[
            { id: "tourney", label: "Tourney" },
            { id: "users", label: "Users" },
          ]}
          onSelect={(key) => navigate(`${path}ranking/${key}`)}
          defaultKey={mode}
        />
        {mode == "users" ? <RankTableUser /> : <RankTableTourney />}
        <div className="p-2">
          <CJoliCard>
            <Card.Body>
              {mode == "users" ? <TimeLineUser /> : <TimeLineTourney />}
            </Card.Body>
          </CJoliCard>
        </div>
      </CJoliStack>
    </Loading>
  );
};

export default RankPage;
