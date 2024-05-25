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
import { Trans } from "react-i18next";

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
              <Card.Title>
                <Trans i18nKey="rank.title">Ranking</Trans>
              </Card.Title>
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
                    <th className="w-50">
                      <Trans i18nKey="rank.team">Team</Trans>
                    </th>
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
                    <option value="total">
                      <Trans i18nKey="rank.total">Points</Trans>
                    </option>
                    <option value="game">
                      <Trans i18nKey="rank.game">Games played</Trans>
                    </option>
                    <option value="win">
                      <Trans i18nKey="rank.win">Victories</Trans>
                    </option>
                    <option value="neutral">
                      <Trans i18nKey="rank.neutral">Drawn games</Trans>
                    </option>
                    <option value="loss">
                      <Trans i18nKey="rank.loss">Defeats</Trans>
                    </option>
                    <option value="goalFor">
                      <Trans i18nKey="rank.goalFor">Goals for</Trans>
                    </option>
                    <option value="goalAgainst">
                      <Trans i18nKey="rank.goalAgainst">Goals against</Trans>
                    </option>
                    <option value="shutOut">
                      <Trans i18nKey="rank.shutOut">ShutOut</Trans>
                    </option>
                    <option value="goalDiff">
                      <Trans i18nKey="rank.goalDiff">Goal average</Trans>
                    </option>
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
