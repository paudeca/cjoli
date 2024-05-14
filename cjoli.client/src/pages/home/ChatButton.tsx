import { Button } from "react-bootstrap";
import { ChatLeftDots } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import useUid from "../../hooks/useUid";
import useScreenSize from "../../hooks/useScreenSize";

const ChatButton = () => {
  const navigate = useNavigate();
  const uid = useUid();
  const { isMobile } = useScreenSize();

  return (
    <Button
      onClick={() => navigate(`${uid}/chat`)}
      variant={isMobile ? "primary" : "light"}
    >
      {!isMobile && "Chat with BotAI"} <ChatLeftDots className="mx-1" />
    </Button>
  );
};

export default ChatButton;
