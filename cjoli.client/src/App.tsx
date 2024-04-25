import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider, Global, css } from "@emotion/react";
import styled from "@emotion/styled";
import { Row, Col, Stack, Button, Card, Table, Nav, Badge, Offcanvas, Toast, ToastContainer } from "react-bootstrap";

const MyStack = styled(Stack)`
  background-color: white;
  color: black;
`;

const MyCard = styled(Card)`
  background-color: white;
  border: 3px solid ${(props) => props.theme.colors.secondary};
  & .card-body {
    background-color: #e7e9ee;
  }
  & .card-title {
    color: #65383a;
  }
`;

const MyRow = styled(Row)`
  border: 0px solid black;
  padding-bottom: 3px;
`;

const MyCol = styled(Col)`
  border: 0px solid black;
`;

const MyTh = styled("th")`
  background-color: ${(props) => props.theme.colors.secondary} !important;
  color: white !important;
  text-align: center;
`;

const MyTd = styled("td")`
  background-color: ${(props) => props.theme.colors.secondary} !important;
  color: white !important;
  text-align: center;
`;

const App = () => {
  const theme = {
    colors: {
      primary: "#202644",
      secondary: "#932829",
    },
  };
  const [show, setShow] = React.useState(false);
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            background-color: #202644;
            color: white;
          }
          .btn-primary {
            --bs-btn-bg: #313f69;
            --bs-btn-border-color: #313f69;
            --bs-btn-hover-bg: #2a365c;
            --bs-btn-hover-border-color: #2a365c;
            --bs-btn-active-bg: #394874;
            --bs-btn-active-border-color: #394874;
          }
        `}
      />
      <MyStack gap={0} className='col-md-8 mx-auto mt-5'>
        <div className='p-2'>
          <MyCard>
            <Card.Header>
              <Nav variant='tabs' defaultActiveKey='#first'>
                <Nav.Item>
                  <Nav.Link href='#first'>Phase 1</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href='#link'>Phase 2</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href='#disabled'>Finale</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Card.Title>Poule A</Card.Title>
              <Card.Text>
                <Table striped bordered hover size='sm'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className='w-50'>Team</th>
                      <th>J</th>
                      <th>G</th>
                      <th>N</th>
                      <th>P</th>
                      <MyTh>PTS</MyTh>
                      <th>BP</th>
                      <th>BC</th>
                      <th>+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Wasquehal</td>
                      <td>7</td>
                      <td>12</td>
                      <td>23</td>
                      <td>7</td>
                      <MyTd>7</MyTd>
                      <td>7</td>
                      <td>7</td>
                      <td>7</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Amiens 1</td>
                      <td>7</td>
                      <td>10</td>
                      <td>12</td>
                      <td>7</td>
                      <MyTd>7</MyTd>
                      <td>7</td>
                      <td>7</td>
                      <td>7</td>
                    </tr>
                  </tbody>
                </Table>
                <Button onClick={() => setShow(true)}>Create</Button>
              </Card.Text>
            </Card.Body>
          </MyCard>
        </div>
      </MyStack>

      <Offcanvas show={false && show} onHide={() => setShow(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Create Team</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.</Offcanvas.Body>
      </Offcanvas>

      <ToastContainer position='top-end'>
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
          <Toast.Header>
            <strong className='me-auto'>Bootstrap</strong>
            <small>11 mins ago</small>
          </Toast.Header>
          <Toast.Body>Woohoo, you're reading this text in a Toast!</Toast.Body>
        </Toast>
      </ToastContainer>

      <MyStack gap={0} className='col-md-8 mx-auto mt-5'>
        <div className='p-2'>
          <MyCard>
            <MyRow className='justify-content-md-center pt-4'>
              <MyCol xs={{ span: 6, offset: 3 }} md={{ span: 6, offset: 0 }} lg={{ span: 3, offset: 0 }} className='text-center'>
                <div className='d-grid gap-2 pb-3'>
                  <Button variant='primary'>Save</Button>
                </div>
              </MyCol>
            </MyRow>
            <MyRow className='justify-content-md-center'>
              <MyCol xs='3' className='text-end'>
                Wasquehal
              </MyCol>
              <MyCol xs='6' lg='3' className='text-center'>
                <Badge bg='success'>3</Badge>
                <Badge bg='light' text='black'>
                  <b>-</b>
                </Badge>
                <Badge bg='danger'>0</Badge>
              </MyCol>
              <MyCol xs='3'>Amiens 1</MyCol>
            </MyRow>
            <MyRow className='justify-content-md-center'>
              <MyCol xs='3' className='text-end'>
                Wasquehal
              </MyCol>
              <MyCol xs='6' lg='3' className='text-center'>
                <input type='number' min='0' max='10' style={{ width: "50px" }} />
                <Badge bg='light' text='black'>
                  <b>-</b>
                </Badge>
                <input type='number' min='0' max='100' style={{ width: "50px" }} />
              </MyCol>
              <MyCol xs='3'>Amiens 1</MyCol>
            </MyRow>
            <MyRow className='justify-content-md-center pt-3'>
              <MyCol xs={{ span: 6, offset: 3 }} md={{ span: 6, offset: 0 }} lg={{ span: 3, offset: 0 }} className='text-center'>
                <div className='d-grid gap-2 pb-3'>
                  <Button variant='primary'>Save</Button>
                </div>
              </MyCol>
            </MyRow>
          </MyCard>
        </div>
      </MyStack>
    </ThemeProvider>
  );
};

export default App;
