import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { Card, Table } from "react-bootstrap";
import LeftCenterDiv from "../components/LeftCenterDiv";
import TeamName from "../components/TeamName";
import { useCJoli } from "../hooks/useCJoli";
import React from "react";
import useUid from "../hooks/useUid";
import * as cjoliService from "../services/cjoliService";
import Loading from "../components/Loading";

const RankPage = () => {
  const { tourney, getRankPosition, loadRanking } = useCJoli();
  const ranks = tourney?.ranks || [];

  const [ready, setReady] = React.useState(false);
  const uid = useUid();

  React.useEffect(() => {
    const call = async () => {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
      setReady(true);
    };
    call();
  }, [loadRanking, uid]);

  return (
    <Loading ready={ready}>
      <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
        <div className="p-2">
          <CJoliCard>
            <Card.Body>
              <Card.Title>Titre</Card.Title>
              <Table
                striped
                bordered
                hover
                size="sm"
                style={{ textAlign: "center" }}
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="w-50">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {ranks.map((rank) => {
                    const positionId = getRankPosition(rank);
                    return (
                      <tr key={rank.id}>
                        <td>{rank.order}</td>
                        <td>
                          <LeftCenterDiv>
                            <TeamName
                              positionId={positionId || 0}
                              defaultName={rank.name}
                            />
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
      </CJoliStack>
    </Loading>
  );
};

export default RankPage;
