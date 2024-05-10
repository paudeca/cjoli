import React from "react";
import {
  Container,
  Card,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";
import { Person, Robot } from "react-bootstrap-icons";

const ChatPage = () => {
  return (
    <Container>
      <Card>
        <Row>
          <Col xs={12}>
            <div className="py-2 px-4 border-bottom d-none d-lg-block">
              <div className="d-flex align-items-center py-1">
                <div className="position-relative">
                  <Robot style={{ fontSize: 40 }} className="mx-2" />
                </div>
                <div className="flex-grow-1 pl-3">
                  <strong>Bot</strong>
                  <div className="text-muted small">
                    <em>Typing...</em>
                  </div>
                </div>
              </div>
            </div>
            <div className="position-relative">
              <div className="chat-messages p-4" style={{ maxHeight: 600 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <React.Fragment key={i}>
                    <div className="chat-message-right pb-4">
                      <div>
                        <Person style={{ fontSize: 40 }} className="mx-2" />
                        <div className="text-muted small text-nowrap mt-2">
                          2:33 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        Lorem ipsum dolor sit amet, vis erat denique in, dicunt
                        prodesset te vix.
                      </div>
                    </div>
                    <div className="chat-message-left pb-4">
                      <div>
                        <Robot style={{ fontSize: 40 }} className="mx-2" />
                        <div className="text-muted small text-nowrap mt-2">
                          2:34 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        Sit meis deleniti eu, pri vidit meliore docendi ut, an
                        eum erat animal commodo.
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex-grow-0 py-3 px-4 border-top">
              <InputGroup>
                <FormControl />
                <Button variant="primary">Send</Button>
              </InputGroup>
            </div>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default ChatPage;
