import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import { Card, Form, Table } from "react-bootstrap";
import LeftCenterDiv from "../components/LeftCenterDiv";
import TeamName from "../components/TeamName";
import { useCJoli } from "../hooks/useCJoli";
import React from "react";
import useUid from "../hooks/useUid";
import * as cjoliService from "../services/cjoliService";
import Loading from "../components/Loading";
import TimeLine from "./rank/TimeLine";
import { Score } from "../models";

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
  const [type, setType] = React.useState<keyof Score>("total");

  return (
    <Loading ready={ready}>
      <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
        <div className="p-2">
          <CJoliCard>
            <Card.Body>
              <Card.Title>Ranking</Card.Title>
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
        <div className="p-2">
          <CJoliCard>
            <Card.Body>
              <Form>
                <Card.Title>
                  <Form.Select
                    onChange={(e) =>
                      setType(e.currentTarget.value as keyof Score)
                    }
                  >
                    <option value="total">Points</option>
                    <option value="game">Parties jouées</option>
                    <option value="win">Victoires</option>
                    <option value="neutral">Parties nulles</option>
                    <option value="loss">Défaites</option>
                    <option value="goalFor">Buts pour</option>
                    <option value="goalAgainst">Buts contre</option>
                    <option value="shutOut">Blanchissages</option>
                    <option value="goalDiff">Goal average</option>
                  </Form.Select>
                </Card.Title>
                <TimeLine type={type} />
              </Form>
            </Card.Body>
          </CJoliCard>
        </div>
      </CJoliStack>
    </Loading>
  );
};

export default RankPage;
