import { Button } from "react-bootstrap";
import { ChatLeftDots } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import useUid from "../../hooks/useUid";

const ChatButton = () => {
  const navigate = useNavigate();
  const uid = useUid();

  return (
    <div className="my-3 mx-5 position-fixed ffixed-bottom bottom-0 end-0">
      <Button onClick={() => navigate(`${uid}/chat`)}>
        Chat with BotAI <ChatLeftDots className="mx-1" />
      </Button>
    </div>
  );
};

export default ChatButton;
