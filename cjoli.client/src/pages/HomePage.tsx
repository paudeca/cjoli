import "bootstrap/dist/css/bootstrap.min.css";
import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import { useCJoli } from "../contexts/CJoliContext";

const HomePage = () => {
  const { loadRanking } = useCJoli();
  React.useEffect(() => {
    const call = async () => {
      const ranking = await cjoliService.getRanking();
      loadRanking(ranking);
    };
    call();
  }, [loadRanking]);
  return (
    <>
      <RankingStack />
      <MatchesStack />
    </>
  );
};

export default HomePage;
