import { useTranslation } from "react-i18next";
import LeftCenterDiv from "../../components/LeftCenterDiv";
import TeamName from "../../components/TeamName";
import { useCJoli } from "../../hooks/useCJoli";
import { useCallback } from "react";
import { Rank, Score } from "../../models";
import ButtonTeam from "../../components/ButtonTeam";
import RankTable from "./RankTable";

interface RankScore {
  rank?: Rank;
  score?: Score;
}

const useColumnsTourney = () => {
  const { ranking, tourney, getRankPosition, findTeam } = useCJoli();
  const { t } = useTranslation();

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

  const columns = [
    {
      id: "rank",
      label: "#",
      value: ({ rank }: RankScore) => formatRank(rank!.order),
      width: "10%",
    },
    {
      id: "team",
      label: t("rank.team", "Team"),
      value: ({ rank }: RankScore) => {
        const positionId = getRankPosition(rank!);
        const team = findTeam({ positionId });
        return (
          <LeftCenterDiv>
            <TeamName positionId={positionId || 0} defaultName={rank!.name} />
            {team && <ButtonTeam team={team} />}
          </LeftCenterDiv>
        );
      },
      width: "30%",
    },
    {
      id: "total",
      label: t("rank.total", "Points"),
      value: (rank: RankScore) => rank.score?.total,
      focus: true,
      width: "20%",
    },
  ];
  const datas =
    tourney?.ranks.map((rank) => ({
      rank,
      score: ranking?.scores.scoreTeams[rank.teamId],
    })) || [];
  return { columns, datas };
};

const RankTableTourney = () => {
  const { columns, datas } = useColumnsTourney();

  return <RankTable<RankScore> columns={columns} datas={datas} />;
};

export default RankTableTourney;
