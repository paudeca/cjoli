import { useTranslation } from "react-i18next";
import { useCJoli } from "../../hooks/useCJoli";
import { useCallback } from "react";
import RankTable from "./RankTable";
import { BetScore } from "../../models/BetScore";
import { User } from "../../models";
import { useUser } from "../../hooks/useUser";
import { Robot } from "react-bootstrap-icons";

const useColumnsTourney = () => {
  const { ranking, getTeam, getTeamLogo } = useCJoli();
  const { t } = useTranslation();
  const { findConfig } = useUser();

  const formatRank = useCallback((order: number) => {
    switch (order) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return order;
    }
  }, []);

  const users: Record<number, User> = ranking!.scores.bet.users.reduce(
    (acc, u) => ({ ...acc, [u.id]: u }),
    {}
  );

  const getUserLabel = (userId: number) => {
    const user = users[userId];
    if (!user) {
      return (
        <span>
          <Robot className="mx-2" size={20} />
          Bot
        </span>
      );
    }
    const config = findConfig(user);
    const team = getTeam(config.favoriteTeamId);
    return (
      <span>
        <img
          src={getTeamLogo(team)}
          style={{ maxWidth: "30px", maxHeight: "30px" }}
          className="mx-2"
        />
        {user.login}
      </span>
    );
  };

  const columns = [
    {
      id: "rank",
      label: "#",
      value: (_score: BetScore, index: number) => formatRank(index + 1),
      width: "10%",
    },
    {
      id: "user",
      label: t("rank.users", "Users"),
      value: (score: BetScore) => getUserLabel(score.userId),
      width: "30%",
    },
    {
      id: "score",
      label: t("rank.score", "Score"),
      value: (score: BetScore) => score.score,
      focus: true,
      width: "20%",
    },
  ];
  const datas = ranking?.scores.bet.scores ?? [];
  return { columns, datas };
};

const RankTableUser = () => {
  const { columns, datas } = useColumnsTourney();

  return <RankTable<BetScore> columns={columns} datas={datas} />;
};

export default RankTableUser;
