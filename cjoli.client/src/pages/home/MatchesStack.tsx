import styled from "@emotion/styled";
import { Row, Col, Button, Badge, Table, Accordion } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";
import Loading from "../../components/Loading";
import { Match } from "../../models/Match";
import moment from "moment";
import "moment/dist/locale/fr";

const MyRow = styled(Row)`
  border: 0px solid black;
  padding-bottom: 3px;
`;

const MyCol = styled(Col)`
  border: 0px solid black;
`;

const MatchesStack = () => {
  const {
    state: { matches },
    getSquad,
    getTeamFromPosition,
  } = useCJoli();

  const datas = matches?.reduce<Record<string, Match[]>>((acc, m) => {
    const time = moment(m.time);
    const date = time.format("yyyy-MM-DD");
    if (!acc[date]) {
      acc = { ...acc, [date]: [] };
    }
    acc[date] = [...acc[date], m];
    return acc;
  }, {});
  const keys = Object.keys(datas || {});
  keys.sort();
  moment.locale("fr");

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!matches}>
            <MyRow className="justify-content-md-center pt-4">
              <MyCol
                xs={{ span: 6, offset: 3 }}
                md={{ span: 6, offset: 0 }}
                lg={{ span: 3, offset: 0 }}
                className="text-center"
              >
                <div className="d-grid gap-2 pb-3">
                  <Button variant="primary">Save</Button>
                </div>
              </MyCol>
            </MyRow>
            <Accordion defaultActiveKey="0">
              {keys.map((key, index) => {
                const datasOrder = datas ? datas[key] : [];
                datasOrder.sort((a, b) =>
                  a.time > b.time ? 1 : a.time == b.time ? 0 : -1
                );
                return (
                  <Accordion.Item key={index} eventKey={index.toString()}>
                    <Accordion.Header>
                      {moment(key).format("dddd LL")}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table
                        striped
                        bordered
                        hover
                        style={{ textAlign: "center" }}
                      >
                        <tbody>
                          {datasOrder.map((match, i) => {
                            const badgeA =
                              match.scoreA > match.scoreB
                                ? "success"
                                : match.scoreA === match.scoreB
                                ? "warning"
                                : "danger";
                            const badgeB =
                              match.scoreA < match.scoreB
                                ? "success"
                                : match.scoreA === match.scoreB
                                ? "warning"
                                : "danger";
                            const textA =
                              badgeA == "warning" ? "black" : "white";
                            const textB =
                              badgeB == "warning" ? "black" : "white";
                            return (
                              <tr key={match.id}>
                                {i % 2 == 0 && (
                                  <td rowSpan={2}>
                                    {moment(match.time).format("LT")}
                                  </td>
                                )}
                                <td>{getSquad(match.squadId)!.name}</td>
                                <td>
                                  {
                                    getTeamFromPosition(
                                      match.positionA,
                                      match.squadId
                                    )?.name
                                  }
                                </td>
                                <td>
                                  {match.done && (
                                    <>
                                      <Badge
                                        bg={badgeA}
                                        text={textA}
                                        style={{ fontSize: "16px" }}
                                      >
                                        {match.scoreA}
                                      </Badge>
                                      <Badge bg="light" text="black">
                                        <b>-</b>
                                      </Badge>
                                      <Badge
                                        bg={badgeB}
                                        text={textB}
                                        style={{ fontSize: "16px" }}
                                      >
                                        {match.scoreB}
                                      </Badge>
                                    </>
                                  )}
                                  {!match.done && (
                                    <>
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        style={{ width: "50px" }}
                                      />
                                      <Badge bg="light" text="black">
                                        <b>-</b>
                                      </Badge>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        style={{ width: "50px" }}
                                      />
                                    </>
                                  )}
                                </td>
                                <td>
                                  {
                                    getTeamFromPosition(
                                      match.positionB,
                                      match.squadId
                                    )?.name
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
            <MyRow className="justify-content-md-center pt-4">
              <MyCol
                xs={{ span: 6, offset: 3 }}
                md={{ span: 6, offset: 0 }}
                lg={{ span: 3, offset: 0 }}
                className="text-center"
              >
                <div className="d-grid gap-2 pb-3">
                  <Button variant="primary">Save</Button>
                </div>
              </MyCol>
            </MyRow>
          </Loading>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default MatchesStack;
