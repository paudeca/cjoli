import React from "react";
import {
  Container,
  Card,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
  Form,
  Stack,
} from "react-bootstrap";
import { Person, Robot, Send } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import useWebSocket, { ReadyState } from "react-use-websocket";
import moment from "moment";
import useUid from "../hooks/useUid";
import { useNavigate } from "react-router-dom";
import useScreenSize from "../hooks/useScreenSize";
import { Trans } from "react-i18next";

interface Message {
  message: string;
  author: "bot" | "user";
  time: Date;
}

const server = import.meta.env.VITE_API_WS;

const ChatPage = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const uid = useUid();
  const { sendMessage, lastMessage, readyState } = useWebSocket<{
    message: string;
  }>(`${server}/chat/${uid}/ws`);
  React.useEffect(() => {
    if (lastMessage != null) {
      setMessages((messages) => [
        ...messages,
        {
          message: lastMessage.data.replaceAll("\n", "<br/>"),
          author: "bot",
          time: new Date(),
        },
      ]);
      window.setTimeout(() => {
        ref.current?.scroll(0, ref.current?.scrollHeight);
      }, 100);
    }
  }, [lastMessage, setMessages]);
  const { register, handleSubmit, resetField } = useForm<Message>();
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { height, isMobile } = useScreenSize();

  const submit = (message: Message) => {
    const msg: Message = { ...message, author: "user", time: new Date() };
    setMessages([...messages, msg]);
    resetField("message");
    sendMessage(msg.message);
  };
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
                  <strong>BotAI</strong>
                </div>
              </div>
            </div>
            <div className="position-relative">
              <div
                className="chat-messages p-4"
                style={{ maxHeight: height - (isMobile ? 220 : 240) }}
                ref={ref}
              >
                {messages.map((m, i) => (
                  <React.Fragment key={i}>
                    {m.author == "user" && (
                      <div className="chat-message-right pt-1">
                        <div>
                          <Person style={{ fontSize: 20 }} className="mx-2" />
                          <div
                            className="text-muted small text-nowrap mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {moment(m.time).format("LT")}
                          </div>
                        </div>
                        <div
                          className="flex-shrink-1 bg-light rounded px-3 mr-3"
                          style={{ fontSize: "12px" }}
                          dangerouslySetInnerHTML={{
                            __html: m.message,
                          }}
                        ></div>
                      </div>
                    )}
                    {m.author == "bot" && (
                      <div className="chat-message-left pt-1">
                        <div>
                          <Robot style={{ fontSize: 20 }} className="mx-2" />
                          <div
                            className="text-muted small text-nowrap mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {moment(m.time).format("LT")}
                          </div>
                        </div>
                        <div
                          className="flex-shrink-1 bg-light rounded px-3 ml-3"
                          style={{ fontSize: "12px" }}
                          dangerouslySetInnerHTML={{
                            __html: m.message,
                          }}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex-grow-0 py-3 px-4 border-top">
              <Form onSubmit={handleSubmit(submit)}>
                {!isMobile && (
                  <InputGroup>
                    <FormControl
                      {...register("message")}
                      style={{ fontSize: "12px" }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={readyState != ReadyState.OPEN}
                      className="px-3"
                    >
                      <Trans i18nKey="button.send">Send</Trans>{" "}
                      <Send className="mx-2" />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => navigate(`/${uid}`)}
                    >
                      <Trans i18nKey="button.close">Close</Trans>
                    </Button>
                  </InputGroup>
                )}
                {isMobile && (
                  <Stack>
                    <FormControl
                      {...register("message")}
                      style={{ fontSize: "12px" }}
                    />
                    <Stack direction="horizontal" className="pt-2">
                      <Button
                        variant="outline-danger"
                        onClick={() => navigate(`/${uid}`)}
                      >
                        <Trans i18nKey="button.close">Close</Trans>
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={readyState != ReadyState.OPEN}
                        className="px-3 ms-auto"
                      >
                        <Trans i18nKey="button.send">Send</Trans>{" "}
                        <Send className="mx-2" />
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default ChatPage;
