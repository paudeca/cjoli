import "bootstrap/dist/css/bootstrap.min.css";
import RankingStack from "./home/RankingStack";
import MatchesStack from "./home/MatchesStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import { useCJoli } from "../contexts/CJoliContext";
import MenuNav from "./MenuNav";

const HomePage = () => {
  const { loadUser, loadRanking } = useCJoli();

  React.useEffect(() => {
    const call = async () => {
      const user = await cjoliService.getUser();
      loadUser(user);
      const ranking = await cjoliService.getRanking();
      loadRanking(ranking);
    };
    call();
  }, [loadRanking, loadUser]);
  return (
    <>
      <MenuNav />
      <RankingStack />
      <MatchesStack />
    </>
  );
};

export default HomePage;
