import { Card, Table } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import { Trans } from "react-i18next";
import LeftCenterDiv from "../../components/LeftCenterDiv";
import TeamName from "../../components/TeamName";
import { useCJoli } from "../../hooks/useCJoli";
import { useCallback } from "react";
import { Rank } from "../../models";
import ButtonTeam from "../../components/ButtonTeam";

const RankTable = () => {
  const { tourney, getRankPosition, findTeam } = useCJoli();

  const ranks = tourney?.ranks || [];

  const formatRank = useCallback((rank: Rank) => {
    switch (rank.order) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank.order;
    }
  }, []);

  return (
    <div className="p-2">
      <CJoliCard>
        <Card.Body>
          <Card.Title>
            <Trans i18nKey="rank.title">Ranking</Trans>
          </Card.Title>
          <Table
            striped
            bordered
            hover
            responsive
            size="sm"
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                <th style={{ width: "20%" }}>#</th>
                <th className="w-50">
                  <Trans i18nKey="rank.team">Team</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((rank) => {
                const positionId = getRankPosition(rank);
                const team = findTeam({ positionId });
                return (
                  <tr key={rank.id}>
                    <td>{formatRank(rank)}</td>
                    <td>
                      <LeftCenterDiv>
                        <TeamName
                          positionId={positionId || 0}
                          defaultName={rank.name}
                        />
                        {team && <ButtonTeam team={team} />}
                      </LeftCenterDiv>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </CJoliCard>
    </div>
  );
};

export default RankTable;
