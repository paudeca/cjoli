import styled from "@emotion/styled";
import { Row, Col, Button, Badge, Table } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";

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
    getPosition,
    getTeam,
  } = useCJoli();
  return (
    <CJoliStack gap={0} className='col-md-8 mx-auto mt-5'>
      <div className='p-2'>
        <CJoliCard>
          <MyRow className='justify-content-md-center pt-4'>
            <MyCol xs={{ span: 6, offset: 3 }} md={{ span: 6, offset: 0 }} lg={{ span: 3, offset: 0 }} className='text-center'>
              <div className='d-grid gap-2 pb-3'>
                <Button variant='primary'>Save</Button>
              </div>
            </MyCol>
          </MyRow>
          <Table striped bordered hover style={{ textAlign: "center" }}>
            <tbody>
              {matches &&
                matches.map((match) => {
                  const badgeA = match.scoreA > match.scoreB ? "success" : match.scoreA === match.scoreB ? "warning" : "danger";
                  const badgeB = match.scoreA < match.scoreB ? "success" : match.scoreA === match.scoreB ? "warning" : "danger";
                  const textA = badgeA == "warning" ? "black" : "white";
                  const textB = badgeB == "warning" ? "black" : "white";
                  return (
                    <tr key={match.id}>
                      <td>{getTeam(getPosition(match.positionA).teamId).name}</td>
                      <td>
                        {match.done && (
                          <>
                            <Badge bg={badgeA} text={textA} style={{ fontSize: "16px" }}>
                              {match.scoreA}
                            </Badge>
                            <Badge bg='light' text='black'>
                              <b>-</b>
                            </Badge>
                            <Badge bg={badgeB} text={textB} style={{ fontSize: "16px" }}>
                              {match.scoreB}
                            </Badge>
                          </>
                        )}
                        {!match.done && (
                          <>
                            <input type='number' min='0' max='10' style={{ width: "50px" }} />
                            <Badge bg='light' text='black'>
                              <b>-</b>
                            </Badge>
                            <input type='number' min='0' max='100' style={{ width: "50px" }} />
                          </>
                        )}
                      </td>
                      <td>{getTeam(getPosition(match.positionB).teamId).name}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default MatchesStack;
