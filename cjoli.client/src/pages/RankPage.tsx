import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { Card, Table } from "react-bootstrap";
import LeftCenterDiv from "../components/LeftCenterDiv";
import TeamName from "../components/TeamName";
import { useCJoli } from "../hooks/useCJoli";

const RankPage = () => {
  const { tourney, getRankPosition } = useCJoli();
  const ranks = tourney?.ranks || [];
  return (
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
                          {rank.name}
                          <TeamName positionId={positionId || 0} />
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
  );
};

export default RankPage;
